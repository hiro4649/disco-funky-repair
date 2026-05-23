import { Request, Response } from 'express';
import { Server, Namespace } from 'socket.io';
import moment from 'moment';
import prisma from '../db/prisma_client';

enum GAME_STATUS {
  WAITTING = 0,
  PLAYING = 1,
  GAMEOVER = 2,
}

interface Player {
  playerID: string;
  name: string;
  avatar?: string;
  crashPoint: number;
  betAmount: number;
  currencyId: string;
}

// Provably fair random number generation
const generatePrivateSeedHashPair = () => {
  const privateSeed = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const privateHash = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  return { privateSeed, privateHash };
};

const generateCrashRandom = (privateSeed: string, publicSeed: string): number => {
  // Simple hash-based random generation
  const combined = privateSeed + publicSeed;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash) / 2147483647; // Normalize to 0-1
};

const generateCrashPoint = (privateSeed: string, publicSeed: string): number => {
  const random = generateCrashRandom(privateSeed, publicSeed);
  if (random < 0.1) return 1.01 + Math.random() * 0.19; // 10% chance: 1.01x - 1.20x
  if (random < 0.3) return 1.20 + Math.random() * 0.30; // 20% chance: 1.20x - 1.50x
  if (random < 0.5) return 1.50 + Math.random() * 0.50; // 20% chance: 1.50x - 2.00x
  if (random < 0.7) return 2.00 + Math.random() * 1.00; // 20% chance: 2.00x - 3.00x
  if (random < 0.85) return 3.00 + Math.random() * 2.00; // 15% chance: 3.00x - 5.00x
  if (random < 0.95) return 5.00 + Math.random() * 5.00; // 10% chance: 5.00x - 10.00x
  return 10.00 + Math.random() * 90.00; // 5% chance: 10.00x - 100.00x
};

const growthFunc = (ms: number): number =>
  Math.floor(100 * Math.pow(Math.E, 0.0001 * ms));

const inverseGrowth = (result: number): number =>
  16666.666667 * Math.log(0.01 * result);

// Helper functions for user balance management
const getUserBalance = async (walletAddress: string): Promise<number> => {
  const user = await prisma.user.findUnique({
    where: { wallet_address: walletAddress.toLowerCase() },
    select: { disco_balance: true }
  });
  return user?.disco_balance || 0;
};

const updateUserBalance = async (walletAddress: string, amount: number, type: 'BET' | 'WIN' | 'CASHOUT' | 'REFUND', gameId?: string) => {
  const user = await prisma.user.findUnique({
    where: { wallet_address: walletAddress.toLowerCase() }
  });

  if (!user) {
    throw new Error('User not found');
  }

  const balanceBefore = user.disco_balance;
  const balanceAfter = balanceBefore + amount;

  // Update user balance
  await prisma.user.update({
    where: { wallet_address: walletAddress.toLowerCase() },
    data: { disco_balance: balanceAfter }
  });

  // Create transaction record
  await prisma.discoTransactions.create({
    data: {
      userId: user.id,
      type: type,
      amount: Math.abs(amount),
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      game: 'Crash',
      game_id: gameId || '',
      status: 'COMPLETED'
    }
  });

  return { balanceBefore, balanceAfter };
};

const calculateGamePayout = (ms: number): number => {
  const gamePayout = Math.floor(100 * growthFunc(ms)) / 100;
  return Math.max(gamePayout, 1);
};

const RESTART_WAIT_TIME = 6000;
const START_WAIT_TIME = 4000;
const TICK_RATE = 150;

class CrashEngine {
  game_status: GAME_STATUS = GAME_STATUS.WAITTING;
  players: Player[] = [];
  pending: Player[] = [];
  multiplier = 1.0;
  crashPoint: number = 1;
  maxBet: number = 1000;
  minBet: number = 1;
  wattingTime: number = 10000;
  overDelayTime: number = 500;
  statustime: number = 0;
  fps: number = 1000 / 30;
  io: Namespace;
  totalProfit: number = 0;
  loseProfit: number = 0;
  gameId: string = "";
  active: boolean = true;
  privateSeed: string = "";
  privateHash: string = "";
  publicSeed: string = "";
  startedAt: Date = moment.utc().toDate();
  duration: number = 0;
  at: number = 0;

