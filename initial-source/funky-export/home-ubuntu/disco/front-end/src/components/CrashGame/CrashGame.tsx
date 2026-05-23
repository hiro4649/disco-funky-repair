"use client";
import React, { useEffect, useRef, useState } from "react"
import moment from "moment";
// import toast from "react-hot-toast";

// import { crashXSocket as socket } from "../../utils/socket";
import SwitchTab from "./components/SwitchTap";
import BetAmountInput from "./components/AmountInput";
import MultiplierInput from "./components/MultiplierInput";
import ProfitAmount from "./components/ProfitAmount";
import BetButton from "./components/Button";
import CurrentBets from "./components/CurrentBets";
import CrashXCanvas from "./CrashXCanvas"
import StopProfitAmount from "./components/StopAmount";
// Audio files are in public directory, so we reference them directly
const placebet = "/audio/crash-game/placebet.wav";
const error = "/audio/crash-game/error.wav";
const success = "/audio/crash-game/success.wav";
const crash = "/audio/crash-game/crash.wav";
import AutoBetCountInput from "./components/BetNumberInput";
import VerifyModal from "./components/VerifyModal";
import GameHistory from "./components/GameHistory";
import DiscoWallet from "./components/DiscoWallet";
// import FairnessView from "./components/FairnessView";
import { EthSvg, InfinitySvg } from "./components/svgs";
import useIsMobile from "./components/useIsMobile";
import { useAppKitAccount } from "@reown/appkit/react";
import { useUserBalance } from './components/useUserBalance';
import axiosServices from "../../../utils/apiClient";
import toast from "react-hot-toast";

import io from 'socket.io-client';

// Export individual socket connections
const apiUrl = `${process.env.NEXT_PUBLIC_SOCKET_API_URL}`;
console.log("🔗 Connecting to crash game socket at:", `${apiUrl}/crashx`);
export const crashSocket = io(`${apiUrl}/crashx`);

const GAME_STATES = {
    NotStarted: 1,
    Starting: 2,
    InProgress: 3,
    Over: 4,
    Blocking: 5,
    Refunded: 6,
};

// Audio files will be initialized in useEffect

const SelectedPaymentIcon = ({ currency }: any) => {
    if (currency && currency?.symbol) {
        return <img src="/images/logo/logo.png" className="w-6 h-6" alt="currency" />;
    } else {
        return <img src="/images/logo/logo.png" className="w-6 h-6" alt="currency" />;

    }
};

const playSound = (audioFile: any) => {
    try {
        // Reset audio to beginning
        audioFile.currentTime = 0;

        // Play with proper error handling
        audioFile.play();
    } catch (error) {
        console.log('Audio play error:', error);
    }
};

interface CrashGameProps {
    triggerBalanceRefresh?: () => void;
}
const currency = process.env.NEXT_PUBLIC_APP_NAME;

