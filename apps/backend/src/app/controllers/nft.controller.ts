import { Request, Response } from 'express';
import prisma from '../db/prisma_client';
import xlsx from "xlsx";
import fs from 'fs';
import { promises as fsPromises } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import lighthouse from '@lighthouse-web3/sdk'
import { NFT_STORAGE_ENDPOINT, NFT_STORAGE_API_KEY } from '../config/env';
import { safeLogError, safeLogWarn } from '../utils/safeLogger';
import { findUploadedImageByOriginalName } from '../middlewares/imageUploadSecurity';
import { isPublicImageAssetRequestPath } from '../middlewares/publicImageAssets';

interface NFTData {
  Name: string;
  Description: string;
  Image: string;
  Creator: string;
  Owner: string;
  Royalty: string;
  Attributes: string;
  "Collection ID": string;
  "External URL"?: string;
}

// Upload directory for images - use project root, not dist folder
// This ensures paths are consistent with multer configuration
const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads/images');

type AuthenticatedNftUser = {
  user_id?: number;
};

type LocalImageValidationResult =
  | { ok: true; filePath: string; filename: string }
  | { ok: false; status: string; reason: string };

const getAuthenticatedNftUserId = (req: Request): number | null => {
  const userId = Number((req.user as AuthenticatedNftUser | undefined)?.user_id);
  return Number.isInteger(userId) && userId > 0 ? userId : null;
};

const cleanupUploadedFiles = async (files: Express.Multer.File[] | undefined): Promise<void> => {
  await Promise.all((files ?? []).map((file) => fsPromises.unlink(file.path).catch(() => undefined)));
};

export class NftController {
  private static toAdminNftResponse(nft: Record<string, any>): Record<string, any> {
    const { localImagePath, ...safeNft } = nft;
    return {
      ...safeNft,
      hasLocalImagePath: Boolean(localImagePath)
    };
  }

  private static isInsideUploadDirectory(filePath: string): boolean {
    const relativePath = path.relative(path.resolve(UPLOAD_DIR), filePath);
    return relativePath.length > 0 && !relativePath.startsWith('..') && !path.isAbsolute(relativePath);
  }

  private static validateLocalImageForIpfs(localImagePath: string): LocalImageValidationResult {
    const resolvedPath = path.resolve(localImagePath);

    if (!this.isInsideUploadDirectory(resolvedPath)) {
      return { ok: false, status: 'error: unsafe local image path', reason: 'outside_upload_dir' };
    }

    if (!isPublicImageAssetRequestPath(resolvedPath)) {
      return { ok: false, status: 'error: unsupported image extension', reason: 'unsupported_extension' };
    }

    try {
      if (!fs.existsSync(resolvedPath)) {
        return { ok: false, status: 'error: image file not found', reason: 'missing_file' };
      }

      const stats = fs.statSync(resolvedPath);
      if (!stats.isFile()) {
        return { ok: false, status: 'error: image file not found', reason: 'not_file' };
      }
    } catch {
      return { ok: false, status: 'error: image file not found', reason: 'stat_failed' };
    }

    return {
      ok: true,
      filePath: resolvedPath,
      filename: path.basename(resolvedPath)
    };
  }

  /**
   * Parse Excel file and return data
   */
  private static async processExcelFile(filePath: string): Promise<NFTData[]> {
    const workbook = xlsx.readFile(filePath);
    const sheet_name_list = workbook.SheetNames;
    return xlsx.utils.sheet_to_json<NFTData>(workbook.Sheets[sheet_name_list[0]]);
  }

  /**
   * Find matching image file in uploads directory
   * Returns the full filename if found, null otherwise
   */
  private static async findImageFile(imageName: string, uploadDir: string): Promise<string | null> {
    try {
      const manifestMatch = await findUploadedImageByOriginalName(imageName, uploadDir);
      if (manifestMatch) return manifestMatch;

      const files = await fsPromises.readdir(uploadDir);
      // Remove file extension from imageName if present
      const cleanImageName = imageName.replace(/\.[^/.]+$/, '');
      // Find file that matches the pattern: timestamp----imageName.extension
      const matchedFile = files.find((file: string) => {
        const fileName = file.split('----').pop()?.replace(/\.[^/.]+$/, '');
        return fileName === cleanImageName.replace(/\s+/g, '_');
      });
      return matchedFile || null;
    } catch (error) {
      safeLogError('find_uploaded_nft_image', error);
      return null;
    }
  }

