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

const OfficalDiscoNft = () => {
  const { user_id } = useAppSelector((state) => state.user);
  const [connectWalletModal, setConnectWalletModal] = useState(false);
  const [nftCount, setNftCount] = useState<number>(1);
  const [mintFee, setMintFee] = useState(0.001); // Set default mint fee in ETH
  const [isMinting, setIsMinting] = useState(false);
  const t = useTranslations('MembershipNFT');
  const { isConnected, address } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider("eip155");
  const { fetchBalance } = useAppKitBalance();
  const [balance, setBalance] = useState<number | null>(null);
  const [nextTokenId, setNextTokenId] = useState<number>(0);

  // Trial NFT state
  const [canClaimTrial, setCanClaimTrial] = useState(false);
  const [trialClaimReason, setTrialClaimReason] = useState('');
  const [isClaimingTrial, setIsClaimingTrial] = useState(false);
  const [trialNftCount, setTrialNftCount] = useState<number>(1);
  const [availableTemplate, setAvailableTemplate] = useState<any>(null);

  // ERC-721 Contract Configuration
  const NFT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_NFT_ADDRESS || "0x7a99D4a57eb1a0f53c71c68B6295c7f727c762a6";

  const fetchNftPrice = async () => {
    try {
      const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL || "");
      const contract = new Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, provider);
      const ethPrice: bigint = await contract.getPrice();
      const mintPrice: bigint = await contract.mintUsdPrice();
      setMintFee(Number((Number(mintPrice) / Number(ethPrice)).toFixed(4)));
      const nextTokenIdBig = await contract.nextTokenId();
      setNextTokenId(Number(nextTokenIdBig));
    } catch (error) {
      console.error('Error fetching NFT price:', error);
    }
  }

  // Check if user can claim trial NFT and fetch available templates
  const checkTrialNftEligibility = async () => {
    if (!user_id) return;
    try {
      // Check eligibility and fetch available templates in parallel
      const [eligibilityRes, templatesRes] = await Promise.all([
        apiClient.get(`/trial-nfts/can-claim/${user_id}`),
        apiClient.get('/trial-nft-templates/available')
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

    if (!user_id) {
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
    
    fetchNftPrice();
  }, [isConnected, address]);

  // Check trial NFT eligibility when user_id changes
  useEffect(() => {
    if (user_id) {
      checkTrialNftEligibility();
    }
  }, [user_id]);

  const decrement = () => {
    setNftCount((prev) => {
      if (prev > 0) {
        const updatedCount = prev - 1;
        // conditionMintStatus();
        return updatedCount; // Convert back to string
      }
      return prev; // Return the previous value if condition isn't met
    });
  };
  // Remove Sui-specific fee fetching - using fixed ETH fee

  const increment = () => {
    setNftCount((prev) => {
      const updatedCount = prev + 1;
      // conditionMintStatus();
      return updatedCount;
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

    if (nextTokenId >= 5000) {
      toast("Maximum number of NFTs minted", {
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
      const ethersProvider = new BrowserProvider(walletProvider as Eip1193Provider);
      const signer = await ethersProvider.getSigner();
      const contract = new Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, signer);
      const ethPrice: bigint = await contract.getPrice();
      const mintPrice: bigint = await contract.mintUsdPrice();

      if ((Number(mintPrice) / Number(ethPrice)) > (Number(balance) || 0)) {
        toast(`Insufficient balance`, {
          style: {
            borderRadius: '10px',
            background: 'var(--color-secondary)',
            color: '#fff',
          },
        });
        return;
      }

      // Mint NFTs one by one
      // Get metadata URI from database
      const nftResponse = await apiClient.get(`/nft/${nextTokenId}`);
      if (!nftResponse.data.success) {
        throw new Error(nftResponse.data.message);
      }

      const nftData = nftResponse.data.data;
      const metadataUri = nftData.ipfsCid;

      if (!metadataUri) {
        throw new Error(`No metadata URI found for NFT ${nextTokenId}`);
      }

      console.log(`Minting NFT ${nextTokenId} with metadata: ${metadataUri}`);

      const tx = await contract.mint(address, metadataUri, {
        value: ethers.parseEther((Number(mintPrice) / Number(ethPrice) + 0.0001).toFixed(8))
      });

      console.log(`Transaction hash for NFT ${nextTokenId}:`, tx.hash);

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log(`NFT ${nextTokenId} minted successfully!`);
      console.log('Transaction receipt:', receipt);

      // Get the actual token ID from the Transfer event in the receipt
      let mintedTokenId = nextTokenId;
      if (receipt.logs && receipt.logs.length > 0) {
        // Try to parse the Transfer event to get the actual token ID
        try {
          const transferEvent = receipt.logs.find((log: any) => log.topics && log.topics.length >= 4);
          if (transferEvent && transferEvent.topics[3]) {
            mintedTokenId = parseInt(transferEvent.topics[3], 16);
            console.log('Actual minted token ID:', mintedTokenId);
          }
        } catch (e) {
          console.log('Could not parse token ID from event, using nextTokenId');
        }
      }

      // Update NFT record in database
      const updateResponse = await fetch(`/api/nft/${nextTokenId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          holderId: user_id, // Use the authenticated user's ID
          mintStatus: true,
          txHash: receipt.hash
        })
      });

      if (!updateResponse.ok) {
        console.warn(`Failed to update NFT ${nextTokenId} in database`);
      } else {
        console.log(`NFT ${nextTokenId} updated in database`);
      }

      // Show success toast with real NFT name
      toast(`Successfully minted ${nftData.name}!`, {
        style: {
          borderRadius: '10px',
          background: 'var(--color-secondary)',
          color: '#fff',
        },
      });

      // Refresh the nextTokenId
      fetchNftPrice();

    } catch (error: any) {
      console.error("Minting error:", error);
      let message = "Failed to mint NFT: ";

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
        message = "Invalid input parameters sent to contract. Check NFT metadata or wallet address.";
      } else if (error.message?.includes("CALL_EXCEPTION")) {
        message = "Smart contract call failed — please contact support or check the contract.";
      } else {
        message += error.message || "Unknown error occurred.";
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
                  <p className="text-main">{nextTokenId / 5000 * 100}%</p>
                  <p className="text-[#838584]">( {nextTokenId} / 5000 )</p>
                </div>
                <div className="mt-2.5 rounded-[10px] bg-[#333333]">
                  <div className={`relative h-[16px] rounded-[10px] border-y-[0.5px] border-white bg-main`} style={{ width: `${nextTokenId / 5000 * 100}%` }}>
                    <p className="absolute right-1.5 text-[10px] leading-[12.1px] text-black">
                      {nextTokenId / 5000 * 100}%
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
                  customClasses={`text-black w-full py-[.3rem] rounded-full text-mm font-semibold shadow-2 relative ${!isMinting ? 'gradient-bg-main' : 'bg-[#666666]'
                    }`}
                  disabled={isMinting}
                >
                  {!isMinting && (
                    <SendHorizontal
                      width={20}
                      height={20}
                      className="absolute right-5"
                    />
                  )}
                </ButtonDefault>
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