  constructor(_io: Namespace) {
    this.io = _io;
    this.statustime = moment.utc().valueOf();
    this.handleStatus(GAME_STATUS.WAITTING);
  }

  handleStatus(status: GAME_STATUS) {
    switch (status) {
      case GAME_STATUS.WAITTING:
        this.initGame();
        break;
      case GAME_STATUS.PLAYING:
        this.startGame();
        break;
      case GAME_STATUS.GAMEOVER:
        setTimeout(() => {
          this.handleStatus(GAME_STATUS.WAITTING);
        }, START_WAIT_TIME);
        break;
    }
    this.game_status = status;
  }

  // Init the gamemode
  async initGame() {
    // Generate provably fair seeds
    const { privateSeed, privateHash } = generatePrivateSeedHashPair();
    this.privateSeed = privateSeed;
    this.privateHash = privateHash;
    this.publicSeed = Math.random().toString(36).substring(2, 15);

    this.crashPoint = 1;
    this.players = [...this.pending];
    this.pending = [];
    this.gameId = `game_${moment.utc().valueOf()}`;

    // Always emit game events, even if no players
    this.io.emit(
      "game-bets",
      this.players.map((p) => [
        {
          playerID: p.playerID,
          name: p.name,
          betAmount: p.betAmount,
          currencyId: p.currencyId,
        },
      ])
    );

    this.io.emit("game-starting", {
      _id: this.gameId,
      privateHash: this.privateHash,
      publicSeed: this.publicSeed,
      timeUntilStart: RESTART_WAIT_TIME,
    });

    // console.log(`🎮 Initializing crash game ${this.gameId}`);
    // console.log(`📡 Emitted game-starting event for game ${this.gameId}`);
    // console.log(`Crash game ${this.gameId} starting in ${RESTART_WAIT_TIME}ms with ${this.players.length} players`);

    setTimeout(() => {
      this.handleStatus(GAME_STATUS.PLAYING);
    }, RESTART_WAIT_TIME - 500);
  }

  async startGame() {
    // Generate crash point using provably fair method
    this.crashPoint = generateCrashPoint(this.privateSeed, this.publicSeed);
    this.duration = Math.ceil(inverseGrowth(this.crashPoint * 100));
    this.startedAt = moment.utc().toDate();

    // console.log(`🚀 Starting crash game ${this.gameId} with crash point ${this.crashPoint.toFixed(2)}x`);

    // Emit start to clients
    this.io.emit("game-start", {
      publicSeed: this.publicSeed,
      privateHash: this.privateHash,
    });

    // console.log(`📡 Emitted game-start event for game ${this.gameId}`);

    this.callTick(0);
  }

  // Calculate next tick time
  callTick(elapsed: number) {
    const left = this.duration - elapsed;
    const nextTick = Math.max(0, Math.min(left, TICK_RATE));
    setTimeout(() => {
      this.runTick();
    }, nextTick);
  }

  // Run the current tick
  runTick = (): void => {
    const elapsed = moment.utc().valueOf() - moment.utc(this.startedAt || moment.utc().valueOf()).valueOf();
    const at = growthFunc(elapsed);
    this.at = at;

    // Completing all auto cashouts
    this.runCashOuts(at);

    // Check if crash point is reached
    if (at > this.crashPoint * 100) {
      this.gameOver();
    } else {
      this.tick(elapsed);
    }
  };

  // Emits game tick to client
  tick(elapsed: number) {
    const payout = calculateGamePayout(elapsed) / 100;
    this.io.emit("game-tick", payout);
    this.callTick(elapsed);
  }

  runCashOuts(elapsed: number) {
    this.players = this.players.filter((bet) => {
      if (
        bet.crashPoint >= 101 &&
        bet.crashPoint <= elapsed &&
        bet.crashPoint <= this.crashPoint * 100
      ) {
        this.winPlayer(bet, bet.crashPoint);
        return false;
      }
      return true;
    });
  }

