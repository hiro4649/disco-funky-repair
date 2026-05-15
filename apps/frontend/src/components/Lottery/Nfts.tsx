"use client";
import { useEffect, useRef, useState } from "react";
import { useAppSelector } from "@/store/store";
import Nft from "../OfficalDiscoNFT/Nft";
import NonNFT from "../OfficalDiscoNFT/Non-NFT";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import ImageModal from "../OfficalDiscoNFT/ImageModal";
import DisconnectNFTs from "../OfficalDiscoNFT/DisconnectNFTs";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslations } from 'next-intl';
import apiClient from "../../../utils/apiClient";
import { getImageUrl } from '../../../utils/imageUtils';

gsap.registerPlugin(ScrollTrigger);

interface NFTData {
  id: number;
  holderId: number | null;
  name: string;
  description: string;
  image: string;
  creator: string;
  owner: string;
  royalty: number;
  attributes: any;
  collectionId: string;
  externalUrl: string | null;
  ipfsCid: string | null;
  mintStatus: boolean;
  uploadStatus: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TrialNFTData {
  id: number;
  userId: number;
  name: string;
  description: string;
  image: string;
  receivedDate: string;
  expiresAt: string;
  isActive: boolean;
  isTrial: boolean; // Flag to distinguish trial NFTs
}

export const NFTList = () => {
  const t = useTranslations('LotteryTicket');
  const { authState, user_id } = useAppSelector((state) => state.user);
  const [userNFTs, setUserNFTs] = useState<NFTData[]>([]);
  const [trialNFTs, setTrialNFTs] = useState<TrialNFTData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nftRef1 = useRef<HTMLDivElement[]>([]);
  const nftRef2 = useRef<HTMLDivElement[]>([]);

  const fetchUserNFTs = async () => {
    if (!user_id) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch real NFTs and trial NFTs in parallel
      const [realNFTResponse, trialNFTResponse] = await Promise.all([
        apiClient.get(`/nfts/holder/${user_id}`),
        apiClient.get(`/trial-nfts/user/${user_id}`)
      ]);

      if (realNFTResponse.data.success) {
        setUserNFTs(realNFTResponse.data.data);
      } else {
        setError('Failed to fetch real NFTs');
      }

      if (trialNFTResponse.data.success) {
        // Mark trial NFTs with isTrial flag
        const trialNFTsWithFlag = trialNFTResponse.data.data.map((nft: any) => ({
          ...nft,
          isTrial: true
        }));
        setTrialNFTs(trialNFTsWithFlag);
      }
    } catch (err) {
      console.error('Error fetching user NFTs:', err);
      setError('Failed to fetch NFTs');
    } finally {
      setLoading(false);
    }
  };

