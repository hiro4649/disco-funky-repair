import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class NewsController {
    // Create a new news item
    static async create(req: Request, res: Response) {
        try {
            const { title, content, image_url } = req.body;
            const news = await prisma.news.create({
                data: {
                    title,
                    content,
                    image_url
                }
            });
            return res.status(201).json({
                success: true,
                data: news
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Error creating news',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // Get all news items
    static async getAll(req: Request, res: Response) {
        try {
            const news = await prisma.news.findMany({
                orderBy: {
                    createdAt: 'desc'
                }
            });
            return res.status(200).json({
                success: true,
                data: news
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Error fetching news',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // Get a single news item by ID
    static async getById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const news = await prisma.news.findUnique({
                where: { id: parseInt(id) },
                select: {
                    id: true,
                    title: true,
                    content: true,
                    image_url: true,
                    createdAt: true
                }
            });

            if (!news) {
                return res.status(404).json({
                    success: false,
                    message: 'News not found'
                });
            }

            return res.status(200).json({
                success: true,
                data: news
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Error fetching news',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // Update a news item
    static async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { title, content, image_url } = req.body;

            const news = await prisma.news.update({
                where: { id: parseInt(id) },
                data: {
                    title,
                    content,
                    image_url
                }
            });

            return res.status(200).json({
                success: true,
                data: news
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Error updating news',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // Delete a news item
    static async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            await prisma.news.delete({
                where: { id: parseInt(id) }
            });

            return res.status(200).json({
                success: true,
                message: 'News deleted successfully'
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Error deleting news',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}
