import { Request, Response } from 'express';
import prisma from '../db/prisma_client';
import { uploadNFT } from '../services/nftService'; // Assuming uploadNFT is moved to a service file
import xlsx from "xlsx";
import fs from 'fs';
import { promises as fsPromises } from 'fs';
import { JsonArray } from '@prisma/client/runtime/library';
import path from 'path';
import { NFTStorage, File, Blob } from 'nft.storage'

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

interface ProcessedNFT {
  holderId: number;
  name: string;
  description: string;
  image: string;
  creator: string;
  owner: string;
  royalty: number;
  attributes: string;
  collectionId: string;
  externalUrl: string | null;
}

const endpoint = 'https://api.nft.storage'
const token = 'a236d419.b7e92dc1281548de98226ca9dae62295' // your API key from https://nft.storage/manage

export class NftController {
  private static async processExcelFile(filePath: string): Promise<NFTData[]> {
    const workbook = xlsx.readFile(filePath);
    const sheet_name_list = workbook.SheetNames;
    return xlsx.utils.sheet_to_json<NFTData>(workbook.Sheets[sheet_name_list[0]]);
  }

  private static async findImageFile(imageName: string, uploadDir: string): Promise<string | null> {
    const files = await fsPromises.readdir(uploadDir);
    // Remove file extension from imageName if present
    const cleanImageName = imageName.replace(/\.[^/.]+$/, '');
    // Find file that matches the pattern: timestamp----imageName.extension
    return files.find((file: string) => {
      const fileName = file.split('----').pop()?.replace(/\.[^/.]+$/, '');
      return fileName === cleanImageName.replace(/\s+/g, '_');
    }) || null;
  }

  private static async cleanupFiles(filePaths: string[]): Promise<void> {
    for (const filePath of filePaths) {
      try {
        await fsPromises.unlink(filePath);
        console.log(`File successfully deleted: ${filePath}`);
      } catch (error) {
        console.error(`Error deleting file: ${filePath}`, error);
      }
    }
  }
  private static async imageUpload(imagePath: string): Promise<string> {
    try {
      const storage = new NFTStorage({ endpoint: new URL(endpoint), token });
      
      // Read the file and create a blob
      const fileData = await fs.promises.readFile(imagePath);
      const blob = new Blob([fileData], { type: 'image/png' }); // Assuming PNG, adjust if needed
      
      // Upload the blob with retry logic
      const cid = await storage.storeBlob(blob);
      console.log(`Image uploaded successfully to CID: ${cid}`);
      
      // Check upload status
      const status = await storage.status(cid);
      console.log(`Image status: ${JSON.stringify(status)}`);
      
      if (status.pin.status !== 'pinned') {
        throw new Error(`Image upload failed: ${status.pin.status}`);
      }
      
      return cid;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async uploadExcel(req: Request, res: Response): Promise<Response> {
    const filesToCleanup: string[] = [];
    const failedNFTs: { name: string; error: string }[] = [];
    
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const filePath = req.file.path;
      filesToCleanup.push(filePath);

      // Process Excel file
      const xlData = await this.processExcelFile(filePath);
      
      // Create database records
      const processedNFTs: ProcessedNFT[] = xlData.map((data) => ({
        holderId: 1,
        name: data.Name,
        description: data.Description,
        image: data.Image,
        creator: data.Creator,
        owner: data.Owner,
        royalty: parseFloat(data.Royalty),
        attributes: JSON.stringify(data.Attributes),
        collectionId: data["Collection ID"],
        externalUrl: data["External URL"] || null,
      }));

      await prisma.nft.createMany({ data: processedNFTs });

      // Process each NFT
      const uploadDir = path.join(__dirname, '../../../uploads/images');
      
      for (const data of xlData) {
        try {
          console.log(`Starting processing for NFT: ${data.Name}`);
          const imageFile = await this.findImageFile(data.Image, uploadDir);
          if (!imageFile) {
            const error = `ERROR: Image file not found for NFT: ${data.Name}`;
            console.error(error);
            failedNFTs.push({ name: data.Name, error });
            continue;
          }
          console.log(`Image file found for NFT: ${data.Name}`);
          const imagePath = path.join(uploadDir, imageFile);
          console.log(`Image file path: ${imagePath}`);
          
          try {
            const cid = await this.imageUpload(imagePath);
            // Update the NFT record with the CID
            await prisma.nft.updateMany({
              where: { name: data.Name },
              data: { image: cid }
            });
          } catch (uploadError) {
            const errorMessage = uploadError instanceof Error ? uploadError.message : 'Unknown upload error';
            console.error(`Failed to upload image for NFT ${data.Name}:`, errorMessage);
            failedNFTs.push({ name: data.Name, error: `Upload failed: ${errorMessage}` });
            continue;
          }
          
          filesToCleanup.push(imagePath);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error(`Failed to process NFT ${data.Name}:`, error);
          failedNFTs.push({ name: data.Name, error: errorMessage });
          continue;
        }
      }

      // Cleanup files
      await this.cleanupFiles(filesToCleanup);
      const nfts = await prisma.nft.findMany({
        select: {
          id: true,
          holderId: true,
          name: true,
          description: true,
          image: true,
          creator: true,
          owner: true,
          royalty: true,
          attributes: true,
          collectionId: true,
          externalUrl: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return res.json({ 
        message: 'Excel upload process completed',
        processedCount: xlData.length,
        failedCount: failedNFTs.length,
        data: nfts
      });

    } catch (error) {
      console.error('Error in uploadExcel:', error);
      
      // Cleanup files even if there's an error
      await this.cleanupFiles(filesToCleanup);

      return res.status(500).json({ 
        error: 'Failed to process Excel file', 
        details: error instanceof Error ? error.message : 'Unknown error',
        failedNFTs: failedNFTs.length > 0 ? failedNFTs : undefined
      });
    }
  }
  
  // eslint-disable-next-line @typescript-eslint/require-await
  static async uploadImages(req: Request, res: Response): Promise<Response> {
    try {
      // Check if files were uploaded
      if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
        return res.status(400).json({ message: "No files uploaded!" });
      }

      // Process the uploaded files
      const uploadedFiles = (req.files as Express.Multer.File[]).map(file => ({
        filename: file.filename,
        originalname: file.originalname,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype
      }));

      // Return the success response with the uploaded file details
      return res.json({
        message: "Files uploaded successfully!",
        files: uploadedFiles
      });
    } catch (error) {
      console.error('Error uploading files:', error);
      return res.status(500).json({ 
        message: "Server error while uploading files", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getAllNfts(req: Request, res: Response): Promise<Response> {
    try {
      // Get all NFTs from the database
      const nfts = await prisma.nft.findMany({
        select: {
          id: true,
          holderId: true,
          name: true,
          description: true,
          image: true,
          creator: true,
          owner: true,
          royalty: true,
          attributes: true,
          collectionId: true,
          externalUrl: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: {
          createdAt: 'desc'
        }
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
 
  // Controller to mint NFT
  //   static async mintNFT(req: Request, res: Response): Promise<Response> {
  //     // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  //     const { name, description, imagePath, wallet }: { name: string; description: string; imagePath: string; wallet: string } = req.body;

  //     try {
  //       const metadataURI = await uploadNFT(name, description, imagePath);
  //       const txHash = await mintNFT(metadataURI, wallet); // Calls Sui contract
  //       return res.json({ txHash, metadataURI });
  //     } catch (error) {
  //       return res.status(500).json({ error: 'Failed to mint NFT', details: error });
  //     }
  //   }
}