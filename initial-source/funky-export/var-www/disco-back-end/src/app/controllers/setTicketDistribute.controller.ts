import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { setupDynamicCron } from '../services/trackingService';
import { fetchDiscoTokenBalance } from '../lib/trackingTokenBalance';
const prisma = new PrismaClient();

export class SetTicketDistributeController {
    // Create new ticket distribution setting
    static async create(req: Request, res: Response) {
        try {
            const { day, hour, minutes, weekly } = req.body;
            const ticketDistribute = await prisma.setTicketDistribute.create({
                data: {
                    day: isNaN(Number(day)) ? null : Number(day),
                    hour: isNaN(Number(hour)) ? null : Number(hour),
                    minutes: isNaN(Number(minutes)) ? null : Number(minutes),
                    weekly: Boolean(weekly)
                }
            });
            setupDynamicCron();
            return res.status(201).json({
                success: true,
                data: ticketDistribute
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Error creating ticket distribution setting',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // Get all ticket distribution settings
    static async getAll(req: Request, res: Response) {
        try {
            const ticketDistributes = await prisma.setTicketDistribute.findMany();
            return res.status(200).json({
                success: true,
                data: ticketDistributes
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Error fetching ticket distribution settings',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // Get single ticket distribution setting by ID
    static async getById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const ticketDistribute = await prisma.setTicketDistribute.findUnique({
                where: { id: parseInt(id) }
            });

            if (!ticketDistribute) {
                return res.status(404).json({
                    success: false,
                    message: 'Ticket distribution setting not found'
                });
            }

            return res.status(200).json({
                success: true,
                data: ticketDistribute
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Error fetching ticket distribution setting',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // Update ticket distribution setting
    static async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { day, hour, minutes, weekly } = req.body;

            const ticketDistribute = await prisma.setTicketDistribute.update({
                where: { id: parseInt(id) },
                data: {
                    day,
                    hour,
                    minutes,
                    weekly
                }
            });

            setupDynamicCron();

            return res.status(200).json({
                success: true,
                data: ticketDistribute
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Error updating ticket distribution setting',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // Delete ticket distribution setting
    static async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            await prisma.setTicketDistribute.delete({
                where: { id: parseInt(id) }
            });

            setupDynamicCron();

            return res.status(200).json({
                success: true,
                message: 'Ticket distribution setting deleted successfully'
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Error deleting ticket distribution setting',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // Manual trigger for weekly bonus distribution
    static async triggerWeeklyBonus(req: Request, res: Response) {
        try {
            console.log('Manual weekly bonus distribution triggered');
            await fetchDiscoTokenBalance(3);
            
            return res.status(200).json({
                success: true,
                message: 'Weekly bonus distribution triggered successfully'
            });
        } catch (error) {
            console.error('Error triggering weekly bonus distribution:', error);
            return res.status(500).json({
                success: false,
                message: 'Error triggering weekly bonus distribution',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
} 