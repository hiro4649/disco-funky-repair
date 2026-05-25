import { Request, Response } from 'express';
import prisma from '../db/prisma_client';
import moment from 'moment';
import fs from 'fs';
import { promises as fsPromises } from 'fs';
import lighthouse from '@lighthouse-web3/sdk';
import { NFT_STORAGE_ENDPOINT, NFT_STORAGE_API_KEY } from '../config/env';
import { safeLogError } from '../utils/safeLogger';


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
                    message: 'Image storage is not configured'
                });
            }

            // Upload image to IPFS immediately
            let imageUrl = '';
            
            try {
                // Verify file exists
                if (!fs.existsSync(file.path)) {
                    throw new Error('Upload file does not exist');
                }

                // Upload to IPFS using Lighthouse
                const output = await lighthouse.upload(file.path, NFT_STORAGE_API_KEY);
                
                if (!output?.data?.Hash) {
                    throw new Error('Lighthouse response did not contain a Hash');
                }

                const imageCid = output.data.Hash;
                imageUrl = `${NFT_STORAGE_ENDPOINT}${imageCid}`;

                // Delete local file after successful IPFS upload
                try {
                    await fsPromises.unlink(file.path);
                } catch (deleteError) {
                    safeLogError('delete_trial_nft_template_upload_file', deleteError);
                }
            } catch (ipfsError) {
                safeLogError('upload_trial_nft_template_image', ipfsError);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to upload image to IPFS',
                    error: 'IPFS upload failed'
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

            return res.status(201).json({
                success: true,
                message: 'Trial NFT template created successfully',
                data: template
            });
        } catch (error) {
            safeLogError('trial_nft_template_create', error);
            return res.status(500).json({
                success: false,
                message: 'Error creating template'
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
            safeLogError('trial_nft_template_get_all', error);
            return res.status(500).json({
                success: false,
                message: 'Error fetching templates'
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
                select: {
                    id: true,
                    name: true,
                    description: true,
                    image: true,
                    validDays: true,
                    maxMints: true,
                    mintCount: true
                },
                orderBy: { createdAt: 'desc' }
            });

            // Filter templates that haven't reached max mints
            const availableTemplates = templates
                .filter(t => t.maxMints === 0 || t.mintCount < t.maxMints)
                .map(({ id, name, description, image, validDays }) => ({
                    id,
                    name,
                    description,
                    image,
                    validDays
                }));

            return res.status(200).json({
                success: true,
                data: availableTemplates,
                count: availableTemplates.length
            });
        } catch (error) {
            safeLogError('trial_nft_template_get_available', error);
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
                        message: 'Image storage is not configured'
                    });
                }

                // Upload new image to IPFS
                try {
                    // Verify file exists
                    if (!fs.existsSync(req.file.path)) {
                        throw new Error('Upload file does not exist');
                    }

                    // Upload to IPFS using Lighthouse
                    const output = await lighthouse.upload(req.file.path, NFT_STORAGE_API_KEY);
                    
                    if (!output?.data?.Hash) {
                        throw new Error('Lighthouse response did not contain a Hash');
                    }

                    const imageCid = output.data.Hash;
                    const imageUrl = `${NFT_STORAGE_ENDPOINT}${imageCid}`;

                    // Delete local file after successful IPFS upload
                    try {
                        await fsPromises.unlink(req.file.path);
                    } catch (deleteError) {
                        safeLogError('delete_trial_nft_template_updated_file', deleteError);
                    }

                    // Save IPFS URL
                    updateData.image = imageUrl;
                } catch (ipfsError) {
                    safeLogError('upload_trial_nft_template_updated_image', ipfsError);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to upload image to IPFS',
                        error: 'IPFS upload failed'
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
            safeLogError('trial_nft_template_update', error, { templateId: req.params.id });
            return res.status(500).json({
                success: false,
                message: 'Error updating template'
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
            safeLogError('trial_nft_template_delete', error, { templateId: req.params.id });
            return res.status(500).json({
                success: false,
                message: 'Error deleting template'
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
            safeLogError('trial_nft_template_get_stats', error);
            return res.status(500).json({
                success: false,
                message: 'Error fetching statistics'
            });
        }
    }
}