  /**
   * Parse attributes from string format to JSON
   */
  private static parseAttributes(attributesStr: string): any[] {
    try {
      // Handle the malformed string format
      const cleanStr = attributesStr.replace(/"/g, '"').replace(/'/g, '"');
      const attributeMatches = cleanStr.match(/"([^"]+)",\s*"value":\s*"([^"]+)"/g);

      if (attributeMatches) {
        return attributeMatches.map(match => {
          const [, trait_type, value] = match.match(/"([^"]+)",\s*"value":\s*"([^"]+)"/) || [];
          return { trait_type, value };
        });
      }

      // Fallback: try to parse as JSON if it's already valid
      return JSON.parse(attributesStr);
    } catch (error) {
      safeLogWarn('parse_nft_attributes', error);
      return [];
    }
  }

  /**
   * Upload image to IPFS via Lighthouse
   */
  private static async imageUpload(imagePath: string): Promise<string> {
    try {
      console.log('Lighthouse image upload starting');
      
      // Verify file exists before upload
      if (!fs.existsSync(imagePath)) {
        throw new Error('Image file does not exist');
      }
      
      const fileStats = fs.statSync(imagePath);
      console.log('Lighthouse image upload file summary', { size: fileStats.size });
      
      const output = await lighthouse.upload(imagePath, NFT_STORAGE_API_KEY);
      
      if (!output?.data?.Hash) {
        throw new Error('Lighthouse response did not contain a Hash');
      }
      
      return output.data.Hash;
    } catch (error) {
      safeLogError('lighthouse_upload_image', error, {
        imagePath: path.basename(imagePath)
      });
      throw new Error('Failed to upload image');
    }
  }

  /**
   * Upload metadata JSON to IPFS via Lighthouse
   */
  private static async uploadMetadata(metadata: any): Promise<string> {
    const tempFilePath = path.join(process.cwd(), 'uploads', `${randomUUID()}.json`);
    try {
      await fsPromises.mkdir(path.dirname(tempFilePath), { recursive: true });
      await fs.promises.writeFile(tempFilePath, JSON.stringify(metadata, null, 2));
      const output = await lighthouse.upload(tempFilePath, NFT_STORAGE_API_KEY);
      return output.data.Hash;
    } catch (error) {
      safeLogError('lighthouse_upload_metadata', error, {
        metadataName: typeof metadata?.name === 'string' ? metadata.name : undefined
      });
      throw new Error('Failed to upload metadata');
    } finally {
      await fsPromises.unlink(tempFilePath).catch(() => undefined);
    }
  }

