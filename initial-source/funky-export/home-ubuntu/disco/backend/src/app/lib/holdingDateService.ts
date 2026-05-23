import prisma from '../db/prisma_client';
import { ethers } from 'ethers';
import { QUICKNODE_HTTP_RPC_URL, ADMIN_PRIVATE_KEY, TOKEN_CONTRACT_ADDRESS } from '../config/env';

// Contract ABI for holding date updates
const TOKEN_ABI = [
  "function update_holding_date(address user, uint16 _holdingDate)",
  "function holdingDate(address) view returns (uint16)"
];

// Milestone days that map to fee tiers in smart contract
const MILESTONE_DAYS = [0, 30, 180, 360, 720];

/**
 * Maps a user's actual holding days to the correct fee tier milestone
 * Smart contract uses these tiers:
 * - 0-29 days: 25% fee
 * - 30-179 days: 20% fee
 * - 180-359 days: 15% fee
 * - 360-719 days: 10% fee
 * - 720+ days: 5% fee
 */
const getMilestoneTier = (actualDays: number): number => {
  if (actualDays >= 720) return 720;
  if (actualDays >= 360) return 360;
  if (actualDays >= 180) return 180;
  if (actualDays >= 30) return 30;
  return 0;
};

/**
 * Updates user holding dates in the smart contract (SNAPSHOT APPROACH)
 *
 * Updates ALL users whose contract state differs from database:
 * - Fair and transparent (no random selection)
 * - Only updates when tier actually changed
 * - Skips unnecessary gas costs by checking current contract state first
 *
 * With efficient incremental FIFO processing, we can afford to
 * check all users and only update those who need it.
 */
export const updateHoldingDateMilestones = async () => {
  try {
    console.log('Starting HYBRID OPTIMIZED holding date milestone update process...');

    if (!ADMIN_PRIVATE_KEY || !QUICKNODE_HTTP_RPC_URL) {
      console.error('Missing required environment variables: ADMIN_PRIVATE_KEY or QUICKNODE_HTTP_RPC_URL');
      return;
    }

    // Initialize provider and contract
    const provider = new ethers.JsonRpcProvider(QUICKNODE_HTTP_RPC_URL);
    const wallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);
    const contract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_ABI, wallet);

    // Get ALL users with holding dates > 0
    const allUsers = await prisma.user.findMany({
      where: {
        holdingDate: { gt: 0 }
      },
      select: {
        id: true,
        wallet_address: true,
        holdingDate: true
      }
    });

    if (allUsers.length === 0) {
      console.log('No users found to update');
      return;
    }

    console.log(`Checking ${allUsers.length} users for contract updates...`);

    // Process each user
    for (const user of allUsers) {
      try {
        // Map actual holding days to milestone tier for smart contract
        const actualHoldingDays = user.holdingDate;
        const milestoneTier = getMilestoneTier(actualHoldingDays);

        // Check current holding date in contract
        const currentContractHoldingDate = await contract.holdingDate(user.wallet_address);

        console.log(`User ${user.id} (${user.wallet_address}): Actual=${actualHoldingDays}d, Tier=${milestoneTier}, Contract=${currentContractHoldingDate}`);

        // Only update if contract holding date is different from the milestone tier
        if (Number(currentContractHoldingDate) !== milestoneTier) {
          console.log(`Updating contract holding date for user ${user.id} from ${currentContractHoldingDate} to ${milestoneTier}`);

          // Estimate gas and send transaction
          const estimatedGas = await contract.update_holding_date.estimateGas(user.wallet_address, milestoneTier);
          const gasPrice = await provider.getFeeData();

          const tx = await contract.update_holding_date(user.wallet_address, milestoneTier, {
            gasLimit: estimatedGas,
            gasPrice: gasPrice.gasPrice || BigInt(0)
          });

          const receipt = await tx.wait();
          console.log(`Successfully updated holding date for user ${user.id} (${actualHoldingDays}d -> Tier ${milestoneTier}). TX: ${receipt.hash}`);
        } else {
          console.log(`User ${user.id} already has correct milestone tier ${milestoneTier} in contract`);
        }

      } catch (error) {
        console.error(`Error updating holding date for user ${user.id}:`, error);
        // Continue with other users even if one fails
      }
    }

    console.log('Holding date milestone update process completed');

  } catch (error) {
    console.error('Error in updateHoldingDateMilestones:', error);
  }
};

/**
 * Syncs all user holding dates with the contract (for initial setup or recovery)
 */
export const syncAllHoldingDates = async () => {
  try {
    console.log('Starting full holding date sync process...');

    if (!ADMIN_PRIVATE_KEY || !QUICKNODE_HTTP_RPC_URL) {
      console.error('Missing required environment variables: ADMIN_PRIVATE_KEY or QUICKNODE_HTTP_RPC_URL');
      return;
    }

    // Initialize provider and contract
    const provider = new ethers.JsonRpcProvider(QUICKNODE_HTTP_RPC_URL);
    const wallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);
    const contract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_ABI, wallet);

    // Get all users with holding dates > 0
    const users = await prisma.user.findMany({
      where: {
        holdingDate: {
          gt: 0
        }
      },
      select: {
        id: true,
        wallet_address: true,
        holdingDate: true
      }
    });

    if (users.length === 0) {
      console.log('No users found with holding dates > 0');
      return;
    }

    console.log(`Found ${users.length} users with holding dates to sync`);

    // Process each user
    for (const user of users) {
      try {
        // Map actual holding days to milestone tier for smart contract
        const actualHoldingDays = user.holdingDate;
        const milestoneTier = getMilestoneTier(actualHoldingDays);

        // Check current holding date in contract
        const currentContractHoldingDate = await contract.holdingDate(user.wallet_address);

        console.log(`User ${user.id} (${user.wallet_address}): Actual=${actualHoldingDays}d, Tier=${milestoneTier}, Contract=${currentContractHoldingDate}`);

        // Update if different from milestone tier
        if (Number(currentContractHoldingDate) !== milestoneTier) {
          console.log(`Syncing contract holding date for user ${user.id} from ${currentContractHoldingDate} to ${milestoneTier}`);

          const estimatedGas = await contract.update_holding_date.estimateGas(user.wallet_address, milestoneTier);
          const gasPrice = await provider.getFeeData();

          const tx = await contract.update_holding_date(user.wallet_address, milestoneTier, {
            gasLimit: estimatedGas,
            gasPrice: gasPrice.gasPrice || BigInt(0)
          });

          const receipt = await tx.wait();
          console.log(`Successfully synced holding date for user ${user.id} (${actualHoldingDays}d -> Tier ${milestoneTier}). TX: ${receipt.hash}`);
        } else {
          console.log(`User ${user.id} already has correct milestone tier ${milestoneTier} in contract`);
        }

      } catch (error) {
        console.error(`Error syncing holding date for user ${user.id}:`, error);
      }
    }

    console.log('Full holding date sync process completed');

  } catch (error) {
    console.error('Error in syncAllHoldingDates:', error);
  }
};

export default { updateHoldingDateMilestones, syncAllHoldingDates };
