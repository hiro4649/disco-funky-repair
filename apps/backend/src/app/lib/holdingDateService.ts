import prisma from '../db/prisma_client';
import { ethers } from 'ethers';
import { QUICKNODE_HTTP_RPC_URL, TIER_RELAYER_PRIVATE_KEY, TIER_UPDATER_CONTRACT_ADDRESS } from '../config/env';
import {
  createTierBatchId,
  estimateTierSyncGas,
  getMilestoneTier,
  sendTierSyncTransaction,
  TIER_UPDATER_ABI
} from './tierSync';

interface HoldingDateSyncUser {
  id: number;
  wallet_address: string;
  holdingDate: number;
  disco_balance: number;
  held_amount: number;
}

const createTierUpdaterContract = () => {
  if (!TIER_RELAYER_PRIVATE_KEY || !QUICKNODE_HTTP_RPC_URL || !TIER_UPDATER_CONTRACT_ADDRESS) {

    return null;
  }

  const provider = new ethers.JsonRpcProvider(QUICKNODE_HTTP_RPC_URL);
  const wallet = new ethers.Wallet(TIER_RELAYER_PRIVATE_KEY, provider);
  const contract = new ethers.Contract(TIER_UPDATER_CONTRACT_ADDRESS, TIER_UPDATER_ABI, wallet);

  return { provider, contract };
};

const fetchTierSyncUsers = async (): Promise<HoldingDateSyncUser[]> => {
  return prisma.user.findMany({
    select: {
      id: true,
      wallet_address: true,
      holdingDate: true,
      disco_balance: true,
      held_amount: true
    }
  });
};

const syncUsersToContract = async (source: string): Promise<void> => {
  const setup = createTierUpdaterContract();
  if (!setup) {
    return;
  }

  const { provider, contract } = setup;
  const users = await fetchTierSyncUsers();

  if (users.length === 0) {

    return;
  }



  for (const user of users) {
    try {
      const actualHoldingDays = user.holdingDate;
      const milestoneTier = getMilestoneTier(actualHoldingDays);
      const currentContractTier = Number(await contract.holdingDate(user.wallet_address));



      if (currentContractTier === milestoneTier) {

        continue;
      }

      const batchId = createTierBatchId(source, user.id);
      const tierContext = {
        tokenBalance: user.disco_balance,
        holdingDays: user.holdingDate
      };
      const estimatedGas = await estimateTierSyncGas(
        contract,
        user.wallet_address,
        milestoneTier,
        batchId,
        currentContractTier,
        tierContext
      );
      const gasPrice = await provider.getFeeData();

      const tx = await sendTierSyncTransaction(
        contract,
        user.wallet_address,
        milestoneTier,
        batchId,
        currentContractTier,
        tierContext,
        {
          gasLimit: estimatedGas,
          gasPrice: gasPrice.gasPrice || BigInt(0)
        }
      );

      const receipt = await tx.wait();

    } catch (error) {
      const errorName = error instanceof Error ? error.name : typeof error;

    }
  }
};

/**
 * Updates user holding date tiers in the smart contract.
 *
 * Includes users whose DB tier is 0 so stale non-zero contract tiers can be reset
 * with an explicit downgrade/reset reason.
 */
export const updateHoldingDateMilestones = async () => {
  try {

    await syncUsersToContract('MILESTONE_SYNC');

  } catch (error) {
    const errorName = error instanceof Error ? error.name : typeof error;

  }
};

/**
 * Syncs all user holding dates with the contract (for initial setup or recovery).
 */
export const syncAllHoldingDates = async () => {
  try {

    await syncUsersToContract('FULL_SYNC');

  } catch (error) {
    const errorName = error instanceof Error ? error.name : typeof error;

  }
};

export default { updateHoldingDateMilestones, syncAllHoldingDates };
