import { Request, Response } from 'express';
import prisma from '../db/prisma_client';
import xlsx from "xlsx";
import fs from 'fs';
import { promises as fsPromises } from 'fs';
import path from 'path';
import lighthouse from '@lighthouse-web3/sdk'
import { NFT_STORAGE_ENDPOINT, NFT_STORAGE_API_KEY } from '../config/env';
import { safeLogError } from '../utils/safeLogger';

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

const getAuthenticatedNftUserId = (req: Request): number | null => {
  const userId = Number((req.user as AuthenticatedNftUser | undefined)?.user_id);
  return Number.isInteger(userId) && userId > 0 ? userId : null;
};

export class NftController {
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
      console.error('Error finding image file:', error);
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
      console.warn('Failed to parse attributes, using empty array:', error);
      return [];
    }
  }

  /**
   * Upload image to IPFS via Lighthouse
   */
  private static async imageUpload(imagePath: string): Promise<string> {
    try {
      console.log(`🔼 Lighthouse upload starting for: ${imagePath}`);
      console.log('🔑 Lighthouse API key configured:', Boolean(NFT_STORAGE_API_KEY));
      
      // Verify file exists before upload
      if (!fs.existsSync(imagePath)) {
        throw new Error(`File does not exist: ${imagePath}`);
      }
      
      const fileStats = fs.statSync(imagePath);
      console.log(`📄 File size: ${fileStats.size} bytes`);
      
      const output = await lighthouse.upload(imagePath, NFT_STORAGE_API_KEY);
      
      console.log(`✅ Lighthouse upload response:`, JSON.stringify(output?.data, null, 2));
      
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
    try {
      const tempFilePath = path.join(__dirname, `../../../uploads/${metadata.name.replace("DISCO Genesis #", "")}.json`);
      await fs.promises.writeFile(tempFilePath, JSON.stringify(metadata, null, 2));
      const output = await lighthouse.upload(tempFilePath, NFT_STORAGE_API_KEY);
      await fs.promises.unlink(tempFilePath);
      return output.data.Hash;
    } catch (error) {
      safeLogError('lighthouse_upload_metadata', error, {
        metadataName: typeof metadata?.name === 'string' ? metadata.name : undefined
      });
      throw new Error('Failed to upload metadata');
    }
  }

  /**
   * STEP 1: Upload Excel - Save to database WITHOUT IPFS upload
   * This just saves the Excel data and checks for image matches
   */
  static async uploadExcel(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const filePath = req.file.path;

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
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error(`Failed to process NFT ${data.Name}:`, error);
          results.push({ name: data.Name, status: `error: ${errorMessage}`, imageMatched: false });
        }
      }

      // Cleanup Excel file
      await fsPromises.unlink(filePath).catch(() => {});

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
        data: nfts
      });

    } catch (error) {
      console.error('Error in uploadExcel:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to process Excel file',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Upload images and auto-match with existing NFT records
   */
  static async uploadImages(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
        return res.status(400).json({ message: "No files uploaded!" });
      }

      const uploadedFiles = (req.files as Express.Multer.File[]).map(file => ({
        filename: file.filename,
        originalname: file.originalname,
        path: path.normalize(file.path), // Normalize path for cross-platform
        size: file.size,
        mimetype: file.mimetype
      }));

      console.log(`📤 Uploaded ${uploadedFiles.length} files`);

      // Auto-match uploaded images with unmatched NFT records
      let matchedCount = 0;
      for (const file of uploadedFiles) {
        console.log(`🔍 Trying to match: ${file.originalname}`);
        
        // Find NFTs that don't have a matched image yet
        const unmatchedNfts = await prisma.nft.findMany({
          where: { imageMatched: false, excelUploaded: true }
        });

        for (const nft of unmatchedNfts) {
          if (!nft.excelImageName) continue;

          // Check if this uploaded file matches the NFT's Excel image name
          const cleanExcelName = nft.excelImageName.replace(/\.[^/.]+$/, '').replace(/\s+/g, '_').toLowerCase();
          const cleanUploadedName = file.originalname.replace(/\.[^/.]+$/, '').replace(/\s+/g, '_').toLowerCase();

          console.log(`  Comparing: "${cleanExcelName}" vs "${cleanUploadedName}"`);

          if (cleanExcelName === cleanUploadedName) {
            console.log(`  ✅ Match found for NFT: ${nft.name}`);
            await prisma.nft.update({
              where: { id: nft.id },
              data: {
                imageMatched: true,
                localImagePath: file.path
              }
            });
            matchedCount++;
            break; // Move to next file once matched
          }
        }
      }

      console.log(`📊 Total matched: ${matchedCount}`);

      return res.json({
        success: true,
        message: `Files uploaded successfully! ${matchedCount} NFT(s) matched.`,
        files: uploadedFiles,
        matchedCount
      });
    } catch (error) {
      console.error('Error uploading files:', error);
      return res.status(500).json({
        success: false,
        message: "Server error while uploading files",
        error: error instanceof Error ? error.message : 'Unknown error'
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
        }
      });

      return res.json({
        success: true,
        message: 'Image uploaded and matched successfully',
        data: updatedNft
      });
    } catch (error) {
      console.error('Error uploading single image:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to upload image',
        error: error instanceof Error ? error.message : 'Unknown error'
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

      console.log('📤 Upload to IPFS request received:', { nftIds });

      // Check if API key is configured
      if (!NFT_STORAGE_API_KEY) {
        console.error('❌ NFT_STORAGE_API_KEY is not configured!');
        return res.status(500).json({
          success: false,
          message: 'IPFS storage API key is not configured. Please set NFT_STORAGE_API_KEY in .env file.'
        });
      }

      console.log('✅ API Key configured, endpoint:', NFT_STORAGE_ENDPOINT);

      if (!nftIds || !Array.isArray(nftIds) || nftIds.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Please provide an array of NFT IDs to upload' 
        });
      }

      const results: { id: number; name: string; status: string }[] = [];

      for (const nftId of nftIds) {
        try {
          console.log(`\n🔄 Processing NFT ID: ${nftId}`);
          
          const nft = await prisma.nft.findUnique({
            where: { id: Number(nftId) }
          });

          if (!nft) {
            console.log(`❌ NFT not found: ${nftId}`);
            results.push({ id: nftId, name: 'Unknown', status: 'error: NFT not found' });
            continue;
          }

          console.log(`📋 NFT found: ${nft.name}, imageMatched: ${nft.imageMatched}, localImagePath: ${nft.localImagePath}`);

          if (nft.ipfsUploaded) {
            console.log(`⏭️ Already uploaded to IPFS: ${nft.name}`);
            results.push({ id: nftId, name: nft.name, status: 'skipped: already uploaded to IPFS' });
            continue;
          }

          if (!nft.imageMatched || !nft.localImagePath) {
            console.log(`❌ No image matched for: ${nft.name}`);
            results.push({ id: nftId, name: nft.name, status: 'error: no image matched' });
            continue;
          }

          // Normalize path for cross-platform compatibility
          const normalizedPath = path.normalize(nft.localImagePath);
          console.log(`📁 Checking file at: ${normalizedPath}`);

          // Check if local image file exists
          if (!fs.existsSync(normalizedPath)) {
            console.log(`❌ File not found at: ${normalizedPath}`);
            // Try alternative path (in case stored path is different)
            const filename = path.basename(nft.localImagePath);
            const altPath = path.join(UPLOAD_DIR, filename);
            console.log(`🔍 Trying alternative path: ${altPath}`);
            
            if (fs.existsSync(altPath)) {
              console.log(`✅ Found file at alternative path`);
              // Update the path in database
              await prisma.nft.update({
                where: { id: nft.id },
                data: { localImagePath: altPath }
              });
              nft.localImagePath = altPath;
            } else {
              results.push({ id: nftId, name: nft.name, status: `error: image file not found at ${normalizedPath}` });
              continue;
            }
          }

          console.log(`📤 Uploading image to IPFS...`);
          
          // Upload image to IPFS
          const imageCid = await this.imageUpload(nft.localImagePath);
          console.log(`✅ Image uploaded, CID: ${imageCid}`);
          
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

          console.log(`📤 Uploading metadata to IPFS...`);
          
          // Upload metadata to IPFS
          const metadataCid = await this.uploadMetadata(metadata);
          console.log(`✅ Metadata uploaded, CID: ${metadataCid}`);
          
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
            if (nft.localImagePath && fs.existsSync(nft.localImagePath)) {
              await fsPromises.unlink(nft.localImagePath);
              console.log(`🗑️ Deleted local file: ${nft.localImagePath}`);
            }
          } catch (deleteError) {
            safeLogError('delete_uploaded_nft_local_file', deleteError, { nftId: nft.id });
          }

          console.log(`✅ NFT ${nft.name} successfully uploaded to IPFS!`);
          results.push({ id: nftId, name: nft.name, status: 'success: uploaded to IPFS' });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          safeLogError('upload_nft_to_ipfs', error, { nftId: Number(nftId) });
          results.push({ id: nftId, name: 'Unknown', status: `error: ${errorMessage}` });
        }
      }

      const successCount = results.filter(r => r.status.includes('success')).length;
      const errorCount = results.filter(r => r.status.includes('error')).length;

      console.log(`\n📊 Upload complete: ${successCount} succeeded, ${errorCount} failed`);

      return res.json({
        success: true,
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
      console.log('🔄 Refreshing image matches...');
      console.log(`📁 Scanning directory: ${UPLOAD_DIR}`);

      // Check if upload directory exists
      if (!fs.existsSync(UPLOAD_DIR)) {
        console.log('📁 Creating upload directory...');
        fs.mkdirSync(UPLOAD_DIR, { recursive: true });
      }

      // List all files in directory
      const allFiles = await fsPromises.readdir(UPLOAD_DIR);
      console.log(`📄 Found ${allFiles.length} files in upload directory`);

      // Get all NFTs that haven't been uploaded to IPFS yet
      const nfts = await prisma.nft.findMany({
        where: { ipfsUploaded: false, excelUploaded: true }
      });

      console.log(`📋 Found ${nfts.length} NFTs to check`);

      let matchedCount = 0;
      let unmatchedCount = 0;

      for (const nft of nfts) {
        if (!nft.excelImageName) {
          console.log(`⏭️ NFT ${nft.name}: no excelImageName, skipping`);
          unmatchedCount++;
          continue;
        }

        const imageFile = await this.findImageFile(nft.excelImageName, UPLOAD_DIR);
        const imageMatched = imageFile !== null;
        const localImagePath = imageFile ? path.normalize(path.join(UPLOAD_DIR, imageFile)) : null;

        console.log(`🔍 NFT ${nft.name}: excelImageName="${nft.excelImageName}", matched=${imageMatched}, path=${localImagePath}`);

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

      console.log(`✅ Refresh complete: ${matchedCount} matched, ${unmatchedCount} unmatched`);

      return res.json({
        success: true,
        message: `Image match refresh completed. ${matchedCount} matched, ${unmatchedCount} unmatched.`,
        matchedCount,
        unmatchedCount
      });
    } catch (error) {
      console.error('Error refreshing image matches:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to refresh image matches',
        error: error instanceof Error ? error.message : 'Unknown error'
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

      const files = await fsPromises.readdir(UPLOAD_DIR);
      const images = files.map(file => ({
        filename: file,
        originalName: file.split('----').pop() || file,
        path: `/api/icons/images/${file}`, // URL to access the image
        fullPath: path.join(UPLOAD_DIR, file)
      }));

      return res.json({
        success: true,
        images,
        count: images.length
      });
    } catch (error) {
      console.error('Error getting uploaded images:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get uploaded images',
        error: error instanceof Error ? error.message : 'Unknown error'
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
        data: nfts
      });
    } catch (error) {
      console.error('Error fetching NFTs:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch NFTs',
        error: error instanceof Error ? error.message : 'Unknown error'
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
      console.error('Error fetching NFTs by holderId:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch NFTs',
        error: error instanceof Error ? error.message : 'Unknown error'
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
      console.error('Error fetching mintable NFTs:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch mintable NFTs',
        error: error instanceof Error ? error.message : 'Unknown error'
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
      console.error('Error fetching NFT by ID:', error);
      return res.json({
        success: false,
        message: 'Failed to fetch NFT',
        error: error instanceof Error ? error.message : 'Unknown error'
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
          console.error('Error giving immediate NFT mint bonus:', pointError);
          // Don't fail the whole request if point reward fails
        }
      }

      return res.status(200).json({
        success: true,
        message: 'NFT updated successfully',
        data: updatedNFT
      });
    } catch (error) {
      console.error('Error updating NFT:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update NFT',
        error: error instanceof Error ? error.message : 'Unknown error'
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
      console.error('Error deleting NFT:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete NFT',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
