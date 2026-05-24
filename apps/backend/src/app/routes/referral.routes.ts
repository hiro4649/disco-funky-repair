import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import moment from 'moment';
import { generateRandomCode } from '../utils/ticketCodeGenerator';
import { Authenticate, AuthAdmin } from '../config/passport';
import { safeLogError } from '../utils/safeLogger';
import { distributeReferralRewardOnce } from '../services/snapshot.service';

const router = Router();
const prisma = new PrismaClient();

type AuthenticatedUser = {
  user_id?: number;
  address?: string;
};

type ReferralWalletAuthResult =
  | { ok: true; user: { id: number; wallet_address: string } }
  | { ok: false; status: number; body: { error: string } };

const getAuthenticatedUserId = (req: any) => {
  const userId = Number((req.user as AuthenticatedUser | undefined)?.user_id);
  return Number.isInteger(userId) && userId > 0 ? userId : null;
};

const normalizeWalletAddress = (value: unknown) => {
  return typeof value === 'string' && value.trim() ? value.trim().toLowerCase() : null;
};

const loadAuthenticatedUserForWallet = async (req: any, requestedWalletAddress: string | null): Promise<ReferralWalletAuthResult> => {
  const authenticatedUserId = getAuthenticatedUserId(req);
  if (!authenticatedUserId) {
    return { ok: false, status: 403, body: { error: 'Invalid authenticated user' } };
  }

  if (!requestedWalletAddress) {
    return { ok: false, status: 400, body: { error: 'Wallet address is required' } };
  }

  const authenticatedWalletAddress = normalizeWalletAddress((req.user as AuthenticatedUser | undefined)?.address);
  if (authenticatedWalletAddress && authenticatedWalletAddress !== requestedWalletAddress) {
    return { ok: false, status: 403, body: { error: 'Forbidden' } };
  }

  const user = await prisma.user.findUnique({
    where: { id: authenticatedUserId }
  });

  if (!user) {
    return { ok: false, status: 404, body: { error: 'User not found' } };
  }

  if (user.wallet_address.toLowerCase() !== requestedWalletAddress) {
    return { ok: false, status: 403, body: { error: 'Forbidden' } };
  }

  return { ok: true, user };
};

const generateUniqueCode = async () => {
  let code
  let user = []
  do {
    code = generateRandomCode(6)
    user = await prisma.user.findMany({
      where: { referral_code: code }
    });
  } while (user.length > 0) // 重複があれば再生成

  return code
};

