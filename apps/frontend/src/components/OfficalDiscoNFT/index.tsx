"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import ButtonDefault from "../Buttons/ButtonDefault";
import { SendHorizontal } from "lucide-react";
import AutoScrollCarousel from "./AutoScrollCarousel";
import ConnectWalletMessageModal from "../Lottery/ConnectWalletMessageModal";
import { useAppSelector } from "@/store/store";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslations } from "next-intl";
import { useAppKitAccount, useAppKitBalance, useAppKitProvider } from "@reown/appkit/react";
import { BrowserProvider, Contract, Eip1193Provider, ethers } from "ethers";
import toast from "react-hot-toast";
import { NFT_ABI } from "@/utils/constant";
import apiClient from "../../../utils/apiClient";
import StaticDisplay from "./StaticDisplay";
import { getImageUrl } from '../../../utils/imageUtils';

type NftContractState = {
  nextTokenId: number;
  maxSupply: number;
  mintEnabled: boolean;
  baseURI: string;
  mintFeeInBnb: number;
  unavailableReason: string;
};

const getFrontendErrorMetadata = (error: any) => ({
  name: error?.name || typeof error,
  code: typeof error?.code === "string" || typeof error?.code === "number" ? error.code : undefined,
});

const OfficalDiscoNft = () => {
  const { authState, user_id } = useAppSelector((state) => state.user);
  const [connectWalletModal, setConnectWalletModal] = useState(false);
  const [nftCount, setNftCount] = useState<number>(1);
  const [mintFee, setMintFee] = useState(0.001); // Set default mint fee in BNB
  const [isMinting, setIsMinting] = useState(false);
  const t = useTranslations('MembershipNFT');
  const { isConnected, address } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider("eip155");
  const { fetchBalance } = useAppKitBalance();
  const [balance, setBalance] = useState<number | null>(null);
  const [nextTokenId, setNextTokenId] = useState<number>(0);
  const [maxSupply, setMaxSupply] = useState<number | null>(null);
  const [, setMintEnabled] = useState(false);
  const [, setBaseURI] = useState("");
  const [mintUnavailableReason, setMintUnavailableReason] = useState("Checking NFT mint status...");

  // Trial NFT state
  const [canClaimTrial, setCanClaimTrial] = useState(false);
  const [trialClaimReason, setTrialClaimReason] = useState('');
  const [isClaimingTrial, setIsClaimingTrial] = useState(false);
  const [trialNftCount, setTrialNftCount] = useState<number>(1);
  const [availableTemplate, setAvailableTemplate] = useState<any>(null);

  // ERC-721 Contract Configuration
  const NFT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_NFT_ADDRESS || "";
  const NFT_RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "";

  const getNftContractConfigError = () => {
    if (!NFT_CONTRACT_ADDRESS) {
      return "NFT contract is not configured.";
    }
    if (!NFT_RPC_URL) {
      return "NFT RPC is not configured.";
    }
    return "";
  };

  const readNftContractState = async (contract: Contract): Promise<NftContractState> => {
    const [
      bnbUsdPrice,
      mintPrice,
      nextTokenIdBig,
      maxSupplyBig,
      mintEnabledValue,
      baseURIValue,
    ] = await Promise.all([
      contract.getPrice(),
      contract.mintUsdPrice(),
      contract.nextTokenId(),
      contract.MAX_SUPPLY(),
      contract.mintEnabled(),
      contract.baseURI(),
    ]);

    if (Number(bnbUsdPrice) <= 0) {
      throw new Error("INVALID_PRICE_ORACLE");
    }

    const normalizedBaseURI = typeof baseURIValue === "string" ? baseURIValue.trim() : "";
    let unavailableReason = "";

    if (!mintEnabledValue) {
      unavailableReason = "NFT mint is currently disabled.";
    } else if (!normalizedBaseURI) {
      unavailableReason = "NFT metadata is not ready.";
    } else if (nextTokenIdBig >= maxSupplyBig) {
      unavailableReason = "Maximum number of NFTs minted.";
    }

    return {
      nextTokenId: Number(nextTokenIdBig),
      maxSupply: Number(maxSupplyBig),
      mintEnabled: Boolean(mintEnabledValue),
      baseURI: normalizedBaseURI,
      mintFeeInBnb: Number((Number(mintPrice) / Number(bnbUsdPrice)).toFixed(4)),
      unavailableReason,
    };
  };

  const applyNftContractState = (state: NftContractState) => {
    setMintFee(state.mintFeeInBnb);
    setNextTokenId(state.nextTokenId);
    setMaxSupply(state.maxSupply);
    setMintEnabled(state.mintEnabled);
    setBaseURI(state.baseURI);
    setMintUnavailableReason(state.unavailableReason);
  };

  const fetchNftContractState = async () => {
    const configError = getNftContractConfigError();
    if (configError) {
      setMintUnavailableReason(configError);
      setMintEnabled(false);
      setBaseURI("");
      setMaxSupply(null);
      return null;
    }

    try {
      const provider = new ethers.JsonRpcProvider(NFT_RPC_URL);
      const contract = new Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, provider);
      const state = await readNftContractState(contract);
      applyNftContractState(state);
      return state;
    } catch (error) {
      console.warn('NFT contract state read failed', getFrontendErrorMetadata(error));
      setMintUnavailableReason("NFT mint status is unavailable.");
      setMintEnabled(false);
      setBaseURI("");
      setMaxSupply(null);
      return null;
    }
  }

  // Check if user can claim trial NFT and fetch available templates
  const checkTrialNftEligibility = async () => {
    try {
      const templatesRequest = apiClient.get('/trial-nft-templates/available');

      if (!authState || !user_id || !isConnected) {
        const templatesRes = await templatesRequest;
        if (templatesRes.data.success && templatesRes.data.data.length > 0) {
          setAvailableTemplate(templatesRes.data.data[0]);
        }
        setCanClaimTrial(false);
        setTrialClaimReason('');
        return;
      }

      // Check user-specific eligibility only after wallet signature login is complete.
      const [eligibilityRes, templatesRes] = await Promise.all([
        apiClient.get(`/trial-nfts/can-claim/${user_id}`),
        templatesRequest
      ]);
      
      if (eligibilityRes.data.success) {
        setCanClaimTrial(eligibilityRes.data.canClaim);
        setTrialClaimReason(eligibilityRes.data.reason);
      }
      
      if (templatesRes.data.success && templatesRes.data.data.length > 0) {
        setAvailableTemplate(templatesRes.data.data[0]); // Use first available template
      }
    } catch (error) {
      console.error('Error checking trial NFT eligibility:', error);
    }
  };

  // Claim trial NFT
  const handleClaimTrialNFT = async () => {
    if (!isConnected) {
      setConnectWalletModal(true);
      return;
    }

    if (!authState || !user_id) {
      toast('Please log in to claim Trial NFT', {
        style: {
          borderRadius: '10px',
          background: 'var(--color-secondary)',
          color: '#fff',
        },
      });
      return;
    }

    if (!availableTemplate) {
      toast('No Trial NFT templates available. Please try again later.', {
        style: {
          borderRadius: '10px',
          background: 'var(--color-secondary)',
          color: '#fff',
        },
      });
      return;
    }

    setIsClaimingTrial(true);

    try {
      const response = await apiClient.post(`/trial-nfts/claim/${user_id}`, {
        templateId: availableTemplate.id
      });
      
      if (response.data.success) {
        toast(`Successfully minted ${response.data.data.name}!`, {
          style: {
            borderRadius: '10px',
            background: 'var(--color-secondary)',
            color: '#fff',
          },
        });
        // Refresh eligibility status
        checkTrialNftEligibility();
      } else {
        toast(response.data.message || 'Failed to mint Trial NFT', {
          style: {
            borderRadius: '10px',
            background: 'var(--color-secondary)',
            color: '#fff',
          },
        });
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to mint Trial NFT';
      toast(message, {
        style: {
          borderRadius: '10px',
          background: 'var(--color-secondary)',
          color: '#fff',
        },
      });
    } finally {
      setIsClaimingTrial(false);
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      fetchBalance().then((res) => {
        setBalance(Number(res.data?.balance || "0"));
      });
    }
    
    fetchNftContractState();
  }, [isConnected, address]);

  // Check trial NFT eligibility when user_id changes
  useEffect(() => {
    checkTrialNftEligibility();
  }, [authState, user_id, isConnected]);

  const decrement = () => {
    setNftCount((prev) => {
      if (prev > 1) {
        const updatedCount = prev - 1;
        // conditionMintStatus();
        return updatedCount; // Convert back to string
      }
      return prev; // Return the previous value if condition isn't met
    });
  };
  // Public mint fee is read from the BSC FunkyNFT contract.

  const increment = () => {
    setNftCount((prev) => {
      // Public FunkyNFT.mint() mints exactly one NFT per transaction.
      return prev;
    });
  };

  const handleNftMint = async () => {
    if (!isConnected) {
      setConnectWalletModal(true);
      return;
    } 
    if (Number(nftCount) === 0) {
      toast("Please enter the number of NFTs you want to mint", {
        style: {
          borderRadius: '10px',
          background: 'var(--color-secondary)',
          color: '#fff',
        },
      });
      return;
    }

    const configError = getNftContractConfigError();
    if (configError) {
      toast(configError, {
        style: {
          borderRadius: '10px',
          background: 'var(--color-secondary)',
          color: '#fff',
        },
      });
      return;
    }

    setIsMinting(true);

    try {
      if (!walletProvider) {
        toast("Wallet provider is unavailable.", {
          style: {
            borderRadius: '10px',
            background: 'var(--color-secondary)',
            color: '#fff',
          },
        });
        return;
      }

      const ethersProvider = new BrowserProvider(walletProvider as Eip1193Provider);
      const signer = await ethersProvider.getSigner();
      const contract = new Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, signer);
      const latestContractState = await readNftContractState(contract);
      applyNftContractState(latestContractState);

      if (latestContractState.unavailableReason) {
        toast(latestContractState.unavailableReason, {
          style: {
            borderRadius: '10px',
            background: 'var(--color-secondary)',
            color: '#fff',
          },
        });
        return;
      }

      const mintPriceInBnb = latestContractState.mintFeeInBnb;

      if (mintPriceInBnb > (Number(balance) || 0)) {
        toast(`Insufficient balance`, {
          style: {
            borderRadius: '10px',
            background: 'var(--color-secondary)',
            color: '#fff',
          },
        });
        return;
      }

      let nftName = `NFT #${latestContractState.nextTokenId}`;
      try {
        const nftResponse = await apiClient.get(`/nft/${latestContractState.nextTokenId}`);
        if (nftResponse.data.success && nftResponse.data.data?.name) {
          nftName = nftResponse.data.data.name;
        }
      } catch (metadataError) {
        console.warn('NFT display metadata lookup failed before mint', getFrontendErrorMetadata(metadataError));
      }

      console.log('Minting FunkyNFT', { tokenId: latestContractState.nextTokenId });

      const tx = await contract.mint({
        value: ethers.parseEther((mintPriceInBnb + 0.0001).toFixed(8))
      });

      console.log('FunkyNFT mint transaction submitted', { tokenId: latestContractState.nextTokenId, txHash: tx.hash });

      // Wait for transaction confirmation
      const receipt = await tx.wait();

      // Get the actual token ID from the Transfer event in the receipt
      let mintedTokenId = latestContractState.nextTokenId;
      if (receipt?.logs && receipt.logs.length > 0) {
        // Try to parse the Transfer event to get the actual token ID
        try {
          const transferEvent = receipt.logs.find((log: any) => log.topics && log.topics.length >= 4);
          if (transferEvent && transferEvent.topics[3]) {
            mintedTokenId = parseInt(transferEvent.topics[3], 16);
            console.log('Actual minted token ID:', mintedTokenId);
          }
        } catch (e) {
          console.warn('Could not parse token ID from mint event', getFrontendErrorMetadata(e));
        }
      }
      console.log('FunkyNFT mint confirmed', { tokenId: mintedTokenId, txHash: tx.hash });

      // PATCH /nft/:id is intentionally disabled for browser users.
      // Backend ownership updates must not be driven by frontend body fields.

      // Show success toast with real NFT name
      toast(`Successfully minted ${nftName}!`, {
        style: {
          borderRadius: '10px',
          background: 'var(--color-secondary)',
          color: '#fff',
        },
      });

      // Refresh the nextTokenId
      fetchNftContractState();

    } catch (error: any) {
      console.warn("NFT mint failed", getFrontendErrorMetadata(error));
      let message = "Failed to mint NFT. Please try again.";

      if (error.message?.includes("User rejected") || error.code === 4001) {
        message = "Transaction was rejected by the user.";
      } else if (error.message?.includes("insufficient funds")) {
        message = "Insufficient funds for gas or minting fee.";
      } else if (error.message?.includes("nonce") || error.message?.includes("replacement")) {
        message = "Nonce error or pending transaction detected. Try again after confirming previous transactions.";
      } else if (error.message?.includes("network") || error.message?.includes("provider")) {
        message = "Network error: please check your RPC or wallet connection.";
      } else if (error.message?.includes("reverted") || error.reason?.includes("execution reverted")) {
        message = "Transaction reverted by the contract. Possibly invalid parameters or mint not allowed.";
      } else if (error.message?.includes("timeout") || error.code === "TIMEOUT") {
        message = "Transaction took too long — please check the blockchain explorer.";
      } else if (error.message?.includes("JsonRpcEngine") || error.code === -32603) {
        message = "Internal JSON-RPC error. Please refresh your wallet and try again.";
      } else if (error.message?.includes("underpriced") || error.message?.includes("replacement fee too low")) {
        message = "Gas price too low. Try increasing gas fees.";
      } else if (error.message?.includes("invalid argument")) {
        message = "Invalid mint transaction parameters. Check wallet and contract configuration.";
      } else if (error.message?.includes("CALL_EXCEPTION")) {
        message = "Smart contract call failed — please contact support or check the contract.";
      }

      toast(message, {
        style: {
          borderRadius: '10px',
          background: 'var(--color-secondary)',
          color: '#fff',
        },
      });
    } finally {
      setIsMinting(false);
    }
  };

  //start animation nft image fade in
  const mintStages = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (mintStages.current) {
      gsap.registerPlugin(ScrollTrigger);

      gsap.fromTo(
        mintStages.current,
        { opacity: 0, y: 50 }, // Start position
        {
          opacity: 1,
          y: 0, // End position
          duration: 1.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: mintStages.current,
            start: "top 80%", // Adjust trigger point
            end: "top 20%",
            scrub: 1, // Smooth animation on scroll
            toggleActions: "play none none reverse",
            // once: true
          },
        },
      );
    }
  }, []);

  const chicken = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (chicken.current) {
      gsap.registerPlugin(ScrollTrigger);

      gsap.fromTo(
        chicken.current,
        { opacity: 0, y: 50 }, // Start position
        {
          opacity: 1,
          y: 0, // End position
          duration: 2,
          delay: 2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: chicken.current,
            start: "top 80%", // Adjust trigger point
            end: "top 20%",
            scrub: 1,
            toggleActions: "play none none reverse",
            // once: true
          },
        },
      );
    }
  }, []);
  //end animation nft image fade in

  const mintedPercent = maxSupply && maxSupply > 0
    ? Math.min(100, (nextTokenId / maxSupply) * 100)
    : 0;
  const mintedPercentLabel = `${mintedPercent.toFixed(2)}%`;
  const displayedMaxSupply = maxSupply ?? "-";
  const isPublicMintDisabled = isMinting || Boolean(mintUnavailableReason);

  return (
    <div className="background overflow-hidden">
      <div className="mx-auto max-w-[480px]">
        <div className="z-10 px-3">
          <div className="space-y-[20px] pt-7">
            <div className="flex items-center justify-center">
              <p className="mb-2.5 text-[24px] leading-[28px] text-white normal">
                {t('Membership NFT')}
              </p>
            </div>
            <p className="text-[15px] font-normal leading-[22px] text-white/80">
              {t('Description')}
            </p>
            {/* <p className="mt-2 text-[15px] font-normal leading-[22px] text-white/80">
              This NFT is more than just a collectible—it serves as a{" "}
              <span className="font-semibold leading-[22px] text-white">
                digital membership
              </span>{" "}
              for our early investors, providing an enriched service experience.
            </p> */}
            <p className="mt-2 text-[15px] font-normal leading-[22px] text-white/80">
              {t('NFT Description')}
            </p>
            {/* Show real NFTs if available, otherwise fall back to static images */}
            <AutoScrollCarousel imageURL="/images/new_nfts/funky_nft_sample_20251023_01_s/" useRealNfts={true} />
            <div className="text-[15px] leading-[22px] text-white">
              <p className="mb-2 font-semibold text-main">
                {t('A One-of-a-Kind Original NFT')}
              </p>
              <p className="font-normal text-white/80">
                {t('NFT Uniqueness')}
              </p>
            </div>
            {/* Show real NFTs if available */}
            <AutoScrollCarousel imageURL="/images/new_nfts/funky_nft_sample_20251023_02_s/" useRealNfts={true} />
            <AutoScrollCarousel imageURL="/images/new_nfts/funky_nft_sample_20251023_03_s/" useRealNfts={true} />

            {/* Monthly Free Trial NFT Section */}
            <div className="rounded-[8px] border-[0.5px] border-[#666666] bg-secondary px-4.5 pb-5 pt-4 mt-6">
              <div className="flex items-center gap-x-2 mb-3">
                <div className="pulsing-dot flex"></div>
                <p className="text-[16px] font-semibold text-white">Monthly Free Trial NFT</p>
              </div>
              {/* Show template image if available */}
              {availableTemplate && availableTemplate.image && (
                <div className="flex justify-center mb-4">
                  <div className="w-32 h-32 rounded-lg overflow-hidden border border-main/30">
                    <img
                      src={getImageUrl(availableTemplate.image)}
                      alt={availableTemplate.name || 'Trial NFT'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('Trial NFT template image error:', availableTemplate.image, 'Constructed URL:', getImageUrl(availableTemplate.image));
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}
              {availableTemplate && (
                <p className="text-[14px] font-medium text-center text-main mb-2">{availableTemplate.name}</p>
              )}
              <p className="text-[13px] font-normal leading-[18px] text-white/70 mb-4">
                {availableTemplate?.description || 'We are giving away a special item NFT that works for 5 days, free of charge.'}
              </p>
              <div className="mb-3 text-left">
                <p className="text-[13px] font-semibold text-white/60">MINT PRICE</p>
                <p className="text-xl font-semibold text-main">Free</p>
              </div>
              <ButtonDefault
                label={isClaimingTrial ? "MINTING..." : "MINT NOW"}
                onClick={handleClaimTrialNFT}
                customClasses={`w-full py-[.3rem] rounded-full text-mm font-semibold shadow-2 relative ${
                  // When wallet not connected: active/clickable color (Figma design)
                  !isConnected 
                    ? 'gradient-bg-main text-black cursor-pointer' 
                    // When wallet connected and can claim: active gradient
                    : !isClaimingTrial && canClaimTrial 
                      ? 'gradient-bg-main text-black' 
                      // When wallet connected but can't claim: greyed out
                      : 'bg-[#666666] text-white/50'
                }`}
                disabled={isClaimingTrial || (isConnected && !canClaimTrial)}
              >
                {!isClaimingTrial && (
                  <>
                    {/* Red "1" badge when wallet is not connected (Figma design) - between text and arrow */}
                    {!isConnected && (
                      <span className="absolute right-12 z-10 bg-red-500 text-white rounded-full text-xs min-w-5 h-5 px-1.5 flex items-center justify-center font-semibold">
                        1
                      </span>
                    )}
                    <SendHorizontal
                      width={20}
                      height={20}
                      className={`absolute right-5 ${
                        !isConnected ? 'text-black' : canClaimTrial ? 'text-black' : 'text-white/50'
                      }`}
                    />
                  </>
                )}
              </ButtonDefault>
              {isConnected && !canClaimTrial && trialClaimReason && (
                <p className="text-[12px] text-center text-white/50 mt-2">{trialClaimReason}</p>
              )}
            </div>

            {/* <div className="mt-4 flex flex-col p-0" ref={mintStages}>
              <div className="mt-7 h-auto w-full  rounded-t-[8px] bg-main py-[0.5rem]">
                <p className="text-center text-[18px] font-semibold text-secondary">
                  {t('MintStages')}
                </p>
              </div>
              <div
                className="h-auto w-full rounded-b-[8px] border-[0.5px] border-main bg-cover bg-center bg-no-repeat px-4 py-8 text-[16px] leading-[28px] text-white"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('/images/new_nfts/nft_background.png')",
                }}
              >
                <div className="m-0 p-0 heading-[28px]" ref={chicken}>
                  <p className="mb-4 text-center text-[26px] font-normal text-white">
                    {t('Chicken')}
                  </p>
                  <p className="text-[16px] font-normal heading-[28px] text-white">
                    {t('Chicken Description')}
                  </p>
                  <p className="text-[16px] font-normal heading-[28px] text-white">
                    {t('Limited Edition')}
                  </p>
                  <p className="text-[16px] font-normal heading-[28px] text-white">
                    {t('Invitation')}
                  </p>
                </div>
              </div>
            </div> */}
            <div className="w-full overflow-hidden">
              <p className="text-center text-[18px] font-semibold text-main mt-4">
                - {t('MintStages')} -
              </p>
            </div>
            <div
              className="rounded-[8px] border-[0.5px] border-[#666666] bg-secondary px-4.5 pb-6 pt-5"
              style={{ marginBottom: 50 }}
            >
              <div>
                <div className="flex items-center gap-x-2 text-white">
                  <div className="pulsing-dot flex"></div>
                  <p>{t('TotalMinted')}</p>
                  <p className="text-main">{mintedPercentLabel}</p>
                  <p className="text-[#838584]">( {nextTokenId} / {displayedMaxSupply} )</p>
                </div>
                <div className="mt-2.5 rounded-[10px] bg-[#333333]">
                  <div className={`relative h-[16px] rounded-[10px] border-y-[0.5px] border-white bg-main`} style={{ width: mintedPercentLabel }}>
                    <p className="absolute right-1.5 text-[10px] leading-[12.1px] text-black">
                      {mintedPercentLabel}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5">
                <p className="text-[15px] font-semibold text-white">
                  {t('MINT PRICE')}
                </p>
                <p className="text-2xl font-semibold leading-[29.36px] text-main mb-4.5">
                  {mintFee}{" "}
                  <span className="text-[16px] leading-[20px] text-[#ffffff]">BNB</span>
                </p>
                <div className="mb-4.5 flex items-center justify-between rounded-[8px] border-[0.5px] border-[#666666] bg-black px-3 py-2.5">
                  <div className="broder-[0.5px] flex items-center gap-x-3 rounded-[8px] border-[#666666] bg-[#7878803D] px-[15px] py-[5px]">
                    <div
                      className="flex h-[22px] items-center"
                      onClick={() => {
                        decrement();
                      }}
                    >
                      <Image
                        width={18}
                        height={22}
                        src={"/images/icon/Decrement.svg"}
                        alt="icon"
                      />
                    </div>
                    <div className="h-[18px] w-[1px] bg-[#EBEBF54D]"></div>
                    <div
                      onClick={() => {
                        increment();
                      }}
                    >
                      <Image
                        width={18}
                        height={22}
                        src={"/images/icon/Increment.svg"}
                        alt="icon"
                      />
                    </div>
                  </div>
                  <p className="text-2xl leading-[22px] text-[#FFFF33]">
                    {nftCount}
                  </p>
                </div>
                <ButtonDefault
                  label={isMinting ? "MINTING..." : t("MINT NOW")}
                  onClick={handleNftMint}
                  customClasses={`text-black w-full py-[.3rem] rounded-full text-mm font-semibold shadow-2 relative ${!isPublicMintDisabled ? 'gradient-bg-main' : 'bg-[#666666]'
                    }`}
                  disabled={isPublicMintDisabled}
                >
                  {!isMinting && (
                    <SendHorizontal
                      width={20}
                      height={20}
                      className="absolute right-5"
                    />
                  )}
                </ButtonDefault>
                {mintUnavailableReason && (
                  <p className="mt-2 text-center text-[12px] text-white/50">{mintUnavailableReason}</p>
                )}
              </div>
            </div>
            <AutoScrollCarousel imageURL="/images/new_nfts/funky_nft_sample_20251023_04_s/" useRealNfts={true} />
            <div className="text-[15px] leading-[22px] text-white">
              <p className="mb-2 font-semibold text-main">
                {t('Exclusive Benefits')}
              </p>
              <p className="mb-2 font-semibold text-white">
                {t('Airdrop Lottery Tickets')}
              </p>
              <p className="font-normal text-white/80">
                {t('Airdrop Description')}
              </p>
            </div>
            <div className="text-[15px] leading-[22px] text-white">
              <p className="mb-2 font-semibold text-white">
                {t('Fan Points Increase')}
              </p>
              <p className="font-normal text-white/80">
                {t('Fan Points Description')}
              </p>
            </div>
            <div className="text-[15px] leading-[22px] text-white">
              <p className="mb-2 font-semibold text-white">
                {t('Governance Voting Rights')}
              </p>
              <p className="font-normal text-white/80">
                {t('Governance Description')}
              </p>
            </div>
            <div className="text-[15px] leading-[22px] text-white">
              <p className="mb-2 font-semibold text-white">
                {t('Priority Access')}
              </p>
              <p className="font-normal text-white/80">
                {t('Priority Description')}
              </p>
            </div>
            <AutoScrollCarousel imageURL="/images/new_nfts/funky_nft_sample_20251023_05_s/" useRealNfts={true} />
            <AutoScrollCarousel imageURL="/images/new_nfts/funky_nft_sample_20251023_06_s/" useRealNfts={true} />
            <div className="text-[15px] leading-[22px] text-white">
              <p className="mb-2 font-semibold text-main">
                {t('Revenue Utilization')}
              </p>
              <p className="font-normal text-white/80">
                {t('Revenue Description')}
              </p>
            </div>
            <div className="text-[15px] leading-[22px] text-white">
              <p className="mb-2 font-semibold text-main">
                {t('Limited Supply')}
              </p>
              <p className="font-normal text-white/80">
                {t('Supply Description')}
              </p>
            </div>
            <AutoScrollCarousel imageURL="/images/new_nfts/funky_nft_sample_20251023_07_s/" useRealNfts={true} />
            <div className="text-[15px] leading-[22px] text-white">
              <p className="font-normal text-white/80">
                {t('Closing Statement')}
              </p>
            </div>
          </div>
        </div>
      </div>
      <ConnectWalletMessageModal
        isOpen={connectWalletModal}
        isDismissable={true}
        onClose={() => {
          setConnectWalletModal(false);
        }}
      />
    </div>
  );
};
export default OfficalDiscoNft;
