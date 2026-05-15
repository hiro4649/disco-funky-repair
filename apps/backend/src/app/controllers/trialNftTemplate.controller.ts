import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import moment from 'moment';
import path from 'path';
import fs from 'fs';
import { promises as fsPromises } from 'fs';
import lighthouse from '@lighthouse-web3/sdk';
import { NFT_STORAGE_ENDPOINT, NFT_STORAGE_API_KEY } from '../config/env';

const prisma = new PrismaClient();

export class TrialNftTemplateController {
    /**
     * Create a new Trial NFT template (Admin)
     * POST /api/admin/trial-nft-templates
     */
    static async create(req: Request, res: Response) {
        try {
            const { name, description, maxMints, validDays } = req.body;
            const file = req.file;

            if (!name || !description) {
                return res.status(400).json({
                    success: false,
                    message: 'Name and description are required'
                });
            }

            if (!file) {
                return res.status(400).json({
                    success: false,
                    message: 'Image file is required'
                });
            }

            // Check if IPFS API key is configured
            if (!NFT_STORAGE_API_KEY) {
                return res.status(500).json({
                    success: false,
                    message: 'IPFS storage API key is not configured. Please set NFT_STORAGE_API_KEY in .env file.'
                });
            }

            // Upload image to IPFS immediately
            console.log(`📤 Uploading Trial NFT template image to IPFS: ${file.path}`);
            let imageUrl = '';
            
            try {
                // Verify file exists
                if (!fs.existsSync(file.path)) {
                    throw new Error(`File does not exist: ${file.path}`);
                }

                // Upload to IPFS using Lighthouse
                const output = await lighthouse.upload(file.path, NFT_STORAGE_API_KEY);
                
                if (!output?.data?.Hash) {
                    throw new Error('Lighthouse response did not contain a Hash');
                }

                const imageCid = output.data.Hash;
                imageUrl = `${NFT_STORAGE_ENDPOINT}${imageCid}`;
                
                console.log(`✅ Trial NFT template image uploaded to IPFS, CID: ${imageCid}`);
                console.log(`🔗 IPFS URL: ${imageUrl}`);

                // Delete local file after successful IPFS upload
                try {
                    await fsPromises.unlink(file.path);
                    console.log(`🗑️ Deleted local file: ${file.path}`);
                } catch (deleteError) {
                    console.warn(`⚠️ Could not delete local file ${file.path}:`, deleteError);
                }
            } catch (ipfsError) {
                console.error('❌ Error uploading Trial NFT template image to IPFS:', ipfsError);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to upload image to IPFS',
                    error: ipfsError instanceof Error ? ipfsError.message : 'Unknown error'
                });
            }

            const template = await prisma.trialNftTemplate.create({
                data: {
                    name,
                    description,
                    image: imageUrl, // Store IPFS URL instead of local path
                    maxMints: maxMints ? parseInt(maxMints) : 0,
                    validDays: validDays ? parseInt(validDays) : 5,
                    isAvailable: true,
                    mintCount: 0
                }
            });

            console.log(`✅ Created Trial NFT template: ${name}`);

