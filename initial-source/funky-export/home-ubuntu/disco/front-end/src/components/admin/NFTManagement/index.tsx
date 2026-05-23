"use client";
import React, { useState, useEffect } from "react";
import moment from "moment";
import { Button, Input, Card, CardBody, CardHeader, Divider, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Select, SelectItem } from "@heroui/react";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import apiClient from "../../../../utils/apiClient";
import { useTranslations } from 'next-intl';

// NFT Contract ABI based on the FunkyNFT contract
const NFT_ABI = [
  // Basic ERC-721 functions
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function nextTokenId() view returns (uint256)",
  
  // Minting functions
  "function mint(address to, string memory tokenURI) payable returns (uint256)",
  
  // Price management
  "function mintUsdPrice() view returns (uint256)",
  "function setMintUsdPrice(uint256 newMintUsd) external",
  "function getPrice() view returns (int256)",
  "function getConversionRate(uint256 bnbAmount) view returns (uint256)",
  
  // Royalty management
  "function setDefaultRoyalty(address royaltyRecipient, uint16 royaltyPercent) external",
  
  // Owner functions
  "function owner() view returns (address)",
  "function withdraw() external",
  
  // Events
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "event Mint(address indexed to, uint256 indexed tokenId, string tokenURI)"
];

interface NFTInfo {
  name: string;
  symbol: string;
  nextTokenId: string;
  mintUsdPrice: string;
  currentPrice: string;
  owner: string;
}

interface MintRecord {
  tokenId: string;
  to: string;
  tokenURI: string;
  txHash: string;
  timestamp: string;
  usdValue: string;
}

