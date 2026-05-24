import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { safeLogError } from '../utils/safeLogger';
// import { setupDynamicCron } from '../services/trackingService';
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
            // setupDynamicCron();
            return res.status(201).json({
                success: true,
                data: ticketDistribute
            });
        } catch (error) {
            safeLogError('ticket_distribution_setting_create', error);
            return res.status(500).json({
                success: false,
                message: 'Error creating ticket distribution setting'
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
            safeLogError('ticket_distribution_setting_get_all', error);
            return res.status(500).json({
                success: false,
                message: 'Error fetching ticket distribution settings'
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
            safeLogError('ticket_distribution_setting_get_by_id', error, { settingId: req.params.id });
            return res.status(500).json({
                success: false,
                message: 'Error fetching ticket distribution setting'
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

            // setupDynamicCron();

            return res.status(200).json({
                success: true,
                data: ticketDistribute
            });
        } catch (error) {
            safeLogError('ticket_distribution_setting_update', error, { settingId: req.params.id });
            return res.status(500).json({
                success: false,
                message: 'Error updating ticket distribution setting'
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

            // setupDynamicCron();

            return res.status(200).json({
                success: true,
                message: 'Ticket distribution setting deleted successfully'
            });
        } catch (error) {
            safeLogError('ticket_distribution_setting_delete', error, { settingId: req.params.id });
            return res.status(500).json({
                success: false,
                message: 'Error deleting ticket distribution setting'
            });
        }
    }
}