  /**
   * STEP 1: Upload Excel - Save to database WITHOUT IPFS upload
   * This just saves the Excel data and checks for image matches
   */
  static async uploadExcel(req: Request, res: Response): Promise<Response> {
    let uploadedFilePath: string | undefined;
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      uploadedFilePath = req.file.path;
      const filePath = uploadedFilePath;

      // Process Excel file
      const xlData = await this.processExcelFile(filePath);
      
      const results: { name: string; status: string; imageMatched: boolean }[] = [];

      // Ensure upload directory exists
      if (!fs.existsSync(UPLOAD_DIR)) {
        fs.mkdirSync(UPLOAD_DIR, { recursive: true });
      }

      for (const data of xlData) {
        try {
          // Check if NFT already exists
          const existingNft = await prisma.nft.findFirst({
            where: { name: data.Name }
          });

          if (existingNft) {
            results.push({ name: data.Name, status: 'skipped (already exists)', imageMatched: existingNft.imageMatched });
            continue;
          }

          // Check for matching image file
          const imageFile = await this.findImageFile(data.Image, UPLOAD_DIR);
          const imageMatched = imageFile !== null;
          const localImagePath = imageFile ? path.join(UPLOAD_DIR, imageFile) : null;

          // Save to database WITHOUT IPFS upload
          await prisma.nft.create({
            data: {
              holderId: 0,
              name: data.Name,
              description: data.Description,
              image: '', // Will be set after IPFS upload
              excelImageName: data.Image, // Store original Excel image name
              localImagePath: localImagePath, // Store matched local path
              creator: data.Creator,
              owner: data.Owner,
              royalty: parseFloat(data.Royalty) || 0,
              attributes: this.parseAttributes(data.Attributes),
              collectionId: data["Collection ID"],
              externalUrl: data["External URL"] || null,
              ipfsCid: null,
              mintStatus: false,
              excelUploaded: true,
              ipfsUploaded: false,
              imageMatched: imageMatched
            }
          });

          results.push({ 
            name: data.Name, 
            status: imageMatched ? 'saved (image matched)' : 'saved (no image)', 
            imageMatched 
          });
        } catch (error) {
          safeLogError('process_nft_excel_row', error);
          results.push({ name: data.Name, status: 'error: failed to save NFT metadata', imageMatched: false });
        }
      }

      // Cleanup Excel file
      await fsPromises.unlink(filePath).catch(() => {});
      uploadedFilePath = undefined;

      // Get all NFTs
      const nfts = await prisma.nft.findMany({
        orderBy: { createdAt: 'desc' }
      });

      return res.json({
        success: true,
        message: 'Excel data saved to database',
        results,
        matchedCount: results.filter(r => r.imageMatched).length,
        unmatchedCount: results.filter(r => !r.imageMatched && r.status.includes('saved')).length,
        data: nfts.map((nft) => this.toAdminNftResponse(nft))
      });

    } catch (error) {
      if (uploadedFilePath) {
        await fsPromises.unlink(uploadedFilePath).catch(() => undefined);
      }
      safeLogError('upload_nft_excel', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to process Excel file'
      });
    }
  }

  /**
   * Upload images and auto-match with existing NFT records
   */
  static async uploadImages(req: Request, res: Response): Promise<Response> {
    try {
      const requestFiles = Array.isArray(req.files) ? req.files as Express.Multer.File[] : [];
      if (requestFiles.length === 0) {
        return res.status(400).json({ message: "No files uploaded!" });
      }

      const uploadedFiles = requestFiles.map(file => ({
        filename: file.filename,
        originalname: file.originalname,
        filePath: path.normalize(file.path),
        size: file.size,
        mimetype: file.mimetype
      }));

      console.log('NFT image upload completed', { fileCount: uploadedFiles.length });

      // Auto-match uploaded images with unmatched NFT records
      let matchedCount = 0;
      for (const file of uploadedFiles) {
        // Find NFTs that don't have a matched image yet
        const unmatchedNfts = await prisma.nft.findMany({
          where: { imageMatched: false, excelUploaded: true }
        });

        for (const nft of unmatchedNfts) {
          if (!nft.excelImageName) continue;

          // Check if this uploaded file matches the NFT's Excel image name
          const cleanExcelName = nft.excelImageName.replace(/\.[^/.]+$/, '').replace(/\s+/g, '_').toLowerCase();
          const cleanUploadedName = file.originalname.replace(/\.[^/.]+$/, '').replace(/\s+/g, '_').toLowerCase();

          if (cleanExcelName === cleanUploadedName) {
            await prisma.nft.update({
              where: { id: nft.id },
              data: {
                imageMatched: true,
                localImagePath: file.filePath
              }
            });
            matchedCount++;
            break; // Move to next file once matched
          }
        }
      }

      console.log('NFT image upload match summary', { matchedCount });

      return res.json({
        success: true,
        message: `Files uploaded successfully! ${matchedCount} NFT(s) matched.`,
        files: uploadedFiles.map(({ filePath, originalname, ...file }) => file),
        matchedCount
      });
    } catch (error) {
      await cleanupUploadedFiles(Array.isArray(req.files) ? req.files as Express.Multer.File[] : undefined);
      safeLogError('upload_nft_images', error);
      return res.status(500).json({
        success: false,
        message: "Server error while uploading files"
      });
    }
  }

  /**
   * Upload a single image for a specific NFT
   */
  static async uploadSingleImage(req: Request, res: Response): Promise<Response> {
    try {
      const { nftId } = req.params;

      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }

      const nft = await prisma.nft.findUnique({
        where: { id: Number(nftId) }
      });

      if (!nft) {
        // Delete uploaded file if NFT not found
        await fsPromises.unlink(req.file.path).catch(() => {});
        return res.status(404).json({ success: false, message: 'NFT not found' });
      }

      // Update NFT with the new image path
      const updatedNft = await prisma.nft.update({
        where: { id: Number(nftId) },
        data: {
          imageMatched: true,
          localImagePath: req.file.path,
          excelImageName: nft.excelImageName || req.file.originalname
        },
        select: {
          id: true,
          name: true,
          excelImageName: true,
          imageMatched: true,
          updatedAt: true
        }
      });

      return res.json({
        success: true,
        message: 'Image uploaded and matched successfully',
        data: {
          ...updatedNft,
          hasLocalImagePath: true
        }
      });
    } catch (error) {
      if (req.file) {
        await cleanupUploadedFiles([req.file]);
      }
      safeLogError('upload_single_nft_image', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to upload image'
      });
    }
  }

  /**
   * STEP 2: Upload selected NFTs to IPFS
   * Admin selects which NFTs to upload after verification
   */
  static async uploadToIPFS(req: Request, res: Response): Promise<Response> {
    try {
      const { nftIds } = req.body;

      console.log('Upload to IPFS request received', {
        nftIdCount: Array.isArray(nftIds) ? nftIds.length : 0
      });

      // Check if API key is configured
      if (!NFT_STORAGE_API_KEY) {
        safeLogError('upload_to_ipfs_missing_configuration', new Error('IPFS storage is not configured'));
        return res.status(500).json({
          success: false,
          message: 'IPFS storage is not configured'
        });
      }

      if (!nftIds || !Array.isArray(nftIds) || nftIds.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Please provide an array of NFT IDs to upload' 
        });
      }

      const results: { id: number; name: string; status: string }[] = [];

      for (const nftId of nftIds) {
        try {
          console.log('Processing NFT IPFS upload item', { nftId: Number(nftId) });
          
          const nft = await prisma.nft.findUnique({
            where: { id: Number(nftId) }
          });

          if (!nft) {
            console.log('NFT not found during IPFS upload', { nftId: Number(nftId) });
            results.push({ id: nftId, name: 'Unknown', status: 'error: NFT not found' });
            continue;
          }

          console.log('NFT IPFS upload record summary', {
            nftId: nft.id,
            imageMatched: nft.imageMatched,
            hasLocalImagePath: Boolean(nft.localImagePath)
          });

          if (nft.ipfsUploaded) {
            console.log('NFT already uploaded to IPFS', { nftId: nft.id });
            results.push({ id: nftId, name: nft.name, status: 'skipped: already uploaded to IPFS' });
            continue;
          }

          if (!nft.imageMatched || !nft.localImagePath) {
            console.log('No matched image for NFT IPFS upload', { nftId: nft.id });
            results.push({ id: nftId, name: nft.name, status: 'error: no image matched' });
            continue;
          }

          const localImage = this.validateLocalImageForIpfs(nft.localImagePath);
          console.log('Checking local image file for IPFS upload', {
            nftId: nft.id,
            filename: path.basename(nft.localImagePath)
          });

          if (!localImage.ok) {
            console.log('Local image rejected for IPFS upload', {
              nftId: nft.id,
              reason: localImage.reason
            });
            results.push({ id: Number(nftId), name: nft.name, status: localImage.status });
            continue;
          }

          console.log('Uploading image to IPFS', { nftId: nft.id });
          
          // Upload image to IPFS
          const imageCid = await this.imageUpload(localImage.filePath);
          
          const imageUrl = `${NFT_STORAGE_ENDPOINT}${imageCid}`;

          // Create metadata object
          const metadata = {
            name: nft.name,
            description: nft.description,
            image: imageUrl,
            creator: nft.creator,
            owner: nft.owner,
            royalty: nft.royalty,
            attributes: nft.attributes,
            collectionId: nft.collectionId,
            externalUrl: nft.externalUrl,
          };

          console.log('Uploading metadata to IPFS', { nftId: nft.id });
          
          // Upload metadata to IPFS
          const metadataCid = await this.uploadMetadata(metadata);
          
          const metadataUrl = `${NFT_STORAGE_ENDPOINT}${metadataCid}`;

          // Update database
          await prisma.nft.update({
            where: { id: nft.id },
            data: {
              image: imageUrl,
              ipfsCid: metadataUrl,
              ipfsUploaded: true,
              localImagePath: null // Clear local path after IPFS upload
            }
          });

          // Delete local image file after successful IPFS upload
          try {
            if (fs.existsSync(localImage.filePath)) {
              await fsPromises.unlink(localImage.filePath);
              console.log('Deleted local NFT image file', { nftId: nft.id });
            }
          } catch (deleteError) {
            safeLogError('delete_uploaded_nft_local_file', deleteError, { nftId: nft.id });
          }

          console.log('NFT successfully uploaded to IPFS', { nftId: nft.id });
          results.push({ id: nftId, name: nft.name, status: 'success: uploaded to IPFS' });
        } catch (error) {
          safeLogError('upload_nft_to_ipfs', error, { nftId: Number(nftId) });
          results.push({ id: nftId, name: 'Unknown', status: 'error: failed to upload NFT to IPFS' });
        }
      }

      const successCount = results.filter(r => r.status.includes('success')).length;
      const errorCount = results.filter(r => r.status.includes('error')).length;
      const partialSuccess = successCount > 0 && errorCount > 0;
      const responseStatus = partialSuccess ? 207 : errorCount > 0 ? 400 : 200;

      console.log('NFT IPFS upload complete', { successCount, errorCount });

      return res.status(responseStatus).json({
        success: errorCount === 0,
        partialSuccess,
        message: `IPFS upload completed. ${successCount} succeeded, ${errorCount} failed.`,
        results,
        successCount,
        errorCount
      });
    } catch (error) {
      safeLogError('upload_to_ipfs', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to upload to IPFS',
        error: 'IPFS upload failed'
      });
    }
  }

  /**
   * Refresh image matches for all NFTs
   * Re-scans the uploads directory and updates match status
   */
  static async refreshImageMatches(req: Request, res: Response): Promise<Response> {
    try {
      console.log('Refreshing image matches');

      // Check if upload directory exists
      if (!fs.existsSync(UPLOAD_DIR)) {
        fs.mkdirSync(UPLOAD_DIR, { recursive: true });
      }

      // List all files in directory
      const allFiles = await fsPromises.readdir(UPLOAD_DIR);
      console.log('Uploaded image directory summary', { fileCount: allFiles.length });

      // Get all NFTs that haven't been uploaded to IPFS yet
      const nfts = await prisma.nft.findMany({
        where: { ipfsUploaded: false, excelUploaded: true }
      });

      console.log('NFT image refresh candidate summary', { nftCount: nfts.length });

      let matchedCount = 0;
      let unmatchedCount = 0;

      for (const nft of nfts) {
        if (!nft.excelImageName) {
          unmatchedCount++;
          continue;
        }

        const imageFile = await this.findImageFile(nft.excelImageName, UPLOAD_DIR);
        const imageMatched = imageFile !== null;
        const localImagePath = imageFile ? path.normalize(path.join(UPLOAD_DIR, imageFile)) : null;

        await prisma.nft.update({
          where: { id: nft.id },
          data: {
            imageMatched,
            localImagePath
          }
        });

        if (imageMatched) {
          matchedCount++;
        } else {
          unmatchedCount++;
        }
      }

      console.log('NFT image match refresh complete', { matchedCount, unmatchedCount });

      return res.json({
        success: true,
        message: `Image match refresh completed. ${matchedCount} matched, ${unmatchedCount} unmatched.`,
        matchedCount,
        unmatchedCount
      });
    } catch (error) {
      safeLogError('refresh_nft_image_matches', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to refresh image matches'
      });
    }
  }

  /**
   * Get list of uploaded images (for preview and matching)
   */
  static async getUploadedImages(req: Request, res: Response): Promise<Response> {
    try {
      if (!fs.existsSync(UPLOAD_DIR)) {
        return res.json({ success: true, images: [] });
      }

      const files = (await fsPromises.readdir(UPLOAD_DIR)).filter((file) =>
        isPublicImageAssetRequestPath(file)
      );
      const images = files.map(file => ({
        filename: file,
        path: `/api/icons/images/${file}` // URL to access the image
      }));

      return res.json({
        success: true,
        images,
        count: images.length
      });
    } catch (error) {
      safeLogError('get_uploaded_nft_images', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get uploaded images'
      });
    }
  }

  /**
   * Get all NFTs with all status fields
   */
  static async getAllNfts(req: Request, res: Response): Promise<Response> {
    try {
      const nfts = await prisma.nft.findMany({
        select: {
          id: true,
          holderId: true,
          name: true,
          description: true,
          image: true,
          excelImageName: true,
          localImagePath: true,
          creator: true,
          owner: true,
          royalty: true,
          attributes: true,
          collectionId: true,
          externalUrl: true,
          ipfsCid: true,
          mintStatus: true,
          excelUploaded: true,
          ipfsUploaded: true,
          imageMatched: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: { createdAt: 'desc' }
      });

      return res.status(200).json({
        success: true,
        data: nfts.map((nft) => this.toAdminNftResponse(nft))
      });
    } catch (error) {
      safeLogError('get_all_nfts', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch NFTs'
      });
    }
  }

  /**
   * Get NFTs by holderId (for user's collection)
   */
  static async getNFTsByHolderId(req: Request, res: Response): Promise<Response> {
    try {
      const { holderId } = req.params;
      const authenticatedUserId = getAuthenticatedNftUserId(req);

      if (!authenticatedUserId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthenticated'
        });
      }

      if (!holderId || isNaN(Number(holderId))) {
        return res.status(400).json({
          success: false,
          message: 'Valid holderId is required'
        });
      }

      if (Number(holderId) !== authenticatedUserId) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden'
        });
      }

      const nfts = await prisma.nft.findMany({
        where: {
          holderId: authenticatedUserId,
          mintStatus: true
        },
        select: {
          id: true,
          holderId: true,
          name: true,
          description: true,
          image: true,
          attributes: true,
          externalUrl: true,
          mintStatus: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      });

      return res.status(200).json({
        success: true,
        data: nfts
      });
    } catch (error) {
      safeLogError('get_holder_nfts', error, {
        holderId: Number(req.params.holderId)
      });
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch NFTs'
      });
    }
  }

  /**
   * Get NFTs that are available to mint (uploaded to IPFS but not yet minted)
   */
  static async getMintableNfts(req: Request, res: Response): Promise<Response> {
    try {
      const nfts = await prisma.nft.findMany({
        where: {
          ipfsUploaded: true,
          mintStatus: false
        },
        select: {
          id: true,
          name: true,
          description: true,
          image: true
        },
        orderBy: { id: 'asc' }
      });

      return res.status(200).json({
        success: true,
        data: nfts,
        count: nfts.length
      });
    } catch (error) {
      safeLogError('get_mintable_nfts', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch mintable NFTs'
      });
    }
  }

  /**
   * Get NFT by token ID (for minting)
   */
  static async getNFTById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      if (!id || isNaN(Number(id))) {
        return res.json({
          success: false,
          message: 'Valid NFT ID is required'
        });
      }

      const nft = await prisma.nft.findFirst({
        where: { name: `DISCO Genesis #${id}` },
        select: {
          id: true,
          name: true,
          description: true,
          image: true,
          attributes: true,
          externalUrl: true,
          ipfsCid: true,
          mintStatus: true,
          ipfsUploaded: true
        }
      });

      if (!nft) {
        return res.json({
          success: false,
          message: 'NFT not found'
        });
      }

      if (nft.mintStatus) {
        return res.json({
          success: false,
          message: 'NFT already minted'
        });
      }

      if (!nft.ipfsUploaded) {
        return res.json({
          success: false,
          message: 'NFT not yet uploaded to IPFS'
        });
      }

      return res.json({
        success: true,
        data: {
          id: nft.id,
          name: nft.name,
          description: nft.description,
          image: nft.image,
          attributes: nft.attributes,
          externalUrl: nft.externalUrl,
          ipfsCid: nft.ipfsCid
        }
      });
    } catch (error) {
      safeLogError('get_nft_by_token_id', error, {
        tokenId: Number(req.params.id)
      });
      return res.json({
        success: false,
        message: 'Failed to fetch NFT'
      });
    }
  }

  /**
   * Update NFT (for minting status update)
   */
  static async updateNFT(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { holderId, mintStatus } = req.body;

      if (!id || isNaN(Number(id))) {
        return res.status(400).json({
          success: false,
          message: 'Valid NFT ID is required'
        });
      }

      const updateData: any = {};
      if (holderId !== undefined) updateData.holderId = holderId;
      if (mintStatus !== undefined) updateData.mintStatus = mintStatus;

      const updateResult = await prisma.nft.updateMany({
        where: { name: `DISCO Genesis #${id}` },
        data: updateData
      });

      if (updateResult.count === 0) {
        return res.status(404).json({
          success: false,
          message: 'NFT not found'
        });
      }

      const updatedNFT = await prisma.nft.findFirst({
        where: { name: `DISCO Genesis #${id}` }
      });

      // If NFT was just minted (mintStatus changed to true and holderId provided), give immediate 1 fan-point
      if (mintStatus === true && holderId) {
        try {
          // Create point history record
          await prisma.pointHistory.create({
            data: {
              userId: holderId,
              point: 1,
              reason: 3, // Real NFT Bonus
              receivedDate: new Date()
            }
          });

          // Update user's fan points
          await prisma.user.update({
            where: { id: holderId },
            data: { fan_points: { increment: 1 } }
          });

          console.log(`🎁 User ${holderId} received 1 fan-point immediately for Real NFT mint (${updatedNFT?.name})`);
        } catch (pointError) {
          safeLogError('give_immediate_nft_mint_bonus', pointError, {
            holderId: Number(holderId),
            tokenId: Number(id)
          });
          // Don't fail the whole request if point reward fails
        }
      }

      return res.status(200).json({
        success: true,
        message: 'NFT updated successfully',
        data: updatedNFT
      });
    } catch (error) {
      safeLogError('update_nft', error, {
        tokenId: Number(req.params.id)
      });
      return res.status(500).json({
        success: false,
        message: 'Failed to update NFT'
      });
    }
  }

  /**
   * Delete NFT record (admin only)
   */
  static async deleteNFT(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      if (!id || isNaN(Number(id))) {
        return res.status(400).json({
          success: false,
          message: 'Valid NFT ID is required'
        });
      }

      const nft = await prisma.nft.findUnique({
        where: { id: Number(id) }
      });

      if (!nft) {
        return res.status(404).json({
          success: false,
          message: 'NFT not found'
        });
      }

      // Don't allow deleting minted NFTs
      if (nft.mintStatus) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete a minted NFT'
        });
      }

      await prisma.nft.delete({
        where: { id: Number(id) }
      });

      return res.json({
        success: true,
        message: 'NFT deleted successfully'
      });
    } catch (error) {
      safeLogError('delete_nft', error, {
        nftId: Number(req.params.id)
      });
      return res.status(500).json({
        success: false,
        message: 'Failed to delete NFT'
      });
    }
  }
}
