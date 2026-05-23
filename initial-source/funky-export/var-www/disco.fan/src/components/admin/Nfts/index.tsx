"use client";
import React, { useState, useLayoutEffect, useEffect } from "react";
import { redirect } from "next/navigation";
import NftsList from "./NftsList";
import NftsUpload from "./NftsUpload";
import NftsImagesUpload from "./NftsImagesUpload";
import { Interface } from "readline";
import apiClient from "../../../../utils/apiClient";

interface Nft {
  id: number;
  holderId?: number | null;
  name: string;
  creator: string;
  owner: string;
  description: string;
  image: string;
  royalty: number;
  attributes: Record<string, any>; // JSON object for attributes
  collectionId: string;
  externalUrl?: string | null;
  mintStatus: boolean;
  uploadStatus: boolean;
  updatedAt: string; // Date as ISO string
  createdAt: string; // Date as ISO string
}

const NftManage = () => {
  const [nftlist, setNftlist] = useState<Nft[]>([]);

  const fetchNfts = async () => {
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
    }
  };
  
  useEffect(() => {
    fetchNfts();
  }, []);



  return (
    <>
      <div className="h-full px-3 py-7 gap-4 mt-4 flex justify-between item-center ">
        <div>
          <h1 className="mb-2 text-2xl font-medium text-center">NFT Metadata Excel</h1>
          <NftsUpload setNftlist={setNftlist}/>
        </div>
        <div>
          <h1 className="mb-2 text-2xl font-medium text-center">NFT Images</h1>
          <NftsImagesUpload/>
        </div>
      </div>
      <NftsList nftlist={nftlist}/>
    </>
  );
};
export default NftManage;
