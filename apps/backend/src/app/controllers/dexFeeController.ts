import { Request, Response } from 'express';
import prisma from '../db/prisma_client';

const GOVERNANCE_MANUAL_REVIEW_RESPONSE = {
  success: false,
  code: 'MANUAL_REVIEW_REQUIRED',
  message: 'Governance, fee, DEX, and pair management changes are disabled in the backend. Use the governance runbook and multisig/timelock process.'
};

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
      const errorName = error instanceof Error ? error.name : typeof error;
      console.error('Error fetching DEX addresses:', { errorName });
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch DEX addresses'
      });
    }
  }

  // Add new DEX address
  static async addDexAddress(req: Request, res: Response): Promise<Response> {
    return res.status(410).json(GOVERNANCE_MANUAL_REVIEW_RESPONSE);
  }

  // Remove DEX address (soft delete)
  static async removeDexAddress(req: Request, res: Response): Promise<Response> {
    return res.status(410).json(GOVERNANCE_MANUAL_REVIEW_RESPONSE);
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
      const errorName = error instanceof Error ? error.name : typeof error;
      console.error('Error fetching fee change history:', { errorName });
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch fee change history'
      });
    }
  }

  // Add fee change record
  static async addFeeChangeRecord(req: Request, res: Response): Promise<Response> {
    return res.status(410).json(GOVERNANCE_MANUAL_REVIEW_RESPONSE);
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
      const errorName = error instanceof Error ? error.name : typeof error;
      console.error('Error fetching current fee settings:', { errorName });
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch current fee settings'
      });
    }
  }
}
