"use client";
import { useEffect, useRef } from "react";
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

gsap.registerPlugin(ScrollTrigger);

export const NFTList = () => {
  const t = useTranslations('LotteryTicket');
  const { authState } = useAppSelector((state) => state.user);

  const nftRef1 = useRef<HTMLDivElement[]>([]);
  const nftRef2 = useRef<HTMLDivElement[]>([]);

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
  }, [authState]);

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

  return (
    <div className="my-5 flex flex-col items-center justify-center gap-y-[1.6rem]">
      <p className="mt-4 text-[1.3rem] leading-[17px] text-white">
        {t('MyNft')}
      </p>
      <div className="flex w-full flex-col">
        <div
          ref={addNftRef1}
          className="flex w-full flex-wrap items-center justify-between gap-x-1 gap-y-3 mb-4"
        >
          {authState ? (
            <NonNFT />
          ) : (
            <DisconnectNFTs imageURL="/images/new_nfts/disconnect/" />
          )}
          <NonNFT />
          <NonNFT />
        </div>
        <div
          ref={addToRefs2}
          className="flex w-full flex-wrap items-center justify-between gap-x-1 gap-y-3"
        >
          <NonNFT />
          <NonNFT />
          <NonNFT />
        </div>
      </div>
    </div>
  );
};

export default NFTList;
