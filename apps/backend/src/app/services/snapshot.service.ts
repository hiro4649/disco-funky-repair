import { PrismaClient } from '@prisma/client';
import moment from 'moment';
import getTokenBalance from '../lib/getToken';
import { TOKEN_CONTRACT_ADDRESS } from '../config/env';
import { safeLogError, safeLogWarn } from '../utils/safeLogger';

const prisma = new PrismaClient();

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
          const balanceInTokens = Number(tokenBalance) / Math.pow(10, 9); // Convert from smallest unit to tokens (assuming 9 decimals)
          
          
          // Check if referred user has held 10k+ DISCO tokens for 24+ hours
          if (balanceInTokens >= 10000 && user.holdingDate >= 1) {
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

      for (const referral of verifiedReferrals) {
        const rewardAmount = 100;
        
        try {
          // Get user IDs for point history
          const referrerUser = await prisma.user.findUnique({
            where: { wallet_address: referral.referrer_wallet }
          });
          
          const referredUser = await prisma.user.findUnique({
            where: { wallet_address: referral.referred_wallet }
          });

          if (!referrerUser || !referredUser) {
            safeLogWarn('snapshot_referral_user_missing', new Error('Referral user lookup failed'), { referralId: referral.id });
            continue;
          }

          // Update referrer's fan_points
          await prisma.user.update({
            where: { wallet_address: referral.referrer_wallet },
            data: { 
              fan_points: { increment: rewardAmount }
            }
          });

          // Update referred user's fan_points
          await prisma.user.update({
            where: { wallet_address: referral.referred_wallet },
            data: { 
              fan_points: { increment: rewardAmount }
            }
          });

          // Create point history records
          await prisma.pointHistory.createMany({
            data: [
              {
                userId: referrerUser.id,
                reason: 4, // Referral bonus
                point: rewardAmount,
                receivedDate: moment.utc().toDate()
              },
              {
                userId: referredUser.id,
                reason: 4, // Referral bonus
                point: rewardAmount,
                receivedDate: moment.utc().toDate()
              }
            ]
          });

          // Mark as rewarded
          await prisma.referralRewards.update({
            where: { id: referral.id },
            data: { 
              rewarded: true,
              updated_at: moment.utc().toDate()
            }
          });

          distributedCount++;
        } catch (error) {
          safeLogError('snapshot_distribute_referral_reward', error, { referralId: referral.id });
          // Continue with other referrals
        }
      }


      return { distributedCount };
    } catch (error) {
      safeLogError('snapshot_distribute_rewards', error);
      throw error;
    }
  }

  /**
   * Clean up expired referrals
   * This should be called daily to remove expired referral records
   */
  static async cleanupExpiredReferrals(): Promise<{
    cleanedCount: number;
  }> {
    try {

      const now = moment.utc().toDate();
      const expiredReferrals = await prisma.referralRewards.findMany({
        where: {
          expires_at: {
            lte: now // Referrals that have expired
          }
        }
      });

      let cleanedCount = 0;

      for (const referral of expiredReferrals) {
        // Delete expired referral records
        await prisma.referralRewards.delete({
          where: { id: referral.id }
        });
        
        cleanedCount++;
      }


      return { cleanedCount };
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