// Get user's referral code
router.get('/referral-code/:walletAddress', Authenticate, async (req, res) => {
  try {
    const authenticatedUserId = getAuthenticatedUserId(req);
    const requestedWalletAddress = normalizeWalletAddress(req.params.walletAddress);

    if (!authenticatedUserId) {
      return res.status(403).json({ error: 'Invalid authenticated user' });
    }

    if (!requestedWalletAddress) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: authenticatedUserId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.wallet_address.toLowerCase() !== requestedWalletAddress) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Generate referral code if user doesn't have one
    if (!user.referral_code || user.referral_code.length !== 6) {
      const referralCode = await generateUniqueCode();
      await prisma.user.update({
        where: { id: user.id },
        data: { referral_code: referralCode }
      });
      return res.json({ referralCode });
    }

    return res.json({ referralCode: user.referral_code });
  } catch (error) {
    safeLogError('referral_code_get', error, { route: '/referral/referral-code/:walletAddress' });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get referral statistics for a user
router.get('/referral-stats/:walletAddress', Authenticate, async (req, res) => {
  try {
    const requestedWalletAddress = normalizeWalletAddress(req.params.walletAddress);
    const authenticatedUser = await loadAuthenticatedUserForWallet(req, requestedWalletAddress);
    if (!authenticatedUser.ok) {
      return res.status(authenticatedUser.status).json(authenticatedUser.body);
    }

    const walletAddress = authenticatedUser.user.wallet_address.toLowerCase();

    // Get total referrals
    const totalReferrals = await prisma.referralRewards.count({
      where: { referrer_wallet: walletAddress }
    });

    // Get verified referrals (those who met the 10k token requirement)
    const verifiedReferrals = await prisma.referralRewards.count({
      where: { 
        referrer_wallet: walletAddress,
        snapshot_verified: true 
      }
    });

    // Get total rewards earned
    const totalRewards = await prisma.referralRewards.count({
      where: { 
        referrer_wallet: walletAddress,
        rewarded: true 
      }
    });

    res.json({
      totalReferrals,
      verifiedReferrals,
      totalRewards,
      pendingRewards: verifiedReferrals - totalRewards
    });
  } catch (error) {
    safeLogError('referral_stats_get', error, { route: '/referral/referral-stats/:walletAddress' });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Track referral when user first logs in
router.post('/track-referral', Authenticate, async (req, res) => {
  try {
    const { referralCode } = req.body;
    const requestedWalletAddress = normalizeWalletAddress(req.body.walletAddress);
    const authenticatedUserId = getAuthenticatedUserId(req);

    if (!authenticatedUserId) {
      return res.status(403).json({ error: 'Invalid authenticated user' });
    }

    if (typeof referralCode !== 'string' || !referralCode.trim()) {
      return res.status(400).json({ error: 'Referral code is required' });
    }

    const result = await prisma.$transaction(async (tx) => {
      const authenticatedUser = await tx.user.findUnique({
        where: { id: authenticatedUserId }
      });

      if (!authenticatedUser) {
        return { status: 404, body: { error: 'User not found' } };
      }

      const authenticatedWalletAddress = authenticatedUser.wallet_address.toLowerCase();

      if (requestedWalletAddress && requestedWalletAddress !== authenticatedWalletAddress) {
        return { status: 403, body: { error: 'Forbidden' } };
      }

      const normalizedReferralCode = referralCode.trim();

      // Find the referrer by referral code
      const referrer = await tx.user.findUnique({
        where: { referral_code: normalizedReferralCode }
      });

      if (!referrer) {
        return { status: 404, body: { error: 'Invalid referral code' } };
      }

      if (
        referrer.id === authenticatedUser.id ||
        referrer.wallet_address.toLowerCase() === authenticatedWalletAddress
      ) {
        return { status: 400, body: { error: 'Cannot refer yourself' } };
      }

      if (authenticatedUser.referred_by) {
        return { status: 400, body: { error: 'User already has a referrer' } };
      }

      const existingReferral = await tx.referralRewards.findFirst({
        where: {
          referrer_wallet: referrer.wallet_address,
          referred_wallet: authenticatedWalletAddress
        }
      });

      if (existingReferral) {
        return { status: 400, body: { error: 'Referral already tracked' } };
      }

      // If user exists but doesn't have a referrer, update them
      await tx.user.update({
        where: { id: authenticatedUser.id },
        data: { referred_by: normalizedReferralCode }
      });

      // Create referral reward record with 7-day expiration
      const expiresAt = moment.utc().add(7, 'days').toDate();

      await tx.referralRewards.create({
        data: {
          referrer_wallet: referrer.wallet_address,
          referred_wallet: authenticatedWalletAddress,
          snapshot_verified: false,
          rewarded: false,
          expires_at: expiresAt
        }
      });

      return { status: 200, body: { message: 'Referral tracked successfully for existing user' } };
    });

    return res.status(result.status).json(result.body);
  } catch (error) {
    safeLogError('referral_track', error, { route: '/referral/track-referral' });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get referral rewards for a user
router.get('/referral-rewards/:walletAddress', Authenticate, async (req, res) => {
  try {
    const requestedWalletAddress = normalizeWalletAddress(req.params.walletAddress);
    const authenticatedUser = await loadAuthenticatedUserForWallet(req, requestedWalletAddress);
    if (!authenticatedUser.ok) {
      return res.status(authenticatedUser.status).json(authenticatedUser.body);
    }

    const walletAddress = authenticatedUser.user.wallet_address.toLowerCase();

    const rewards = await prisma.referralRewards.findMany({
      where: { referrer_wallet: walletAddress },
      include: {
        referred: {
          select: {
            wallet_address: true,
            createdAt: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    res.json(rewards);
  } catch (error) {
    safeLogError('referral_rewards_get', error, { route: '/referral/referral-rewards/:walletAddress' });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Debug endpoint to check if a user was referred
router.get('/debug/referral-status/:walletAddress', AuthAdmin, async (req, res) => {
  try {
    const { walletAddress } = req.params;

    const user = await prisma.user.findUnique({
      where: { wallet_address: walletAddress.toLowerCase() },
      select: {
        wallet_address: true,
        referred_by: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.json({ 
        exists: false, 
        message: 'User not found' 
      });
    }

    const referralRewards = await prisma.referralRewards.findMany({
      where: { 
        OR: [
          { referrer_wallet: walletAddress.toLowerCase() },
          { referred_wallet: walletAddress.toLowerCase() }
        ]
      }
    });

    // Check expiration status for each referral
    const now = moment.utc().toDate();
    const referralRewardsWithExpiration = referralRewards.map(reward => ({
      ...reward,
      isExpired: reward.expires_at <= now,
      daysUntilExpiry: Math.ceil((moment.utc(reward.expires_at).valueOf() - moment.utc(now).valueOf()) / (1000 * 60 * 60 * 24))
    }));

    res.json({
      exists: true,
      user,
      referralRewards: referralRewardsWithExpiration,
      isReferred: !!user.referred_by,
      isReferrer: referralRewards.some(r => r.referrer_wallet === walletAddress.toLowerCase())
    });
  } catch (error) {
    safeLogError('referral_status_debug', error, { route: '/referral/debug/referral-status/:walletAddress' });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin endpoint to run snapshot verification
router.post('/admin/run-snapshot', AuthAdmin, async (req, res) => {
  try {
    // Get all pending referrals
    const pendingReferrals = await prisma.referralRewards.findMany({
      where: { 
        snapshot_verified: false,
        rewarded: false 
      },
      include: {
        referred: true
      }
    });

    let verifiedCount = 0;

    for (const referral of pendingReferrals) {
      // Check if referred user has held 10k+ DISCO tokens for 24+ hours
      const user = referral.referred;
      
      if (user.disco_balance >= 10000 && user.holdingDate >= 1) {
        // Update as verified
        await prisma.referralRewards.update({
          where: { id: referral.id },
          data: { snapshot_verified: true }
        });
        
        verifiedCount++;
      }
    }

    res.json({ 
      message: 'Snapshot completed',
      verifiedCount,
      totalChecked: pendingReferrals.length 
    });
  } catch (error) {
    safeLogError('referral_snapshot_run', error, { route: '/referral/admin/run-snapshot' });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin endpoint to distribute rewards
router.post('/admin/distribute-rewards', AuthAdmin, async (req, res) => {
  try {
    // Get all verified but not rewarded referrals
    const verifiedReferrals = await prisma.referralRewards.findMany({
      where: { 
        snapshot_verified: true,
        rewarded: false 
      }
    });

    let distributedCount = 0;
    let alreadyProcessedCount = 0;

    for (const referral of verifiedReferrals) {
      const result = await distributeReferralRewardOnce(referral.id);
      if (result.status === 'distributed') {
        distributedCount++;
      } else {
        alreadyProcessedCount++;
      }
    }

    res.json({ 
      message: 'Rewards distributed successfully',
      distributedCount,
      alreadyProcessedCount,
      totalChecked: verifiedReferrals.length
    });
  } catch (error) {
    safeLogError('referral_rewards_distribute', error, { route: '/referral/admin/distribute-rewards' });
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
