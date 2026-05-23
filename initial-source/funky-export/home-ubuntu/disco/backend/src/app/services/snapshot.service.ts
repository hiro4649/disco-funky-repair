import { PrismaClient } from '@prisma/client';
import moment from 'moment';
import getTokenBalance from '../lib/getToken';
import { TOKEN_CONTRACT_ADDRESS } from '../config/env';

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
      console.log('Starting daily snapshot verification...');

      if (!TOKEN_CONTRACT_ADDRESS) {
        console.error('TOKEN_CONTRACT_ADDRESS is not configured. Skipping snapshot verification.');
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
            console.error('TOKEN_CONTRACT_ADDRESS is not configured');
            continue;
          }

          // Get actual DISCO token balance from Sui wallet
          const tokenBalance = await getTokenBalance(user.wallet_address, TOKEN_CONTRACT_ADDRESS);
          const balanceInTokens = Number(tokenBalance) / Math.pow(10, 9); // Convert from smallest unit to tokens (assuming 9 decimals)
          
          console.log(`Checking wallet ${user.wallet_address}: balance=${balanceInTokens} DISCO tokens, holdingDate=${user.holdingDate} days`);
          
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
            console.log(`Verified referral: ${referral.referred_wallet} -> ${referral.referrer_wallet} (balance: ${balanceInTokens} tokens)`);
          } else {
            console.log(`Referral not verified: ${referral.referred_wallet} (balance: ${balanceInTokens} DISCO tokens, holdingDate: ${user.holdingDate} days)`);
          }
        } catch (error) {
          console.error(`Error checking DISCO token balance for wallet ${user.wallet_address}:`, error);
          // Continue with other referrals
        }
      }

      console.log(`Snapshot completed: ${verifiedCount}/${pendingReferrals.length} referrals verified`);

      return {
        verifiedCount,
        totalChecked: pendingReferrals.length
      };
    } catch (error) {
      console.error('Error running daily snapshot:', error);
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
      console.log('Starting reward distribution...');

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
            console.error(`User not found for referral ${referral.id}`);
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
          console.log(`Distributed rewards for referral: ${referral.referred_wallet} -> ${referral.referrer_wallet}`);
        } catch (error) {
          console.error(`Error distributing rewards for referral ${referral.id}:`, error);
          // Continue with other referrals
        }
      }

      console.log(`Reward distribution completed: ${distributedCount} rewards distributed`);

      return { distributedCount };
    } catch (error) {
      console.error('Error distributing rewards:', error);
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
      console.log('Starting cleanup of expired referrals...');

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
        console.log(`Cleaned up expired referral: ${referral.referred_wallet} -> ${referral.referrer_wallet}`);
      }

      console.log(`Cleanup completed: ${cleanedCount} expired referrals removed`);

      return { cleanedCount };
    } catch (error) {
      console.error('Error cleaning up expired referrals:', error);
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
      console.log('Starting daily referral process...');

      // Step 1: Clean up expired referrals
      const cleanupResult = await this.cleanupExpiredReferrals();

      // Step 2: Run snapshot verification
      // const snapshotResult = await this.runDailySnapshot();

      // Step 3: Distribute rewards
      // const rewardResult = await this.distributeRewards();

      console.log('Daily referral process completed successfully');

      return {
        cleanedCount: cleanupResult.cleanedCount,
        // verifiedCount: snapshotResult.verifiedCount,
        // distributedCount: rewardResult.distributedCount,
        // totalChecked: snapshotResult.totalChecked
      };
    } catch (error) {
      console.error('Error in daily referral process:', error);
      throw error;
    }
  }
}