const CrashGame: React.FC<CrashGameProps> = (props) => {
    const { triggerBalanceRefresh } = props;
    const isMobile = useIsMobile()

    const [activeTab, setActiveTab] = useState(0);

    const [subActiveTab, setSubActiveTab] = useState(0);

    const [gameId, setGameId] = useState("");
    const [privateHash, setPrivateHash] = useState("");
    const [publicSeed, setPublicSeed] = useState("");

    const [betAmount, setBetAmount] = useState(0);
    const [target, setTarget] = useState(2);

    const [autoBetCount, setAutoCount] = useState(0);
    const [stopProfitA, setStopPorfitA] = useState(0);
    const [stopLossA, setStopLossA] = useState(0);

    const [joining, setJoining] = useState(false);
    const [plannedBet, setPlannedBet] = useState(false);
    const [autoBetEnabled, setAutoBetEnabled] = useState(false);
    const [autoCashoutEnabled, setAutoCashoutEnabled] = useState(false);

    const [players, setPlayers] = useState<any[]>([]);
    const [startTime, setStartTime] = useState<any>(null);
    const [gameState, setGameState] = useState(GAME_STATES.NotStarted);
    const [payout, setPayout] = useState(1);
    const [crashed, setCrashed] = useState(false);
    const [betting, setBetting] = useState(false);
    const [cashedOut, setCashedOut] = useState(false);
    const [amountInputFlag, setAmountInputFlag] = useState(true);

    const [savebetAmount, setBetSaveAmount] = useState(0);
    const [history, setHistory] = useState<any>([]);

    const [verifyId, setGameVerifyId] = useState("");

    const betCountRef = useRef(0);
    const stopOnProfit = useRef(0);
    const stopOnLoss = useRef(0);
    const selfId = useRef();
    const savedTarget = useRef(0);
    const [privateSeed, setPrivateSeed] = useState("");

    const { address, isConnected } = useAppKitAccount();
    const { discoBalance, loading: balanceLoading, fetchBalance } = useUserBalance();

    // Audio refs
    const errorAudioRef = useRef<HTMLAudioElement | null>(null);
    const placebetAudioRef = useRef<HTMLAudioElement | null>(null);
    const successAudioRef = useRef<HTMLAudioElement | null>(null);
    const crashAudioRef = useRef<HTMLAudioElement | null>(null);

    // Initialize audio files
    useEffect(() => {
        if (typeof window !== 'undefined') {
            errorAudioRef.current = new Audio(error);
            placebetAudioRef.current = new Audio(placebet);
            successAudioRef.current = new Audio(success);
            crashAudioRef.current = new Audio(crash);

            // Preload audio files
            errorAudioRef.current.load();
            placebetAudioRef.current.load();
            successAudioRef.current.load();
            crashAudioRef.current.load();

            // Set audio properties for better compatibility
            [errorAudioRef.current, placebetAudioRef.current, successAudioRef.current, crashAudioRef.current].forEach(audio => {
                audio.preload = 'auto';
                audio.volume = 0.5; // Set volume to 50%
            });
        }
    }, []);

    // Initialize audio context on first user interaction
    useEffect(() => {
        const handleUserInteraction = () => {
            // Try to play a silent audio to unlock audio context
            const silentAudio = new Audio();
            silentAudio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
            silentAudio.play().catch(() => {
                // Ignore errors for silent audio
            });

            // Remove event listeners after first interaction
            document.removeEventListener('click', handleUserInteraction);
            document.removeEventListener('keydown', handleUserInteraction);
            document.removeEventListener('touchstart', handleUserInteraction);
        };

        // Add event listeners for user interaction
        document.addEventListener('click', handleUserInteraction);
        document.addEventListener('keydown', handleUserInteraction);
        document.addEventListener('touchstart', handleUserInteraction);

        return () => {
            document.removeEventListener('click', handleUserInteraction);
            document.removeEventListener('keydown', handleUserInteraction);
            document.removeEventListener('touchstart', handleUserInteraction);
        };
    }, []);

    // Emit new bet event
    const clickBet = async () => {
        if (!isConnected) {
            toast.error('Please connect your wallet');
            return;
        }
        console.log(betAmount, discoBalance, 'asdfadsfdf')
        if (betAmount <= 0 || betAmount > discoBalance) {
            toast.error('Invalid bet amount');
            setAmountInputFlag(false);
            return;
        }
        if (betAmount < 1) {
            toast.error('Minimum bet amount is 1');
            setAmountInputFlag(false);
            return;
        }
        // 1. Call /user-manage/bet

        // 2. Proceed with game bet logic (socket emit)
        betCountRef.current = autoBetCount;
        stopOnProfit.current = stopProfitA;
        stopOnLoss.current = stopLossA;
        if (gameState === GAME_STATES.Starting) {
            console.log("clickBet =================== 11111111111111")
            const betRes = await axiosServices.post('/user-manage/bet', {
                wallet_address: address,
                currency,
                amount: betAmount,
                game: 'Crash',
            });
            if (!betRes.data || !betRes.data.success) {
                toast.error(betRes.data?.message || 'Bet failed');
                await fetchBalance();
                return;
            }
            setJoining(true);
            savedTarget.current = target * 100;
            console.log("onGameStarting clickBet =================== join game here")
            crashSocket.emit(
                "join-game",
                address,
                target * 100,
                betAmount,
                currency
            );

        } else {
            console.log("clickBet =================== 2222222222222222")
            if (plannedBet) {
                console.log("clickBet =================== 3333333333333333")
                savedTarget.current = 0;
                setPlannedBet(false);
            } else if (autoBetEnabled) {
                console.log("clickBet =================== 4444444444444444")
                // For auto-betting, set the saved bet amount and target
                savedTarget.current = target * 100;
                setBetSaveAmount(Number(betAmount));
            } else {
                console.log("clickBet =================== 5555555555555555")
                const betRes = await axiosServices.post('/user-manage/bet', {
                    wallet_address: address,
                    currency,
                    amount: betAmount,
                    game: 'Crash',
                });
                if (!betRes.data || !betRes.data.success) {
                    toast.error(betRes.data?.message || 'Bet failed');
                    await fetchBalance();
                    return;
                }
                savedTarget.current = target * 100;
                setBetSaveAmount(Number(betAmount))
                setPlannedBet(true);
            }
        }
        await fetchBalance();
    };

    // Switch to auto betting
    const handleAutoBetChange = (value: any) => {
        setAutoBetEnabled(value);
        setPlannedBet(false);
    };

    // Emit bet cashout
    const clickCashout = () => {
        crashSocket.emit("bet-cashout");
    };

    // handle target value
    const onTargetChange = (value: any) => {
        setTarget(value);
    };


    // Ensure bet amount never goes below 1
    useEffect(() => {
        if (betAmount < 1) {
            setBetAmount(1);
        }
    }, [betAmount]);

    // Helper function to validate and set bet amount
    const setValidBetAmount = (amount: number) => {
        const validAmount = Math.max(1, amount);
        setBetAmount(validAmount);
    };

    useEffect(() => {
        // Add new player to the current game
        const addNewPlayer = (player: any) => {
            setPlayers((state) => [...state, player]);
        };

        // New round is starting handler
        const onGameStarting = async (data: any) => {
            // Update state
            setGameId(data?._id);
            setStartTime(
                moment.utc().add(moment.utc(data.timeUntilStart).valueOf(), 'milliseconds').toDate()
            );
            setGameState(GAME_STATES.Starting);
            setPrivateSeed("");
            setPublicSeed(data.publicSeed);
            setPrivateHash(data.privateHash);
            setPayout(1);
            setPlayers([]);

            setCrashed(false);

            /// auto betting
            if (autoBetEnabled) {
                console.log(savedTarget.current, savebetAmount);
                // check stop on profit amount
                if (stopProfitA !== 0 && stopOnProfit.current <= 0) {
                    setAutoBetEnabled(false)
                    return;
                }
                // check stop on loss amount
                if (stopLossA !== 0 && stopOnLoss.current <= 0 && Math.abs(stopOnLoss.current) > Math.abs(stopOnProfit.current)) {
                    setAutoBetEnabled(false)
                }

                // For auto-betting, we need to call the bet API for each round to ensure real money is deducted
                try {
                    if (!isConnected) {
                        toast.error('Please connect your wallet');
                        setAutoBetEnabled(false);
                        return;
                    }
                    const betRes = await axiosServices.post('/user-manage/bet', {
                        wallet_address: address,
                        currency,
                        amount: savebetAmount,
                        game: 'Crash',
                    });
                    if (!betRes.data || !betRes.data.success) {
                        toast.error(betRes.data?.message || 'Auto bet failed');
                        setAutoBetEnabled(false);
                        return;
                    }
                } catch (error) {
                    toast.error('Auto bet failed');
                    setAutoBetEnabled(false);
                    return;
                }

                setJoining(true);
                console.log("onGameStarting autobet =================== join game here")
                // Emit new bet event
                crashSocket.emit(
                    "join-game",
                    address,
                    savedTarget.current,
                    savebetAmount,
                    currency
                );

                //Check the number of bets. If the number of bets is 0, it is infinite.

                if (betCountRef.current > 0) {
                    betCountRef.current--
                    setAutoCount(betCountRef.current)
                    if (
                        betCountRef.current === 0
                    ) {
                        setAutoBetEnabled(false);
                        savedTarget.current = 0;
                    }
                }
            } else if (plannedBet) {
                setJoining(true);

                console.log("onGameStarting plannedBet =================== join game here")
                // Emit new bet event
                crashSocket.emit(
                    "join-game",
                    address,
                    savedTarget.current,
                    betAmount,
                    currency
                );
                savedTarget.current = 0;
                // Reset planned bet
                setPlannedBet(false);
            }
        };

        // New round started handler
        const onGameStart = (data: any) => {
            // Update state
            setStartTime(Date.now());
            setGameState(GAME_STATES.InProgress);
            setPublicSeed(data.publicSeed);
            setPrivateHash(data.privateHash);
            setCrashed(false);

            // If player was joining, now they are betting
            if (joining) {
                console.log("onGameStart =================== here made false");
                setJoining(false);
                setBetting(true);
            }
        };

        // Current round ended handler
        const onGameEnd = ({ game }: any) => {
            setGameState(GAME_STATES.Over);
            setCrashed(true);
            setPayout(game.crashPoint);
            setPublicSeed(game.publicSeed);
            setPrivateSeed(game.privateSeed);
            setBetting(false);
            console.log("onGameEnd =================== here made false");
            setJoining(false);
            playSound(crashAudioRef.current);
            setCashedOut(false);
            addGameToHistory(game);

            // Refresh balance after game ends, especially important for auto-betting
            if (triggerBalanceRefresh) triggerBalanceRefresh();
        };

        // Current round tick handler
        const onGameTick = (payoutData: any) => {
            if (gameState !== GAME_STATES.InProgress) return;
            setPayout(payoutData);
        };

        // Error event handler
        const joinError = (msg: string) => {
            if (msg === "You are not logged in!") {
                crashSocket.emit("auth", 'token');
                // toast.error("please try again");
            } else {
                // toast.error(msg);
            }
            console.log("joinError =================== here made false");
            setJoining(false);
            playSound(errorAudioRef.current);
        };

        // Success event handler
        const joinSuccess = (bet: any) => {
            console.log("joinSuccess =================== here made false");
            setJoining(false);
            setBetting(true);
            selfId.current = bet.playerID;
            // For auto-betting, use savebetAmount; for manual betting, use betAmount
            if (autoBetEnabled) {
                setBetSaveAmount(Number(savebetAmount));
            } else {
                setBetSaveAmount(Number(betAmount));
            }
            // toast.success("Successfully joined the game!");
            playSound(placebetAudioRef.current);
            if (autoBetEnabled && stopLossA !== 0) {
                stopOnLoss.current -= bet.betAmount;
            }
            if (triggerBalanceRefresh) triggerBalanceRefresh();
        };

        // New game bets handler
        const onGameBets = (bets: any[]) => {
            bets.forEach((bet) => addNewPlayer(bet));
        };


        // New cashout handler
        const onBetCashout = async (bet: any) => {
            if (autoBetEnabled && bet[0].playerID === selfId.current && stopProfitA !== 0) {
                stopOnProfit.current -= (bet[0].betAmount * bet[0].stoppedAt)
            }
            // Check if local user cashed out
            setCashedOut(true);
            // Update state
            if (bet[0]) {
                setPlayers((state) =>
                    state.map((player) =>
                        player.playerID === bet[0].playerID
                            ? Object.assign(player, bet[0])
                            : player
                    )
                );
            }

            // For auto-cashout, we need to call the cashout API to credit the user's balance
            if (bet[0] && bet[0].playerID === selfId.current && isConnected) {
                try {
                    const cashoutAmount = bet[0].stoppedAt / 100 * bet[0].betAmount;
                    const cashoutRes = await axiosServices.post('/user-manage/cashout', {
                        wallet_address: address,
                        currency,
                        amount: cashoutAmount,
                        game: 'Crash',
                    });
                    if (!cashoutRes.data || !cashoutRes.data.success) {
                        toast.error(cashoutRes.data?.message || 'Auto cashout failed');
                    } else {
                        // Refresh balance after successful auto-cashout
                        await fetchBalance();
                        if (triggerBalanceRefresh) triggerBalanceRefresh();
                    }
                } catch (error) {
                    toast.error('Auto cashout failed');
                }
            }
        };

        // Success event handler
        const onCashoutSuccess = async () => {
            playSound(successAudioRef.current);
            setTimeout(() => {
                setBetting(false);
            }, 500);
            // After successful cashout, call /user-manage/cashout
            if (!isConnected) return;
            // You need to know the cashout amount, e.g. payout * betAmount
            console.log(payout, savebetAmount, 'asdfadsfdf')
            const cashoutAmount = payout * savebetAmount;
            const cashoutRes = await axiosServices.post('/user-manage/cashout', {
                wallet_address: address,
                currency,
                amount: cashoutAmount,
                game: 'Crash',
            });
            if (!cashoutRes.data || !cashoutRes.data.success) {
                toast.error(cashoutRes.data?.message || 'Cashout failed');
            }
            await fetchBalance();
            if (triggerBalanceRefresh) triggerBalanceRefresh();
        };

        // Error event handler
        const onCashoutError = (msg: string) => {
            // toast.error(msg);
            playSound(errorAudioRef.current);
        };

        const cancelError = () => { };

        const cancelSuccess = () => {
            console.log("cancelSuccess =================== here made false");
            setJoining(false);
            setBetting(false);
            // Refresh balance after canceling bet
            fetchBalance();
        };

        // Add game to history
        const addGameToHistory = (game: any) => {
            setHistory((state: any[]) =>
                state.length >= 6
                    ? [...state.slice(1, state.length), game]
                    : [...state, game]
            );
        };


        const onFetchGame = (schema: any) => {
            console.log("🎮 Received game data:", schema);
            // Update state
            setGameId(schema._id);
            setPrivateHash(schema.privateHash);
            setPublicSeed(schema.publicSeed);
            setPlayers(schema.players);
            setStartTime(moment.utc().subtract(moment.utc(schema.elapsed).valueOf(), 'milliseconds').toDate());
            setHistory(schema.history.reverse().slice(0, 6));
            setGameState(schema.status);
        };
        // Listeners
        crashSocket.on("connect", () => {
            console.log("✅ Socket connected to crash game!");
            console.log("🔗 Socket ID:", crashSocket.id);
            crashSocket.emit("games");
        });
        crashSocket.on("disconnect", (reason) => {
            console.log("❌ Socket disconnected from crash game! Reason:", reason);
        });
        crashSocket.on("connect_error", (error) => {
            console.error("❌ Socket connection error:", error);
            console.error("❌ Error details:", error.message);
        });
        crashSocket.on("game-starting", (data) => {
            onGameStarting(data);
        });
        crashSocket.on("game-start", (data) => {
            onGameStart(data);
        });
        crashSocket.on("game-end", (data) => {
            onGameEnd(data);
        });
        crashSocket.on("game-tick", (data) => {
            onGameTick(data);
        });
        crashSocket.on("game-bets", (data) => {
            onGameBets(data);
        });
        crashSocket.on("bet-cashout", onBetCashout);
        crashSocket.on("game-join-error", joinError);
        crashSocket.on("game-join-success", joinSuccess);
        crashSocket.on("bet-cashout-error", onCashoutError);
        crashSocket.on("bet-cashout-success", onCashoutSuccess);
        crashSocket.on("game-cancel-error", cancelError);
        crashSocket.on("game-cancel-success", cancelSuccess);
        crashSocket.on("games", (data) => {
            onFetchGame(data);
        });

        return () => {
            // Remove Listeners
            crashSocket.off("game-starting", onGameStarting);
            crashSocket.off("game-start", onGameStart);
            crashSocket.off("game-end", onGameEnd);
            crashSocket.off("game-tick", onGameTick);
            crashSocket.off("game-bets", onGameBets);
            crashSocket.off("bet-cashout", onBetCashout);
            crashSocket.off("game-join-error", joinError);
            crashSocket.off("game-join-success", joinSuccess);
            crashSocket.off("game-cancel-error", cancelError);
            crashSocket.off("game-cancel-success", cancelSuccess);

            crashSocket.off("bet-cashout-error", onCashoutError);
            crashSocket.off("bet-cashout-success", onCashoutSuccess);

            crashSocket.off("connect");
            crashSocket.off("disconnect");
            crashSocket.off("games", onFetchGame);
        };
    }, [
        gameState,
        startTime,
        plannedBet,
        autoBetEnabled,
        autoCashoutEnabled,
        betAmount,
        target,
        stopProfitA,
        stopLossA,
        autoBetCount,
        savebetAmount
    ]);

    useEffect(() => {
        fetchBalance(); // fetch on mount
    }, [fetchBalance]);

    useEffect(() => {
        if (Number(betAmount) > 0) {
            setAmountInputFlag(true);
        }
    }, [betAmount]);

    useEffect(() => {
        console.log("betting, joining, cashedOut, autoBetEnabled, plannedBet, gameState", betting, joining, cashedOut, autoBetEnabled, plannedBet, gameState)
    }, [betting, joining, cashedOut, autoBetEnabled, plannedBet, gameState])

    const disabled = joining || betting || autoBetEnabled;
    const isAuto = activeTab === 1;

    return (
        <div>
            <div className="w-full bg-[#10100f] h-full flex mt-4 justify-center ">
                <div className={`max-w-[1300px] ${isMobile ? "w-full p-1" : ""} `}>
                    <div className="grid grid-cols-1 sm:grid-cols-4 rounded-md overflow-hidden   bg-panel">
                        {!isMobile && (
                            <div className="col-span-1 p-1 min-h-[560px] bg-sider_panel shadow-[0px_0px_15px_rgba(0,0,0,0.25)] flex flex-col justify-between">
                                <div className="gap-2 p-1 py-4 ">
                                    <SwitchTab onChange={(e: any) => setActiveTab(e)} disabled={disabled} active={activeTab} />
                                    {isAuto && <SwitchTab onChange={setSubActiveTab} disabled={false} active={subActiveTab} options={["Controls", "Leaderboard"]} type={"sub"} />}
                                    {
                                        (!isAuto || subActiveTab !== 1) && <>
                                            <BetAmountInput disabled={disabled} value={betAmount} onChange={setValidBetAmount} className={`${!amountInputFlag ? "animate-bounding2" : ""}`} maxAmount={discoBalance} />
                                            <MultiplierInput disabled={disabled} value={target} onChange={(e: any) => onTargetChange(e)} />
                                        </>
                                    }

                                    {
                                        (isAuto && subActiveTab === 1) && <CurrentBets bets={players} />
                                    }
                                    {isAuto && subActiveTab !== 1 && (
                                        <>
                                            <AutoBetCountInput disabled={disabled} value={autoBetCount} onChange={(e: any) => setAutoCount(e)} Icon={<InfinitySvg />} />
                                            <StopProfitAmount disabled={disabled} Label={"Stop on Profit"} onChange={setStopPorfitA} value={stopProfitA} Icon={<SelectedPaymentIcon currency={currency} />} />
                                            <StopProfitAmount disabled={disabled} Label={"Loss on Profit"} onChange={setStopLossA} value={stopLossA} Icon={<SelectedPaymentIcon currency={currency} />} />
                                        </>
                                    )}
                                    <ProfitAmount disabled={true} profit={payout * savebetAmount} multiplier={payout} icon={<SelectedPaymentIcon currency={currency} />} />

                                    {isAuto ? <BetButton
                                        disabled={betting && gameState !== GAME_STATES.InProgress && !autoBetEnabled}
                                        onClick={() => {
                                            toast.error("Coming Soon")
                                            // if (!betting) {
                                            //     if (autoBetEnabled) {
                                            //         handleAutoBetChange(false)
                                            //     } else {
                                            //         clickBet()
                                            //         handleAutoBetChange(true)
                                            //     }
                                            // } else if (gameState === GAME_STATES.InProgress && !cashedOut) {
                                            //     clickCashout()
                                            // } else if (autoBetEnabled) {
                                            //     handleAutoBetChange(false)
                                            // }
                                        }}>
                                        {!betting ? autoBetEnabled ? "Stop Autobet" : "Start Autobet" : gameState === GAME_STATES.InProgress && !cashedOut ? "CASHOUT" : autoBetEnabled ? "Stop Autobet" : "Finishing Bet"}
                                    </BetButton> :
                                        <BetButton disabled={joining} onClick={() => {
                                            if (!betting) {
                                                clickBet()
                                            } else if (gameState === GAME_STATES.InProgress && !cashedOut) {
                                                clickCashout()
                                            }

                                        }}>
                                            {!betting && joining && "BETTING..."}
                                            {!betting && plannedBet && "CANCEL BET"}
                                            {!betting && !plannedBet && "Place Bet (next round)"}
                                            {betting && cashedOut && "CASHED OUT"}
                                            {betting && !cashedOut && "CASHOUT"}
                                        </BetButton>}

                                    {
                                        !isAuto && <CurrentBets bets={players} />
                                    }
                                </div>
                            </div>
                        )}
                        <div className={`col-span-3 min-h-[300px] gap-2 ${isMobile ? "p-1 w-full" : "p-2"} md:px-6 ${isMobile ? "h-[300px] " : ""
                            }  relative h-full overflow-hidden`}>
                            <div className="absolute top-4 z-10 left-5 max-w-[70%]">
                                <div className="flex space-x-1 items-center">
                                    {history.slice(isMobile ? 3 : 0, 6).map((item: any, key: number) => {
                                        const opacity = `opacity-${key + 4}0 hover:opacity-100 transition-all`;
                                        return (
                                            <div
                                                key={key}
                                                className={`text-stone-50 animate-zoomIn cursor-pointer `}
                                                onClick={() => setGameVerifyId(item._id)}
                                            >
                                                {item.crashPoint < 1.2 ? (
                                                    <div className={`px-1 rounded-full overflow-hidden  ${opacity}`}>{parseCommasToThousands(
                                                        cutDecimalPoints(item.crashPoint.toFixed(2))
                                                    )}x</div>
                                                ) : item.crashPoint >= 1.2 && item.crashPoint < 2 ? (
                                                    <div className={` px-1 rounded-full overflow-hidden  ${opacity}`} > {parseCommasToThousands(
                                                        cutDecimalPoints(item.crashPoint.toFixed(2))
                                                    )}x</div>
                                                ) : item.crashPoint >= 2 && item.crashPoint < 100 ? (
                                                    <div className={` px-1 rounded-full overflow-hidden ${opacity}`} >{parseCommasToThousands(
                                                        cutDecimalPoints(item.crashPoint.toFixed(2))
                                                    )}x</div>
                                                ) : (
                                                    <div className={`px-1 rounded-full overflow-hidden  ${opacity}`} > {parseCommasToThousands(
                                                        cutDecimalPoints(item.crashPoint.toFixed(2))
                                                    )}x</div>
                                                )}
                                            </div>
                                        );
                                    })}
                                    {/* <FairnessView gameId={"crash"} privateSeed={privateSeed} privateHash={privateHash} publicSeed={publicSeed} >
                                        <div className="text-white">Fairness</div>
                                    </FairnessView> */}
                                    <GameHistory Label={"crash"} setGameId={setGameVerifyId} />
                                </div>
                            </div>
                            <span className="absolute top-2.5 right-5 z-10 h-6 text-base crash-game-status text-stone-100">
                                <div className="flex items-center">
                                    <div className="p-2">
                                        <NetStatus payout={payout} />
                                    </div>
                                </div>
                            </span>
                            <CrashXCanvas
                                status={gameState}
                                payout={payout}
                                startTime={startTime}
                            />
                        </div>
                        {isMobile && (
                            <div className="col-span-1 p-2 bg-sider_panel shadow-[0px_0px_15px_rgba(0,0,0,0.25)] flex flex-col justify-between">
                                {isAuto ? (<BetButton
                                    disabled={betting && gameState !== GAME_STATES.InProgress && !autoBetEnabled}
                                    onClick={() => {
                                        if (!betting) {
                                            if (autoBetEnabled) {
                                                handleAutoBetChange(false)
                                            } else {
                                                clickBet()
                                                handleAutoBetChange(true)
                                            }
                                        } else if (gameState === GAME_STATES.InProgress && !cashedOut) {
                                            clickCashout()
                                        } else if (autoBetEnabled) {
                                            handleAutoBetChange(false)
                                        }
                                    }}>
                                    {!betting ? autoBetEnabled ? "Stop Autobet" : "Start Autobet" : gameState === GAME_STATES.InProgress && !cashedOut ? "CASHOUT" : autoBetEnabled ? "Stop Autobet" : "Finishing Bet"}
                                </BetButton>) :
                                    (<BetButton disabled={joining} onClick={() => {
                                        if (!betting) {
                                            if (joining) {
                                                // Cancel bet
                                                crashSocket.emit("cancel-game");
                                            } else {
                                                // Place bet
                                                clickBet()
                                            }
                                        } else if (gameState === GAME_STATES.InProgress && !cashedOut) {
                                            clickCashout()
                                        }

                                    }}>
                                        {!betting ? (joining ? "CANCEL BET" : "PLACE BET") : (cashedOut ? "CASHED OUT" : "CASH OUT")}
                                    </BetButton>
                                    )}
                                {(!isAuto || subActiveTab !== 1) && <>
                                    <BetAmountInput disabled={disabled} value={betAmount} onChange={setValidBetAmount} maxAmount={discoBalance} />
                                    <MultiplierInput disabled={disabled} value={target} onChange={onTargetChange} />
                                </>}
                                {(!isAuto || subActiveTab === 1) && <CurrentBets bets={players} />}
                                {isAuto && subActiveTab !== 1 && (
                                    <>
                                        <AutoBetCountInput disabled={disabled} value={autoBetCount} onChange={setAutoCount} Icon={<SelectedPaymentIcon currency={currency} />} />
                                        <StopProfitAmount disabled={disabled} Label={"Stop on Profit"} onChange={setStopPorfitA} value={stopProfitA} Icon={<SelectedPaymentIcon currency={currency} />} />
                                        <StopProfitAmount disabled={disabled} Label={"Loss on Profit"} onChange={setStopLossA} value={stopLossA} Icon={<SelectedPaymentIcon currency={currency} />} />
                                    </>
                                )}
                                <ProfitAmount multiplier={payout} disabled={true} profit={payout * savebetAmount} icon={<SelectedPaymentIcon currency={currency} />} />
                                {isAuto && <SwitchTab onChange={setSubActiveTab} disabled={false} active={subActiveTab} options={["Controls", "Leaderboard"]} type={"sub"} />}
                                <SwitchTab onChange={setActiveTab} disabled={disabled} active={activeTab} />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* DISCO Wallet Section */}
            <div className="max-w-4xl mx-auto mt-8">
                <DiscoWallet />
            </div>

            <VerifyModal Label={"crash"} gameId={verifyId} setGameId={() => setGameVerifyId("")} />
        </div >
    )

}

export default CrashGame;

const parseCommasToThousands = (value: number) =>
    value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

const cutDecimalPoints = (num: any) =>
    num.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0];

const NetStatus = ({ payout }: { payout: number }) => {
    const [netStatus, setNetStatus] = useState(false);

    useEffect(() => {
        setNetStatus(true);
        const timer = setTimeout(() => setNetStatus(false), 500);
        return () => {
            clearTimeout(timer);
        };
    }, [payout]);

    return (
        <div className={`w-[10px] h-[10px] rounded-full  bg-[#24db5b] ${netStatus ? " animate-zoom " : ""}`} />
    );
};
