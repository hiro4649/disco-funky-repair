import { Request, Response } from 'express';
import moment from 'moment';
import prisma from '../db/prisma_client';

export class DexFeeController {
  // Get all DEX addresses
  static async getAllDexAddresses(req: Request, res: Response): Promise<Response> {
    try {
      const dexAddresses = await prisma.dexList.findMany({
        where: {
          isActive: true
        },
        select: {
          id: true,
          address: true,
          name: true,
          addedBy: true,
          txHash: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return res.status(200).json({
        success: true,
        data: dexAddresses
      });

    } catch (error) {
      console.error('Error fetching DEX addresses:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch DEX addresses',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Add new DEX address
  static async addDexAddress(req: Request, res: Response): Promise<Response> {
    try {
      const { address, name, addedBy, txHash } = req.body;

      if (!address) {
        return res.status(400).json({
          success: false,
          message: 'DEX address is required'
        });
      }

      // Check if DEX address already exists
      const existingDex = await prisma.dexList.findUnique({
        where: { address }
      });

      if (existingDex) {
        if (existingDex.isActive) {
          return res.status(409).json({
            success: false,
            message: 'DEX address already exists and is active'
          });
        } else {
          // Reactivate existing DEX
          const updatedDex = await prisma.dexList.update({
            where: { address },
            data: {
              isActive: true,
              addedBy,
              txHash,
              updatedAt: moment.utc().toDate()
            }
          });

          return res.status(200).json({
            success: true,
            message: 'DEX address reactivated successfully',
            data: updatedDex
          });
        }
      }

      // Create new DEX address
      const newDex = await prisma.dexList.create({
        data: {
          address,
          name: name || null,
          addedBy: addedBy || null,
          txHash: txHash || null,
          isActive: true
        }
      });

      return res.status(201).json({
        success: true,
        message: 'DEX address added successfully',
        data: newDex
      });

    } catch (error) {
      console.error('Error adding DEX address:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to add DEX address',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Remove DEX address (soft delete)
  static async removeDexAddress(req: Request, res: Response): Promise<Response> {
    try {
      const { address } = req.params;

      if (!address) {
        return res.status(400).json({
          success: false,
          message: 'DEX address is required'
        });
      }

      const existingDex = await prisma.dexList.findUnique({
        where: { address }
      });

      if (!existingDex) {
        return res.status(404).json({
          success: false,
          message: 'DEX address not found'
        });
      }

      if (!existingDex.isActive) {
        return res.status(409).json({
          success: false,
          message: 'DEX address is already inactive'
        });
      }

      // Soft delete by setting isActive to false
      const updatedDex = await prisma.dexList.update({
        where: { address },
        data: {
          isActive: false,
          updatedAt: moment.utc().toDate()
        }
      });

      return res.status(200).json({
        success: true,
        message: 'DEX address removed successfully',
        data: updatedDex
      });

    } catch (error) {
      console.error('Error removing DEX address:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to remove DEX address',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get fee change history
  static async getFeeChangeHistory(req: Request, res: Response): Promise<Response> {
    try {
      const { page = 1, limit = 50, changeType } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const where: any = {};
      if (changeType) {
        where.changeType = changeType;
      }

      const [feeHistory, total] = await Promise.all([
        prisma.feeChangeHistory.findMany({
          where,
          select: {
            id: true,
            changeType: true,
            oldValue: true,
            newValue: true,
            changedBy: true,
            txHash: true,
            holdingDate: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          skip,
          take: Number(limit)
        }),
        prisma.feeChangeHistory.count({ where })
      ]);

      return res.status(200).json({
        success: true,
        data: {
          feeHistory,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        }
      });

    } catch (error) {
      console.error('Error fetching fee change history:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch fee change history',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Add fee change record
  static async addFeeChangeRecord(req: Request, res: Response): Promise<Response> {
    try {
      const { 
        changeType, 
        oldValue, 
        newValue, 
        changedBy, 
        txHash, 
        holdingDate,
      } = req.body;

      if (!changeType || !newValue || !changedBy) {
        return res.status(400).json({
          success: false,
          message: 'changeType, newValue, and changedBy are required'
        });
      }

      if (!['percentage', 'recipient', 'holding_date'].includes(changeType)) {
        return res.status(400).json({
          success: false,
          message: 'changeType must be "percentage", "recipient", or "holding_date"'
        });
      }

      const feeChangeRecord = await prisma.feeChangeHistory.create({
        data: {
          changeType,
          oldValue: oldValue || null,
          newValue,
          changedBy,
          txHash: txHash || null,
          holdingDate: holdingDate || null,
        }
      });

      return res.status(201).json({
        success: true,
        message: 'Fee change record added successfully',
        data: feeChangeRecord
      });

    } catch (error) {
      console.error('Error adding fee change record:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to add fee change record',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get current fee settings (latest from history)
  static async getCurrentFeeSettings(req: Request, res: Response): Promise<Response> {
    try {
      const [latestPercentage, latestRecipient] = await Promise.all([
        prisma.feeChangeHistory.findFirst({
          where: { changeType: 'percentage' },
          orderBy: { createdAt: 'desc' },
          select: {
            newValue: true,
            changedBy: true,
            txHash: true,
            createdAt: true
          }
        }),
        prisma.feeChangeHistory.findFirst({
          where: { changeType: 'recipient' },
          orderBy: { createdAt: 'desc' },
          select: {
            newValue: true,
            changedBy: true,
            txHash: true,
            createdAt: true
          }
        })
      ]);

      return res.status(200).json({
        success: true,
        data: {
          feePercentage: latestPercentage?.newValue || '0',
          feeRecipient: latestRecipient?.newValue || '',
          lastUpdated: {
            percentage: latestPercentage?.createdAt || null,
            recipient: latestRecipient?.createdAt || null
          }
        }
      });

    } catch (error) {
      console.error('Error fetching current fee settings:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch current fee settings',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
