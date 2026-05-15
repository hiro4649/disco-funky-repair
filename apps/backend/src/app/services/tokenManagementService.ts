import { ethers } from 'ethers';
import prisma from '../db/prisma_client';
import {
  QUICKNODE_HTTP_RPC_URL,
  TIER_RELAYER_PRIVATE_KEY,
  TIER_UPDATER_CONTRACT_ADDRESS
} from '../config/env';
import {
  createTierBatchId,
  isValidTier,
  sendTierSyncTransaction,
  TierReasonName,
  TIER_UPDATER_ABI,
  VALID_TIER_DAYS
} from '../lib/tierSync';

// Read-only token contract ABI. Governance writes are handled outside the backend.
const TOKEN_ABI = [
  "function isDex(address) view returns (bool)",
  
  "function feePercent(uint16) view returns (uint16)",
  "function holdingDate(address) view returns (uint16)",
  "function feeRecipient() view returns (address)"
];

const TOKEN_ADDRESS = "0xd3d43ebe408e0ac3eba1aabcd6c18e2ac105ee47"; // Sepolia contract address
const GOVERNANCE_WRITE_DISABLED = 'MANUAL_REVIEW_REQUIRED';
const GOVERNANCE_WRITE_DISABLED_MESSAGE =
  'Governance, fee, DEX, and pair management transactions are disabled in the backend. Use the governance runbook and multisig/timelock process.';

type ChainWriteResult = { success: boolean; txHash?: string; error?: string; code?: string };

export class TokenManagementService {
  private static provider: ethers.JsonRpcProvider | null = null;
  private static tierRelayerSigner: ethers.Wallet | null = null;
  private static contract: ethers.Contract | null = null;
  private static tierUpdaterContract: ethers.Contract | null = null;

