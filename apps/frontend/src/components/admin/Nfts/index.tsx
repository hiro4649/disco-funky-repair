"use client";
import React, { useState, useEffect, useCallback } from "react";
import NftsList from "./NftsList";
import NftsUpload from "./NftsUpload";
import NftsImagesUpload from "./NftsImagesUpload";
import apiClient from "../../../../utils/apiClient";
import { useTranslations } from 'next-intl';

interface Nft {
  id: number;
  holderId?: number | null;
  name: string;
  creator: string;
  owner: string;
  description: string;
  image: string;
  excelImageName?: string | null;
  localImagePath?: string | null;
  royalty: number;
  attributes: Record<string, any>;
  collectionId: string;
  externalUrl?: string | null;
  mintStatus: boolean;
  excelUploaded: boolean;
  ipfsUploaded: boolean;
  imageMatched: boolean;
  updatedAt: string;
  createdAt: string;
}

const NftManage = () => {
  const t = useTranslations('Admin');
  const [nftlist, setNftlist] = useState<Nft[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNfts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/admin/nfts');
      console.log(response.data);
      if (response.data.success && Array.isArray(response.data.data)) {
        setNftlist(response.data.data);
      } else {
        setNftlist([]);
      }
    } catch (error) {
      console.error('Error fetching NFTs:', error);
      setNftlist([]);
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchNfts();
  }, [fetchNfts]);

  return (
    <>
      <div className="px-3 py-4">
        <h1 className="text-2xl font-bold mb-4">{t('NFT Management')}</h1>
        <p className="text-gray-600 mb-6">
          {t('Upload NFT metadata (Excel) and images. After verification, upload selected NFTs to IPFS.')}
        </p>

        {/* Upload Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-3 text-center">{t('Step 1: Upload NFT Metadata (Excel)')}</h2>
            <p className="text-sm text-gray-500 mb-3 text-center">
              {t('Upload .xlsx file with NFT data. This saves to database without IPFS upload.')}
            </p>
            <div className="flex justify-center">
              <NftsUpload setNftlist={setNftlist} onUploadComplete={fetchNfts} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-3 text-center">{t('Step 2: Upload NFT Images')}</h2>
            <p className="text-sm text-gray-500 mb-3 text-center">
              {t('Upload PNG images. They will be auto-matched with Excel data.')}
            </p>
            <div className="flex justify-center">
              <NftsImagesUpload onUploadComplete={fetchNfts} />
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-800 mb-2"> {t('Workflow Instructions:')}</h3>
          <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1">
            <li>{t('Upload Excel metadata file (.xlsx) - NFT data will be saved to database')}</li>
            <li>{t('Upload NFT images - Images will be auto-matched with Excel data')}</li>
            <li>{t('Review the table below - verify image matches (green = matched, red = missing)')}</li>
            <li>{t('Use "Upload Image" button to upload missing images for specific NFTs')}</li>
            <li>{t('Select NFTs with checkboxes or use "Select All Matched" button')}</li>
            <li>{t('Click "Upload to IPFS" to upload selected NFTs to IPFS')}</li>
          </ol>
        </div>

        {/* NFT Table */}
        <div className="bg-white rounded-lg shadow">
          <NftsList nftlist={nftlist} onRefresh={fetchNfts} />
        </div>
      </div>
    </>
  );
};

export default NftManage;
