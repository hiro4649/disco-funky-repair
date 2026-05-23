import { ethers } from 'ethers';
import moment from 'moment';
import prisma from '../db/prisma_client';
import { QUICKNODE_HTTP_RPC_URL, ADMIN_PRIVATE_KEY } from '../config/env';

// Token Contract ABI for DEX and fee management - Updated for new contract
const TOKEN_ABI = [
  // DEX management functions
  "function add_dex(address dex)",
  "function remove_dex(address dex)",
  "function isDex(address) view returns (bool)",
  
  // Fee management functions - Updated for new contract
  "function feePercent(uint16) view returns (uint16)",
  "function holdingDate(address) view returns (uint16)",
  "function feeRecipient() view returns (address)",
  "function update_fee_percentage(uint16 _holdingDate, uint16 _newFeePercent)",
  "function update_holding_date(address user, uint16 _holdingDate)",
  "function update_fee_recipient(address newRecipient)",
  
  // Events
  "event DexAdded(address indexed dex)",
  "event DexRemoved(address indexed dex)",
  "event FeePercentageUpdated(uint16 oldFeePercent, uint16 newFeePercent)",
  "event HoldingDateUpdated(address indexed user, uint16 oldHoldingDate, uint16 newHoldingDate)",
  "event FeeRecipientUpdated(address indexed oldRecipient, address indexed newRecipient)"
];

const TOKEN_ADDRESS = "0xd3d43ebe408e0ac3eba1aabcd6c18e2ac105ee47"; // Sepolia contract address

export class TokenManagementService {
  private static provider: ethers.JsonRpcProvider | null = null;
  private static signer: ethers.Wallet | null = null;
  private static contract: ethers.Contract | null = null;

  private static async initializeProvider() {
    if (!this.provider) {
      if (!QUICKNODE_HTTP_RPC_URL) {
        throw new Error('QUICKNODE_HTTP_RPC_URL is not configured');
      }
      this.provider = new ethers.JsonRpcProvider(QUICKNODE_HTTP_RPC_URL);
    }

    if (!this.signer && ADMIN_PRIVATE_KEY) {
      this.signer = new ethers.Wallet(ADMIN_PRIVATE_KEY, this.provider);
    }

    if (!this.contract) {
      this.contract = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, this.signer || this.provider);
    }
  }

  // Add DEX to contract and database
  static async addDexToContract(dexAddress: string, adminAddress: string): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      await this.initializeProvider();

      if (!this.signer) {
        throw new Error('Admin private key not configured');
      }

      // Check if DEX already exists in contract
      const isDex = await this.contract!.isDex(dexAddress);
      if (isDex) {
        throw new Error('DEX address already exists in contract');
      }

      // Add DEX to contract
      const tx = await this.contract!.add_dex(dexAddress);
      const receipt = await tx.wait();

      // Save to database
      await this.saveDexToDatabase(dexAddress, adminAddress, receipt.hash);

      return {
        success: true,
        txHash: receipt.hash
      };

    } catch (error) {
      console.error('Error adding DEX to contract:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Remove DEX from contract and database
  static async removeDexFromContract(dexAddress: string): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      await this.initializeProvider();

      if (!this.signer) {
        throw new Error('Admin private key not configured');
      }

      // Check if DEX exists in contract
      const isDex = await this.contract!.isDex(dexAddress);
      if (!isDex) {
        throw new Error('DEX address does not exist in contract');
      }

      // Remove DEX from contract
      const tx = await this.contract!.remove_dex(dexAddress);
      const receipt = await tx.wait();

      // Update database (soft delete)
      await this.removeDexFromDatabase(dexAddress);

      return {
        success: true,
        txHash: receipt.hash
      };

    } catch (error) {
      console.error('Error removing DEX from contract:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Update fee percentage in contract and database
  static async updateFeePercentage(holdingDate: number, newFeePercent: string, adminAddress: string): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      await this.initializeProvider();

      if (!this.signer) {
        throw new Error('Admin private key not configured');
      }

      // Get current fee percentage for the specific holding date
      const currentFee = await this.contract!.feePercent(holdingDate);
      const oldValue = currentFee.toString();

      // Update fee percentage in contract
      const tx = await this.contract!.update_fee_percentage(holdingDate, newFeePercent);
      const receipt = await tx.wait();

      // Save to database
      await this.saveFeeChangeToDatabase('percentage', oldValue, newFeePercent, adminAddress, receipt.hash, holdingDate);

      return {
        success: true,
        txHash: receipt.hash
      };

    } catch (error) {
      console.error('Error updating fee percentage:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Update fee recipient in contract and database
  static async updateFeeRecipient(newRecipient: string, adminAddress: string): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      await this.initializeProvider();

      if (!this.signer) {
        throw new Error('Admin private key not configured');
      }

      // Get current fee recipient
      const currentRecipient = await this.contract!.feeRecipient();
      const oldValue = currentRecipient;

      // Update fee recipient in contract
      const tx = await this.contract!.update_fee_recipient(newRecipient);
      const receipt = await tx.wait();

      // Save to database
      await this.saveFeeChangeToDatabase('recipient', oldValue, newRecipient, adminAddress, receipt.hash);

      return {
        success: true,
        txHash: receipt.hash
      };

    } catch (error) {
      console.error('Error updating fee recipient:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Update user holding date in contract and database
  static async updateUserHoldingDate(userAddress: string, holdingDate: number, adminAddress: string): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      await this.initializeProvider();

      if (!this.signer) {
        throw new Error('Admin private key not configured');
      }

      // Get current holding date
      const currentHoldingDate = await this.contract!.holdingDate(userAddress);
      const oldValue = currentHoldingDate.toString();

      // Update holding date in contract
      const tx = await this.contract!.update_holding_date(userAddress, holdingDate);
      const receipt = await tx.wait();

      // Save to database
      await this.saveFeeChangeToDatabase('holding_date', oldValue, holdingDate.toString(), adminAddress, receipt.hash, holdingDate);

      return {
        success: true,
        txHash: receipt.hash
      };

    } catch (error) {
      console.error('Error updating user holding date:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Get current contract state
  static async getContractState(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      await this.initializeProvider();

      // Holding date options (matching contract defaults)
      const holdingDateOptions = [0, 30, 180, 360, 720];
      
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
      console.error('Error getting contract state:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Database helper methods
  private static async saveDexToDatabase(address: string, addedBy: string, txHash: string): Promise<void> {
    try {
      await prisma.dexList.upsert({
        where: { address },
        update: {
          isActive: true,
          addedBy,
          txHash,
          updatedAt: moment.utc().toDate()
        },
        create: {
          address,
          addedBy,
          txHash,
          isActive: true
        }
      });
    } catch (error) {
      console.error('Error saving DEX to database:', error);
      throw error;
    }
  }

  private static async removeDexFromDatabase(address: string): Promise<void> {
    try {
      await prisma.dexList.update({
        where: { address },
        data: {
          isActive: false,
          updatedAt: moment.utc().toDate()
        }
      });
    } catch (error) {
      console.error('Error removing DEX from database:', error);
      throw error;
    }
  }

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
