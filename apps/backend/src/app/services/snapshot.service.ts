import { PrismaClient } from '@prisma/client';
import moment from 'moment';
import { Prisma } from '@prisma/client';
import getTokenBalance from '../lib/getToken';
import { TOKEN_CONTRACT_ADDRESS } from '../config/env';
import { safeLogError, safeLogWarn } from '../utils/safeLogger';

const prisma = new PrismaClient();
const REFERRAL_REWARD_POINTS = 100;
const REFERRAL_MIN_TOKEN_BALANCE_BASE_UNITS = 10000n * (10n ** 9n);

type ReferralRewardDistributionResult =
  | { status: 'distributed'; rewardAmount: number }
  | { status: 'already_processed'; rewardAmount: 0 };

type ReferralRewardDistributionOptions = {
  expiresAfter?: Date;
};

export const distributeReferralRewardOnce = async (
  referralId: number,
  options: ReferralRewardDistributionOptions = {}
): Promise<ReferralRewardDistributionResult> => {
  return prisma.$transaction(async (tx) => {
    return distributeReferralRewardInTransaction(tx, referralId, options);
  });
};

const distributeReferralRewardInTransaction = async (
  tx: Prisma.TransactionClient,
  referralId: number,
  options: ReferralRewardDistributionOptions
): Promise<ReferralRewardDistributionResult> => {
  const updatedAt = moment.utc().toDate();
  const expiresAfter = options.expiresAfter ?? updatedAt;
  const reservedReward = await tx.referralRewards.updateMany({
    where: {
      id: referralId,
      snapshot_verified: true,
      rewarded: false,
      expires_at: { gt: expiresAfter }
    },
    data: {
      rewarded: true,
      updated_at: updatedAt
    }
  });

  if (reservedReward.count !== 1) {
    return { status: 'already_processed', rewardAmount: 0 };
  }

  const referral = await tx.referralRewards.findUnique({
    where: { id: referralId },
    include: {
      referrer: {
        select: {
          id: true
        }
      },
      referred: {
        select: {
          id: true
        }
      }
    }
  });

  if (!referral?.referrer || !referral?.referred) {
    throw new Error('referral_reward_users_missing');
  }

  await tx.user.update({
    where: { id: referral.referrer.id },
    data: {
      fan_points: { increment: REFERRAL_REWARD_POINTS }
    }
  });

  await tx.user.update({
    where: { id: referral.referred.id },
    data: {
      fan_points: { increment: REFERRAL_REWARD_POINTS }
    }
  });

  await tx.pointHistory.createMany({
    data: [
      {
        userId: referral.referrer.id,
        reason: 4,
        point: REFERRAL_REWARD_POINTS,
        receivedDate: updatedAt
      },
      {
        userId: referral.referred.id,
        reason: 4,
        point: REFERRAL_REWARD_POINTS,
        receivedDate: updatedAt
      }
    ]
  });

  return { status: 'distributed', rewardAmount: REFERRAL_REWARD_POINTS };
};

