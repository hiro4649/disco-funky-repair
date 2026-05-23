import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import moment from 'moment';
import { generateRandomCode } from '../utils/ticketCodeGenerator';

const router = Router();
const prisma = new PrismaClient();

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
router.get('/referral-code/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;

    // Find user
    const user = await prisma.user.findUnique({
      where: { wallet_address: walletAddress.toLowerCase() }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate referral code if user doesn't have one
    if (!user.referral_code || user.referral_code.length !== 6) {
      const referralCode = await generateUniqueCode();
      await prisma.user.update({
        where: { wallet_address: walletAddress.toLowerCase() },
        data: { referral_code: referralCode }
      });
      return res.json({ referralCode });
    }

    return res.json({ referralCode: user.referral_code });
  } catch (error) {
    console.error('Error getting referral code:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get referral statistics for a user
router.get('/referral-stats/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;

    // Get total referrals
    const totalReferrals = await prisma.referralRewards.count({
      where: { referrer_wallet: walletAddress.toLowerCase() }
    });

    // Get verified referrals (those who met the 10k token requirement)
    const verifiedReferrals = await prisma.referralRewards.count({
      where: { 
        referrer_wallet: walletAddress.toLowerCase(),
        snapshot_verified: true 
      }
    });

    // Get total rewards earned
    const totalRewards = await prisma.referralRewards.count({
      where: { 
        referrer_wallet: walletAddress.toLowerCase(),
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
    console.error('Error getting referral stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Track referral when user first logs in
router.post('/track-referral', async (req, res) => {
  try {
    const { walletAddress, referralCode } = req.body;

    if (!walletAddress || !referralCode) {
      return res.status(400).json({ error: 'Wallet address and referral code are required' });
    }

    // Find the referrer by referral code
    const referrer = await prisma.user.findUnique({
      where: { referral_code: referralCode }
    });

    if (!referrer) {
      return res.status(404).json({ error: 'Invalid referral code' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { wallet_address: walletAddress.toLowerCase() }
    });

    if (existingUser) {
      // If user exists but doesn't have a referrer, update them
      if (!existingUser.referred_by) {
        await prisma.user.update({
          where: { wallet_address: walletAddress.toLowerCase() },
          data: { referred_by: referralCode }
        });
        
        // Create referral reward record with 7-day expiration
        const expiresAt = moment.utc().add(7, 'days').toDate();

        await prisma.referralRewards.create({
          data: {
            referrer_wallet: referrer.wallet_address,
            referred_wallet: walletAddress.toLowerCase(),
            snapshot_verified: false,
            rewarded: false,
            expires_at: expiresAt
          }
        });
        
        return res.json({ message: 'Referral tracked successfully for existing user' });
      } else {
        return res.status(400).json({ error: 'User already has a referrer' });
      }
    }

    // Create new user with referral
    await prisma.user.create({
      data: {
        wallet_address: walletAddress.toLowerCase(),
        level: 1,
        fan_points: 0,
        disco_balance: 0,
        holdingDate: 0,
        referred_by: referralCode
      }
    });

    // Create referral reward record with 7-day expiration
    const expiresAt = moment.utc().add(7, 'days').toDate();

    await prisma.referralRewards.create({
      data: {
        referrer_wallet: referrer.wallet_address,
        referred_wallet: walletAddress.toLowerCase(),
        snapshot_verified: false,
        rewarded: false,
        expires_at: expiresAt
      }
    });

    res.json({ message: 'Referral tracked successfully' });
  } catch (error) {
    console.error('Error tracking referral:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get referral rewards for a user
router.get('/referral-rewards/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;

    const rewards = await prisma.referralRewards.findMany({
      where: { referrer_wallet: walletAddress.toLowerCase() },
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
    console.error('Error getting referral rewards:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Debug endpoint to check if a user was referred
router.get('/debug/referral-status/:walletAddress', async (req, res) => {
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
    console.error('Error checking referral status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin endpoint to run snapshot verification
router.post('/admin/run-snapshot', async (req, res) => {
  try {
    const { adminKey } = req.body;
    
    // Simple admin key check (in production, use proper authentication)
    if (adminKey !== process.env.ADMIN_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

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
    console.error('Error running snapshot:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin endpoint to distribute rewards
router.post('/admin/distribute-rewards', async (req, res) => {
  try {
    const { adminKey } = req.body;
    
    if (adminKey !== process.env.ADMIN_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get all verified but not rewarded referrals
    const verifiedReferrals = await prisma.referralRewards.findMany({
      where: { 
        snapshot_verified: true,
        rewarded: false 
      }
    });

    let distributedCount = 0;

    for (const referral of verifiedReferrals) {
      // Award 100 fan points to both referrer and referred
      const rewardAmount = 100;
      
      // Update referrer's fan_points
      await prisma.user.update({
        where: { wallet_address: referral.referrer_wallet.toLowerCase() },
        data: { 
          fan_points: { increment: rewardAmount }
        }
      });

      // Update referred user's fan_points
      await prisma.user.update({
        where: { wallet_address: referral.referred_wallet.toLowerCase() },
        data: { 
          fan_points: { increment: rewardAmount }
        }
      });

      // Create point history records
      await prisma.pointHistory.createMany({
        data: [
          {
            userId: (await prisma.user.findUnique({ where: { wallet_address: referral.referrer_wallet.toLowerCase() } }))?.id || 0,
            reason: 4, // Referral bonus
            point: rewardAmount,
            receivedDate: moment.utc().toDate()
          },
          {
            userId: (await prisma.user.findUnique({ where: { wallet_address: referral.referred_wallet.toLowerCase() } }))?.id || 0,
            reason: 4, // Referral bonus
            point: rewardAmount,
            receivedDate: moment.utc().toDate()
          }
        ]
      });

      // Mark as rewarded
      await prisma.referralRewards.update({
        where: { id: referral.id },
        data: { rewarded: true }
      });

      distributedCount++;
    }

    res.json({ 
      message: 'Rewards distributed successfully',
      distributedCount 
    });
  } catch (error) {
    console.error('Error distributing rewards:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;