            return res.status(201).json({
                success: true,
                message: 'Trial NFT template created successfully',
                data: template
            });
        } catch (error) {
            console.error('Error creating Trial NFT template:', error);
            return res.status(500).json({
                success: false,
                message: 'Error creating template',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Get all Trial NFT templates (Admin)
     * GET /api/admin/trial-nft-templates
     */
    static async getAll(req: Request, res: Response) {
        try {
            const { page = 1, limit = 20, available } = req.query;
            const skip = (Number(page) - 1) * Number(limit);

            const where: any = {};
            if (available !== undefined) {
                where.isAvailable = available === 'true';
            }

            const [templates, total] = await Promise.all([
                prisma.trialNftTemplate.findMany({
                    where,
                    skip,
                    take: Number(limit),
                    orderBy: { createdAt: 'desc' },
                    include: {
                        _count: {
                            select: { TrialNft: true }
                        }
                    }
                }),
                prisma.trialNftTemplate.count({ where })
            ]);

            return res.status(200).json({
                success: true,
                data: templates,
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    totalPages: Math.ceil(total / Number(limit))
                }
            });
        } catch (error) {
            console.error('Error fetching Trial NFT templates:', error);
            return res.status(500).json({
                success: false,
                message: 'Error fetching templates',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Get available Trial NFT templates for users to mint
     * GET /api/trial-nft-templates/available
     */
    static async getAvailable(req: Request, res: Response) {
        try {
            const templates = await prisma.trialNftTemplate.findMany({
                where: {
                    isAvailable: true,
                    OR: [
                        { maxMints: 0 }, // Unlimited
                        { mintCount: { lt: prisma.trialNftTemplate.fields.maxMints } }
                    ]
                },
                orderBy: { createdAt: 'desc' }
            });

            // Filter templates that haven't reached max mints
            const availableTemplates = templates.filter(t => 
                t.maxMints === 0 || t.mintCount < t.maxMints
            );

            return res.status(200).json({
                success: true,
                data: availableTemplates,
                count: availableTemplates.length
            });
        } catch (error) {
            console.error('Error fetching available templates:', error);
            return res.status(500).json({
                success: false,
                message: 'Error fetching templates'
            });
        }
    }

    /**
     * Update a Trial NFT template (Admin)
     * PATCH /api/admin/trial-nft-templates/:id
     */
    static async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { name, description, isAvailable, maxMints, validDays } = req.body;

            const updateData: any = {};
            if (name !== undefined) updateData.name = name;
            if (description !== undefined) updateData.description = description;
            if (isAvailable !== undefined) updateData.isAvailable = isAvailable === 'true' || isAvailable === true;
            if (maxMints !== undefined) updateData.maxMints = parseInt(maxMints);
            if (validDays !== undefined) updateData.validDays = parseInt(validDays);

            // Handle image update if new file uploaded
            if (req.file) {
                // Check if IPFS API key is configured
                if (!NFT_STORAGE_API_KEY) {
                    return res.status(500).json({
                        success: false,
                        message: 'IPFS storage API key is not configured. Please set NFT_STORAGE_API_KEY in .env file.'
                    });
                }

                // Upload new image to IPFS
                console.log(`📤 Uploading updated Trial NFT template image to IPFS: ${req.file.path}`);
                
                try {
                    // Verify file exists
                    if (!fs.existsSync(req.file.path)) {
                        throw new Error(`File does not exist: ${req.file.path}`);
                    }

                    // Upload to IPFS using Lighthouse
                    const output = await lighthouse.upload(req.file.path, NFT_STORAGE_API_KEY);
                    
                    if (!output?.data?.Hash) {
                        throw new Error('Lighthouse response did not contain a Hash');
                    }

                    const imageCid = output.data.Hash;
                    const imageUrl = `${NFT_STORAGE_ENDPOINT}${imageCid}`;
                    
                    console.log(`✅ Updated Trial NFT template image uploaded to IPFS, CID: ${imageCid}`);
                    console.log(`🔗 IPFS URL: ${imageUrl}`);

                    // Delete local file after successful IPFS upload
                    try {
                        await fsPromises.unlink(req.file.path);
                        console.log(`🗑️ Deleted local file: ${req.file.path}`);
                    } catch (deleteError) {
                        console.warn(`⚠️ Could not delete local file ${req.file.path}:`, deleteError);
                    }

                    // Save IPFS URL
                    updateData.image = imageUrl;
                } catch (ipfsError) {
                    console.error('❌ Error uploading updated Trial NFT template image to IPFS:', ipfsError);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to upload image to IPFS',
                        error: ipfsError instanceof Error ? ipfsError.message : 'Unknown error'
                    });
                }
            }

            const template = await prisma.trialNftTemplate.update({
                where: { id: parseInt(id) },
                data: updateData
            });

            return res.status(200).json({
                success: true,
                message: 'Template updated successfully',
                data: template
            });
        } catch (error) {
            console.error('Error updating Trial NFT template:', error);
            return res.status(500).json({
                success: false,
                message: 'Error updating template',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Delete a Trial NFT template (Admin)
     * DELETE /api/admin/trial-nft-templates/:id
     */
    static async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;

            // Check if any users have minted from this template
            const mintedCount = await prisma.trialNft.count({
                where: { templateId: parseInt(id) }
            });

            if (mintedCount > 0) {
                // Don't delete, just mark as unavailable
                await prisma.trialNftTemplate.update({
                    where: { id: parseInt(id) },
                    data: { isAvailable: false }
                });

                return res.status(200).json({
                    success: true,
                    message: 'Template marked as unavailable (has minted NFTs)',
                    softDeleted: true
                });
            }

            // Delete the template
            await prisma.trialNftTemplate.delete({
                where: { id: parseInt(id) }
            });

            return res.status(200).json({
                success: true,
                message: 'Template deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting Trial NFT template:', error);
            return res.status(500).json({
                success: false,
                message: 'Error deleting template',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Get statistics for Trial NFT templates (Admin)
     * GET /api/admin/trial-nft-templates/stats
     */
    static async getStats(req: Request, res: Response) {
        try {
            const [
                totalTemplates,
                availableTemplates,
                totalMinted,
                activeMinted
            ] = await Promise.all([
                prisma.trialNftTemplate.count(),
                prisma.trialNftTemplate.count({ where: { isAvailable: true } }),
                prisma.trialNft.count(),
                prisma.trialNft.count({
                    where: {
                        isActive: true,
                        expiresAt: { gt: new Date() }
                    }
                })
            ]);

            return res.status(200).json({
                success: true,
                data: {
                    totalTemplates,
                    availableTemplates,
                    totalMinted,
                    activeMinted
                }
            });
        } catch (error) {
            console.error('Error fetching template stats:', error);
            return res.status(500).json({
                success: false,
                message: 'Error fetching statistics'
            });
        }
    }
}