  const animateElements = (elements: HTMLDivElement[], delayTime: number) => {
    elements.forEach((el, index) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1.5,
          delay: delayTime + index * 0.2, // Stagger animation slightly
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        }
      );
    });
  };

  useEffect(() => {
    // Fetch user NFTs when component mounts or authState changes
    if (authState && user_id) {
      fetchUserNFTs();
    }
  }, [authState, user_id]);

  useEffect(() => {
    nftRef1.current = nftRef1.current.filter(Boolean);
    nftRef2.current = nftRef2.current.filter(Boolean);

    // Animate nftRef1 first
    animateElements(nftRef1.current, 0);

    // Delay nftRef2 animation by 1 second
    setTimeout(() => {
      animateElements(nftRef2.current, 0);
    }, 2000);

    ScrollTrigger.refresh();
    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill()); // Cleanup previous triggers
    };
  }, [userNFTs, trialNFTs]); // Re-animate when NFTs change

  const addNftRef1 = (el: HTMLDivElement | null) => {
    if (el && !nftRef1.current.includes(el)) {
      nftRef1.current.push(el);
    }
  };

  const addToRefs2 = (el: HTMLDivElement | null) => {
    if (el && !nftRef2.current.includes(el)) {
      nftRef2.current.push(el);
    }
  };

  const renderNFTs = () => {
    if (loading) {
      return (
        <div className="flex w-full flex-wrap items-center justify-center gap-x-1 gap-y-3">
          <div className="bg-block flex h-[110px] w-[110px] items-center justify-center rounded-lg border border-dashed border-[#666666] text-center shadow-md sm:h-[130px] sm:w-[130px]">
            <div className="text-white">Loading...</div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex w-full flex-wrap items-center justify-center gap-x-1 gap-y-3">
          <div className="bg-block flex h-[110px] w-[110px] items-center justify-center rounded-lg border border-dashed border-[#666666] text-center shadow-md sm:h-[130px] sm:w-[130px]">
            <div className="text-red-500 text-sm">Error loading NFTs</div>
          </div>
        </div>
      );
    }

    if (!authState) {
      return (
        <div className="flex w-full flex-wrap items-center justify-between gap-x-1 gap-y-3">
          <DisconnectNFTs imageURL="/images/new_nfts/disconnect/" />
          <NonNFT />
          <NonNFT />
        </div>
      );
    }

    // Combine real NFTs and trial NFTs
    const allNFTs = [...userNFTs, ...trialNFTs];

    if (allNFTs.length === 0) {
      return (
        <>
          <div className="flex w-full flex-wrap items-center justify-between gap-x-1 gap-y-3 mb-4">
            <NonNFT />
            <NonNFT />
            <NonNFT />
          </div>
          <div className="flex w-full flex-wrap items-center justify-between gap-x-1 gap-y-3">
            <NonNFT />
            <NonNFT />
            <NonNFT />
          </div>
        </>
      );
    }

    // Split NFTs into two rows (max 6 total)
    const displayNFTs = allNFTs.slice(0, 6);
    const firstRowNFTs = displayNFTs.slice(0, 3);
    const secondRowNFTs = displayNFTs.slice(3, 6);

    return (
      <>
        <div
          ref={addNftRef1}
          className="flex w-full flex-wrap items-center justify-between gap-x-1 gap-y-3 mb-4"
        >
          {firstRowNFTs.map((nft: any) => {
            const isTrial = 'isTrial' in nft && nft.isTrial;
            let trialInfo = '';
            if (isTrial) {
              const daysRemaining = Math.ceil((new Date(nft.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              const dayOfHolding = 6 - daysRemaining; // Day 1-5
              const bonusPoints = dayOfHolding;
              trialInfo = `Day ${dayOfHolding} (+${bonusPoints}pt) • ${daysRemaining}d left`;
            }
            // Trial NFT images are stored as local paths, need to prepend API URL (without /api suffix)
            const imageUrl = isTrial ? getImageUrl(nft.image) : nft.image;
            return (
              <Nft
                key={`${isTrial ? 'trial' : 'real'}-${nft.id}`}
                imageUrl={imageUrl}
                title={isTrial ? `${nft.name}` : nft.name}
                description={isTrial ? trialInfo : nft.description}
              />
            );
          })}
          {/* Fill remaining slots with NonNFT if needed */}
          {Array.from({ length: Math.max(0, 3 - firstRowNFTs.length) }).map((_, index) => (
            <NonNFT key={`placeholder-1-${index}`} />
          ))}
        </div>
        <div
          ref={addToRefs2}
          className="flex w-full flex-wrap items-center justify-between gap-x-1 gap-y-3"
        >
          {secondRowNFTs.map((nft: any) => {
            const isTrial = 'isTrial' in nft && nft.isTrial;
            let trialInfo = '';
            if (isTrial) {
              const daysRemaining = Math.ceil((new Date(nft.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              const dayOfHolding = 6 - daysRemaining; // Day 1-5
              const bonusPoints = dayOfHolding;
              trialInfo = `Day ${dayOfHolding} (+${bonusPoints}pt) • ${daysRemaining}d left`;
            }
            // Trial NFT images are stored as local paths, need to prepend API URL (without /api suffix)
            const imageUrl = isTrial ? getImageUrl(nft.image) : nft.image;
            return (
              <Nft
                key={`${isTrial ? 'trial' : 'real'}-${nft.id}`}
                imageUrl={imageUrl}
                title={isTrial ? `${nft.name}` : nft.name}
                description={isTrial ? trialInfo : nft.description}
              />
            );
          })}
          {/* Fill remaining slots with NonNFT if needed */}
          {Array.from({ length: Math.max(0, 3 - secondRowNFTs.length) }).map((_, index) => (
            <NonNFT key={`placeholder-2-${index}`} />
          ))}
        </div>
      </>
    );
  };

  return (
    <div className="my-5 flex flex-col items-center justify-center gap-y-[1.6rem]">
      <div className="flex items-center gap-4 mt-4">
        <p className="text-[1.3rem] leading-[17px] text-white">
          {t('MyNft')}
        </p>
        {authState && (
          <button
            onClick={fetchUserNFTs}
            disabled={loading}
          >
            <svg version="1.1" id="_x32_" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" style={{ width: '25px', height: '25px', opacity: 1 }} xmlSpace="preserve">
              <style>{`.st0{fill: var(--color-main)}`}</style>
              <g>
                <path className="st0" d="M255.996,0.005C114.615,0.005,0,114.62,0,256c0,141.38,114.615,255.996,255.996,255.996
                C397.39,511.995,512,397.38,512,256C512,114.62,397.39,0.005,255.996,0.005z M308.86,377.124l-87.064,45.899l1.878-35.924
                c-23.849-5.799-45.64-18.064-63.186-35.609c-25.489-25.44-39.525-59.346-39.525-95.49c0-18.633,3.746-36.714,11.132-53.741
                l1.435-3.299l31.959,13.879l-1.426,3.298c-5.466,12.633-8.238,26.047-8.238,39.863c0,26.766,10.422,51.926,29.344,70.84
                c11.374,11.378,25.261,19.835,40.381,24.625l1.487-28.072l90.876,48.916L308.86,377.124z M379.892,309.733l-1.43,3.298
                l-31.963-13.879l1.434-3.298c5.461-12.589,8.233-25.994,8.233-39.855c0-26.766-10.422-51.925-29.344-70.848
                c-11.427-11.387-25.314-19.844-40.38-24.625l-1.488,28.072l-90.95-48.925l9.194-4.816l17.146-9.08l69.852-36.801l-1.877,35.871
                c23.87,5.842,45.662,18.133,63.184,35.652c25.533,25.538,39.569,59.452,39.526,95.499
                C391.029,274.668,387.283,292.749,379.892,309.733z"></path>
              </g>
            </svg>
          </button>
        )}
      </div>
      <div className="flex w-full flex-col">
        {renderNFTs()}
      </div>
    </div>
  );
};

export default NFTList;