  private static async initializeProvider() {
    if (!this.provider) {
      if (!QUICKNODE_HTTP_RPC_URL) {
        throw new Error('QUICKNODE_HTTP_RPC_URL is not configured');
      }
      this.provider = new ethers.JsonRpcProvider(QUICKNODE_HTTP_RPC_URL);
    }

    if (!this.contract) {
      this.contract = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, this.provider);
    }

  }

  private static async initializeTierUpdaterProvider() {
    if (!this.provider) {
      if (!QUICKNODE_HTTP_RPC_URL) {
        throw new Error('QUICKNODE_HTTP_RPC_URL is not configured');
      }
      this.provider = new ethers.JsonRpcProvider(QUICKNODE_HTTP_RPC_URL);
    }

    if (!TIER_UPDATER_CONTRACT_ADDRESS) {
      throw new Error('Tier updater contract is not configured');
    }
    if (!TIER_RELAYER_PRIVATE_KEY) {
      throw new Error('Tier relayer private key is not configured');
    }

    if (!this.tierRelayerSigner) {
      this.tierRelayerSigner = new ethers.Wallet(TIER_RELAYER_PRIVATE_KEY, this.provider);
    }

    if (!this.tierUpdaterContract) {
      this.tierUpdaterContract = new ethers.Contract(
        TIER_UPDATER_CONTRACT_ADDRESS,
        TIER_UPDATER_ABI,
        this.tierRelayerSigner
      );
    }
  }

  private static governanceWriteDisabled(): ChainWriteResult {
    return {
      success: false,
      code: GOVERNANCE_WRITE_DISABLED,
      error: GOVERNANCE_WRITE_DISABLED_MESSAGE
    };
  }

  // Governance writes are intentionally not sent from the backend.
  static async addDexToContract(dexAddress: string, adminAddress: string): Promise<ChainWriteResult> {
    void dexAddress;
    void adminAddress;
    return this.governanceWriteDisabled();
  }

  static async removeDexFromContract(dexAddress: string): Promise<ChainWriteResult> {
    void dexAddress;
    return this.governanceWriteDisabled();
  }

  static async updateFeePercentage(holdingDate: number, newFeePercent: string, adminAddress: string): Promise<ChainWriteResult> {
    void holdingDate;
    void newFeePercent;
    void adminAddress;
    return this.governanceWriteDisabled();
  }

  static async updateFeeRecipient(newRecipient: string, adminAddress: string): Promise<ChainWriteResult> {
    void newRecipient;
    void adminAddress;
    return this.governanceWriteDisabled();
  }

  // Update user holding date in contract and database
  static async updateUserHoldingDate(
    userAddress: string,
    holdingDate: number,
    adminAddress: string,
    reason?: Exclude<TierReasonName, 'REGULAR_SYNC'>
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      await this.initializeTierUpdaterProvider();

      if (!this.tierUpdaterContract) {
        throw new Error('Tier updater contract is not configured');
      }
      if (!isValidTier(holdingDate)) {
        throw new Error('Invalid holding date tier');
      }

      // Get current holding date
      const currentHoldingDate = await this.tierUpdaterContract.holdingDate(userAddress);
      const oldValue = currentHoldingDate.toString();
      const currentTier = Number(currentHoldingDate);

      if (holdingDate < currentTier && !reason) {
        throw new Error('Explicit downgrade/reset reason is required');
      }

      // Update holding date in contract
      const batchId = createTierBatchId('TIER_RELAYER_UPDATE', userAddress);
      const tx = await sendTierSyncTransaction(
        this.tierUpdaterContract,
        userAddress,
        holdingDate,
        batchId,
        currentTier,
        { explicitReason: reason }
      );
      const receipt = await tx.wait();

      // Save to database
      await this.saveFeeChangeToDatabase('holding_date', oldValue, holdingDate.toString(), adminAddress, receipt.hash, holdingDate);

      return {
        success: true,
        txHash: receipt.hash
      };

    } catch (error) {
      const safeError = this.toSafeTierUpdateError(error);
      const errorName = error instanceof Error ? error.name : typeof error;
      console.error('Error updating user holding date:', { errorName });
      return {
        success: false,
        error: safeError
      };
    }
  }

  private static toSafeTierUpdateError(error: unknown): string {
    if (!(error instanceof Error)) {
      return 'Tier update failed';
    }

    const safeMessages = new Set([
      'QUICKNODE_HTTP_RPC_URL is not configured',
      'Tier updater contract is not configured',
      'Tier relayer private key is not configured',
      'Invalid holding date tier',
      'Explicit downgrade/reset reason is required'
    ]);

    return safeMessages.has(error.message) ? error.message : 'Tier update failed';
  }

  // Get current contract state
  static async getContractState(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      await this.initializeProvider();

      // Holding date options (matching contract defaults)
      const holdingDateOptions = [...VALID_TIER_DAYS];
      
      // Fetch fee percentages for all holding dates
      const feePercentPromises = holdingDateOptions.map(holdingDate => 
        this.contract!.feePercent(holdingDate)
      );
      const feePercentages = await Promise.all(feePercentPromises);
      
      // Create fee percent mapping
      const feePercentMap: { [key: number]: number } = {};
      holdingDateOptions.forEach((holdingDate, index) => {
        feePercentMap[holdingDate] = Number(feePercentages[index]);
      });
      
      const feeRecipient = await this.contract!.feeRecipient();

      return {
        success: true,
        data: {
          feePercent: feePercentMap,
          feeRecipient
        }
      };

    } catch (error) {
      const errorName = error instanceof Error ? error.name : typeof error;
      console.error('Error getting contract state:', { errorName });
      return {
        success: false,
        error: 'Failed to get contract state'
      };
    }
  }

  // Database helper methods
  private static async saveFeeChangeToDatabase(
    changeType: string,
    oldValue: string,
    newValue: string,
    changedBy: string,
    txHash: string,
    holdingDate?: number
  ): Promise<void> {
    try {
      await prisma.feeChangeHistory.create({
        data: {
          changeType,
          oldValue,
          newValue,
          changedBy,
          txHash,
          holdingDate: holdingDate || null
        }
      });
    } catch (error) {
      console.error('Error saving fee change to database:', error);
      throw error;
    }
  }
}