  async gameOver() {
    this.players = this.players.filter((player) => {
      this.lossPlayer(player);
      return false;
    });

    this.io.emit("game-end", {
      game: {
        _id: this.gameId,
        createdAt: this.startedAt,
        privateSeed: this.privateSeed,
        publicSeed: this.publicSeed,
        crashPoint: this.crashPoint,
      },
    });

    // console.log(`Crash game ${this.gameId} ended at ${this.crashPoint.toFixed(2)}x`);

    this.handleStatus(GAME_STATUS.GAMEOVER);
  }

  async bet(
    playerID: string,
    address: string,
    betAmount: number,
    currencyId: string,
    crashPoint: number,
    socket: any,
    avatar?: string | undefined,
  ) {
    if (betAmount < this.minBet) {
      // console.log("game-join-error", `Minimum bet amount is ${this.minBet}`)
      return socket.emit("game-join-error", { msg: `Minimum bet amount is ${this.minBet}` });
    }
    if (betAmount > this.maxBet) {
      // console.log("game-join-error", `Maximum bet amount is ${this.maxBet}`)
      return socket.emit("game-join-error", { msg: `Maximum bet amount is ${this.maxBet}` });
    }

    try {
      // Check if player has sufficient balance
      const currentBalance = await getUserBalance(address);
      if (currentBalance < betAmount) {
        // console.log("game-join-error", "Insufficient balance======", betAmount, address, currentBalance)
        return socket.emit("game-join-error", { msg: "Insufficient balance" });
      }

      // Deduct balance
      await updateUserBalance(address, -betAmount, 'BET', this.gameId);

      if (this.game_status === GAME_STATUS.WAITTING) {
        this.players.push({
          playerID,
          name: playerID,
          avatar,
          betAmount,
          currencyId,
          crashPoint,
        });

        this.io.emit("game-bets", [
          {
            playerID,
            name: playerID,
            betAmount,
            avatar,
            currencyId,
            stoppedAt: 0,
            target: crashPoint / 100
          },
        ]);

        socket.emit("game-join-success", {
          playerID,
          name: playerID,
          betAmount,
          avatar,
          currencyId,
          stoppedAt: 0,
        });
      } else {
        const index = this.pending.findIndex((p) => p.playerID === playerID);
        if (index !== -1) {
          // console.log("game-join-error", "Already Joined")
          return socket.emit("game-join-error", { msg: "Already Joined" });
        }

        this.pending.push({
          playerID,
          name: playerID,
          avatar,
          betAmount,
          currencyId,
          crashPoint,
        });

        socket.emit("game-join-success", {
          playerID,
          name: playerID,
          avatar,
          betAmount,
          currencyId,
          crashPoint,
        });
      }
    } catch (error) {
      console.error('Error processing bet:', error);
      // console.log("game-join-error", "Internal server error")
      socket.emit("game-join-error", { msg: "Internal server error" });
    }
  }

  async cancelBet(playerID: string, socket: any) {
    let index = this.pending.findIndex((p) => p.playerID === playerID);
    if (index !== -1) {
      const player = this.pending[index];
      this.pending.splice(index, 1);

      try {
        // Refund the bet amount
        await updateUserBalance(playerID, player.betAmount, 'REFUND', this.gameId);
      } catch (error) {
        console.error('Error processing refund:', error);
      }

      socket.emit("game-cancel-success");
      return;
    }

    index = this.players.findIndex((p) => p.playerID === playerID);
    if (index !== -1) {
      if (this.game_status === GAME_STATUS.WAITTING) {
        const player = this.players[index];
        this.players.splice(index, 1);

        try {
          // Refund the bet amount
          await updateUserBalance(playerID, player.betAmount, 'REFUND', this.gameId);
        } catch (error) {
          console.error('Error processing refund:', error);
        }

        socket.emit("game-cancel-success");
        return;
      }
    }
  }

  async cashout(playerID: string, socket: any) {
    if (this.game_status !== GAME_STATUS.PLAYING)
      return socket.emit("bet-cashout-error");

    const index = this.players.findIndex((p) => p.playerID === playerID);
    if (index === -1) return;

    const player = this.players[index];
    const winnings = (this.at / 100) * player.betAmount;

    try {
      // Add winnings to user balance
      await updateUserBalance(playerID, winnings, 'CASHOUT', this.gameId);

      this.winPlayer({ ...player }, this.at);
      this.players.splice(index, 1);
      socket.emit("bet-cashout-success");
    } catch (error) {
      console.error('Error processing cashout:', error);
      socket.emit("bet-cashout-error", { msg: "Internal server error" });
    }
  }