export class SnapshotService {
  /**
   * Run daily snapshot to verify referral conditions
   * This should be called daily at UTC 00:00
   */
  static async runDailySnapshot(): Promise<{
    verifiedCount: number;
    totalChecked: number;
  }> {
    try {

      if (!TOKEN_CONTRACT_ADDRESS) {
        safeLogWarn('snapshot_token_contract_missing', new Error('Token contract address is not configured'));
        return { verifiedCount: 0, totalChecked: 0 };
      }

      // Get all pending referrals that haven't expired
      const now = moment.utc().toDate();
      const pendingReferrals = await prisma.referralRewards.findMany({
        where: { 
          snapshot_verified: false,
          rewarded: false,
          expires_at: {
            gt: now // Only include referrals that haven't expired
          }
        },
        include: {
          referred: true
        }
      });

      let verifiedCount = 0;

      for (const referral of pendingReferrals) {
        const user = referral.referred;
        
        try {
          if (!TOKEN_CONTRACT_ADDRESS) {
            safeLogWarn('snapshot_token_contract_missing', new Error('Token contract address is not configured'));
            continue;
          }

          // Get actual FUNKY token balance from the configured token contract.
          const tokenBalance = await getTokenBalance(user.wallet_address, TOKEN_CONTRACT_ADDRESS);
          
          
          // Check if referred user has held 10k+ DISCO tokens for 24+ hours
          if (tokenBalance >= REFERRAL_MIN_TOKEN_BALANCE_BASE_UNITS && user.holdingDate >= 1) {
            // Update as verified
            await prisma.referralRewards.update({
              where: { id: referral.id },
              data: { 
                snapshot_verified: true,
                updated_at: moment.utc().toDate()
              }
            });
            
            verifiedCount++;
          } else {
          }
        } catch (error) {
          safeLogError('snapshot_check_token_balance', error, { userId: user.id, referralId: referral.id });
          // Continue with other referrals
        }
      }


      return {
        verifiedCount,
        totalChecked: pendingReferrals.length
      };
    } catch (error) {
      safeLogError('snapshot_run_daily', error);
      throw error;
    }
  }

  /**
   * Distribute rewards to verified referrals
   * This should be called after snapshot verification
   */
  static async distributeRewards(): Promise<{
    distributedCount: number;
    alreadyProcessedCount: number;
  }> {
    try {

      // Get all verified but not rewarded referrals that haven't expired
      const now = moment.utc().toDate();
      const verifiedReferrals = await prisma.referralRewards.findMany({
        where: { 
          snapshot_verified: true,
          rewarded: false,
          expires_at: {
            gt: now // Only include referrals that haven't expired
          }
        }
      });

      let distributedCount = 0;
      let alreadyProcessedCount = 0;

      for (const referral of verifiedReferrals) {
        try {
          const result = await distributeReferralRewardOnce(referral.id, { expiresAfter: now });
          if (result.status === 'distributed') {
            distributedCount++;
          } else {
            alreadyProcessedCount++;
          }
        } catch (error) {
          safeLogError('snapshot_distribute_referral_reward', error, { referralId: referral.id });
          // Continue with other referrals
        }
      }


      return { distributedCount, alreadyProcessedCount };
    } catch (error) {
      safeLogError('snapshot_distribute_rewards', error);
      throw error;
    }
  }

  /**
   * Clean up expired referrals
   * This should be called daily to identify expired referral records without
   * deleting the audit trail. Expiration is represented by expires_at <= now.
   */
  static async cleanupExpiredReferrals(): Promise<{
    cleanedCount: number;
  }> {
    try {

      const now = moment.utc().toDate();
      const expiredReferralCount = await prisma.referralRewards.count({
        where: {
          rewarded: false,
          expires_at: {
            lte: now // Referrals that have expired
          }
        }
      });

      return { cleanedCount: expiredReferralCount };
    } catch (error) {
      safeLogError('snapshot_cleanup_expired_referrals', error);
      throw error;
    }
  }

  /**
   * Run complete daily process: cleanup + snapshot + reward distribution
   */
  static async runDailyProcess(): Promise<{
    cleanedCount: number;
    // verifiedCount: number;
    // distributedCount: number;
    // totalChecked: number;
  }> {
    try {

      // Step 1: Clean up expired referrals
      const cleanupResult = await this.cleanupExpiredReferrals();

      // Step 2: Run snapshot verification
      // const snapshotResult = await this.runDailySnapshot();

      // Step 3: Distribute rewards
      // const rewardResult = await this.distributeRewards();


      return {
        cleanedCount: cleanupResult.cleanedCount,
        // verifiedCount: snapshotResult.verifiedCount,
        // distributedCount: rewardResult.distributedCount,
        // totalChecked: snapshotResult.totalChecked
      };
    } catch (error) {
      safeLogError('snapshot_daily_referral_process', error);
      throw error;
    }
  }
}