export default function NFTManagement() {
  const t = useTranslations('Admin');
  const [nftInfo, setNftInfo] = useState<NFTInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [signer, setSigner] = useState<ethers.Wallet | null>(null);
  
  // Price management forms
  const [newMintPrice, setNewMintPrice] = useState("");

  // Royalty management forms
  const [royaltyRecipient, setRoyaltyRecipient] = useState("");
  const [royaltyPercent, setRoyaltyPercent] = useState("");

  // Get contract address from environment
  const NFT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_NFT_ADDRESS || "0x7a99D4a57eb1a0f53c71c68B6295c7f727c762a6";
  const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "";

  useEffect(() => {
    if (loaded) return;
    initializeProvider();
  }, [loaded]);

  const initializeProvider = async () => {
    try {
      if (!RPC_URL) {
        toast.error("RPC URL not configured");
        return;
      }

      const provider = new ethers.JsonRpcProvider(RPC_URL);
      const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, provider);
      setContract(contract);

      // Try to load admin private key from environment
      const adminPrivateKey = process.env.NEXT_PUBLIC_ADMIN_PRIVATE_KEY;
      if (adminPrivateKey) {
        const signer = new ethers.Wallet(adminPrivateKey, provider);
        setSigner(signer);
        
        const contractWithSigner = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, signer);
        setContract(contractWithSigner);
      }

      await loadNFTInfo(contract);
      setLoaded(true);
    } catch (error) {
      console.error("Error initializing provider:", error);
      toast.error("Failed to initialize blockchain connection");
      setLoaded(true);
    }
  };

  const loadNFTInfo = async (contract: ethers.Contract) => {
    try {
      setLoading(true);
      
      const name = await contract.name();
      const symbol = await contract.symbol();
      const owner = await contract.owner();
      console.log(name, symbol, owner, 'name, symbol, owner');
      const nextTokenId = await contract.nextTokenId();
      console.log(nextTokenId, 'nextTokenId');
      const mintUsdPrice = await contract.mintUsdPrice();
      console.log(mintUsdPrice, 'mintUsdPrice');
      const currentPrice = await contract.getPrice();
      console.log(currentPrice, 'currentPrice');

      setNftInfo({
        name,
        symbol,
        nextTokenId: nextTokenId.toString(),
        mintUsdPrice: mintUsdPrice.toString(),
        currentPrice: currentPrice.toString(),
        owner
      });
    } catch (error) {
      console.error("Error loading NFT info:", error);
      toast.error("Failed to load NFT information");
    } finally {
      setLoading(false);
    }
  };

  const handleSetMintPrice = async () => {
    if (!contract || !signer) {
      toast.error("Admin key not configured");
      return;
    }

    if (!newMintPrice) {
      toast.error("Please enter a new mint price");
      return;
    }

    try {
      setLoading(true);
      
      // Convert USD price to 8 decimal format (Chainlink format)
      const priceInWei = ethers.parseUnits(newMintPrice, 8);
      
      const tx = await contract.setMintUsdPrice(priceInWei);
      await tx.wait();
      
      toast.success("Mint price updated successfully!");
      setNewMintPrice("");
      
      // Reload NFT info
      await loadNFTInfo(contract);
      
    } catch (error: any) {
      console.error("Error setting mint price:", error);
      toast.error(`Failed to update mint price: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSetRoyalty = async () => {
    if (!contract || !signer) {
      toast.error("Admin key not configured");
      return;
    }

    if (!royaltyRecipient || !royaltyPercent) {
      toast.error("Please fill in all royalty fields");
      return;
    }

    try {
      setLoading(true);
      
      const tx = await contract.setDefaultRoyalty(royaltyRecipient, parseInt(royaltyPercent));
      await tx.wait();
      
      toast.success("Royalty settings updated successfully!");
      setRoyaltyRecipient("");
      setRoyaltyPercent("");
      
    } catch (error: any) {
      console.error("Error setting royalty:", error);
      toast.error(`Failed to update royalty: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!contract || !signer) {
      toast.error("Admin key not configured");
      return;
    }

    try {
      setLoading(true);
      
      const tx = await contract.withdraw();
      await tx.wait();
      
      toast.success("Funds withdrawn successfully!");
      
    } catch (error: any) {
      console.error("Error withdrawing funds:", error);
      toast.error(`Withdrawal failed: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const formatUsdPrice = (priceWei: string) => {
    const price = Number(priceWei) / Math.pow(10, 8); // Chainlink has 8 decimals
    return `$${price.toFixed(2)}`;
  };

  const formatEthPrice = (priceWei: string) => {
    const price = Number(priceWei) / Math.pow(10, 8);
    return `$${Number(price.toFixed(2))}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('NFT Management')}</h1>
          <div className="flex items-center gap-2 mt-1">
            <div className={`w-2 h-2 rounded-full ${signer ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-600">
              {signer ? t('Admin Key Configured') : t('Read-Only Mode')}
            </span>
          </div>
        </div>
        <Button
          color="primary"
          onClick={() => contract && loadNFTInfo(contract)}
          isLoading={loading}
        >
          {t('Refresh')}
        </Button>
      </div>

      {/* NFT Information */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">{t('NFT Contract Information')}</h2>
        </CardHeader>
        <CardBody>
          {nftInfo ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">{t('Name')}</label>
                <p className="text-lg font-semibold">{nftInfo.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">{t('Symbol')}</label>
                <p className="text-lg font-semibold">{nftInfo.symbol}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">{t('Next Token ID')}</label>
                <p className="text-lg font-semibold">{nftInfo.nextTokenId}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">{t('Mint Price (USD)')}</label>
                <p className="text-lg font-semibold">{formatUsdPrice(nftInfo.mintUsdPrice)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">{t('Current ETH Price')}</label>
                <p className="text-lg font-semibold">{formatEthPrice(nftInfo.currentPrice)}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">{t('Loading NFT information...')}</p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Price Management */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">{t('Price Management')}</h2>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <div className="flex items-end gap-4">
              <Input
                label={t('New Mint Price (USD)')}
                placeholder="500.00"
                value={newMintPrice}
                onChange={(e) => setNewMintPrice(e.target.value)}
                type="number"
                step="0.01"
                className="flex-1"
              />
              <Button
                color="primary"
                onClick={handleSetMintPrice}
                isLoading={loading}
                isDisabled={!newMintPrice}
              >
                {t('Update Price')}
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Royalty Management */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">{t('Royalty Management')}</h2>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={t('Royalty Recipient')}
                placeholder="0x..."
                value={royaltyRecipient}
                onChange={(e) => setRoyaltyRecipient(e.target.value)}
              />
              <Input
                label={t('Royalty Percentage (basis points)')}
                placeholder="250 (2.5%)"
                value={royaltyPercent}
                onChange={(e) => setRoyaltyPercent(e.target.value)}
                type="number"
              />
            </div>
            <Button
              color="primary"
              onClick={handleSetRoyalty}
              isLoading={loading}
              isDisabled={!royaltyRecipient || !royaltyPercent}
              className="w-full md:w-auto"
            >
              {t('Update Royalty')}
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Withdraw Funds */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">{t('Contract Management')}</h2>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              {t('Withdraw all collected ETH from the contract to the owner address.')}
            </p>
            <Button
              color="warning"
              onClick={handleWithdraw}
              isLoading={loading}
              className="w-full md:w-auto"
            >
              {t('Withdraw Funds')}
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