  async winPlayer(player: Player, crashPoint: number) {
    this.io.emit("bet-cashout", [
      {
        playerID: player.playerID,
        name: player.playerID,
        avatar: player.avatar,
        betAmount: player.betAmount,
        currencyId: player.currencyId,
        stoppedAt: crashPoint,
      },
    ]);

    this.loseProfit += player.betAmount;
    // console.log("Winner-->", player, crashPoint);
  }

  async lossPlayer(player: Player) {
    this.totalProfit += player.betAmount;
    // console.log("Loss", player, this.crashPoint);
  }
}

export class CrashGameController {
  private static gameEngine: CrashEngine | null = null;

  static initializeGameEngine(io: Namespace) {
    if (!this.gameEngine) {
      this.gameEngine = new CrashEngine(io);
    }
    return this.gameEngine;
  }

  static getGameEngine(): CrashEngine | null {
    return this.gameEngine;
  }

  // Get game history (mock data for now)
  static async getGames(req: Request, res: Response): Promise<Response> {
    try {
      // Return mock game history
      const mockHistory = Array.from({ length: 10 }, (_, i) => ({
        _id: `game_${moment.utc().valueOf() - i * 60000}`,
        startedAt: moment.utc().subtract(i, 'minutes').toISOString(),
        privateSeed: Math.random().toString(36).substring(2, 15),
        publicSeed: Math.random().toString(36).substring(2, 15),
        crashPoint: generateCrashPoint(Math.random().toString(36), Math.random().toString(36)),
      }));

      return res.status(200).json({
        success: true,
        data: mockHistory
      });

    } catch (error) {
      console.error('Error fetching games:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch games',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

// Initialize the crash game server
export const initCrashServer = (io: Server) => {
  const crashNamespace = io.of("/crashx");
  const gameEngine = new CrashEngine(crashNamespace);

  // console.log('🎮 Crash game server initialized and running...');
  // console.log('🔗 Socket.IO namespace "/crashx" created');

  crashNamespace.on("connection", (socket) => {
    let playerID = socket.id;
    // console.log(`🔌 Player ${playerID} connected to crash game namespace`);

    socket.on("auth", async (token: string) => {
      // console.log('Auth token:', token);
    });

    socket.on("join-game", async (address: string, target: number, betAmount: number, currencyId: string) => {
      // console.log(`Player ${playerID} joining game: ${betAmount} ${currencyId} at ${target}x`);
      await gameEngine.bet(playerID, address, betAmount, currencyId, target, socket);
    });

    socket.on("cancel-game", async () => {
      // console.log(`Player ${playerID} canceling bet`);
      await gameEngine.cancelBet(playerID, socket);
    });

    socket.on("bet-cashout", async () => {
      // console.log(`Player ${playerID} cashing out`);
      await gameEngine.cashout(playerID, socket);
    });

    socket.on("games", async () => {
      // console.log(`📊 Player ${playerID} requested game data`);
      const gameData = {
        _id: gameEngine.gameId,
        privateSeed: gameEngine.privateSeed,
        publicSeed: gameEngine.publicSeed,
        players: gameEngine.players.map((p) => [
          {
            playerID: p.playerID,
            name: p.name,
            avatar: p.avatar,
            betAmount: p.betAmount,
            currencyId: p.currencyId,
            target: p.crashPoint
          },
        ]),
        history: [], // Mock history for now
        elapsed: moment.utc().valueOf() - moment.utc(gameEngine.startedAt || moment.utc().valueOf()).valueOf(),
        status: gameEngine.game_status === 0 ? 1 :
          gameEngine.game_status === 1 ? 3 : 4,
        // Debug info
        backend_status: gameEngine.game_status,
      };

      // console.log(`📤 Sending game data to player ${playerID}:`, gameData);
      socket.emit("games", gameData);
    });

    socket.on("disconnect", () => {
      // console.log(`Player ${playerID} disconnected from crash game`);
    });
  });
};
