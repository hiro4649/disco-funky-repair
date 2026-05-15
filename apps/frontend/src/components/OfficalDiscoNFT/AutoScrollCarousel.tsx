"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import ImageModal from "./ImageModal";
import apiClient from "../../../utils/apiClient";

// NFT data interface
interface NFTData {
  id: number;
  name: string;
  image: string;
  description: string;
  ipfsUploaded: boolean;
  mintStatus: boolean;
}

// Combined item type for mixed display
interface DisplayItem {
  type: 'real' | 'static';
  id: number | string;
  image: string;
  name: string;
}

const TOTAL_DISPLAY_COUNT = 28; // Total number of items to display in carousel

interface AutoScrollCarouselProps {
  imageURL: string;
  useRealNfts?: boolean; // If true, fetch and display real NFTs first, then static
}

export default function AutoScrollCarousel({ imageURL, useRealNfts = false }: AutoScrollCarouselProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [modalImage, setModalImage] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [realNfts, setRealNfts] = useState<NFTData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch real NFTs that are available to mint
  useEffect(() => {
    if (useRealNfts) {
      fetchMintableNfts();
    }
  }, [useRealNfts]);

  const fetchMintableNfts = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/nfts/mintable');
      if (response.data.success && response.data.data.length > 0) {
        setRealNfts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching mintable NFTs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (url: string, title: string = '') => {
    setModalImage(url);
    setModalTitle(title);
    setIsOpen(true);
  };

  // Create mixed display: real NFTs first, then static images to fill remaining slots
  const displayItems = useMemo((): DisplayItem[] => {
    const items: DisplayItem[] = [];

    if (useRealNfts) {
      // Add real NFTs first
      realNfts.forEach((nft) => {
        items.push({
          type: 'real',
          id: nft.id,
          image: nft.image,
          name: nft.name
        });
      });

      // Fill remaining slots with static images
      const remainingCount = TOTAL_DISPLAY_COUNT - realNfts.length;
      for (let i = 0; i < remainingCount; i++) {
        items.push({
          type: 'static',
          id: `static-${i}`,
          image: `${imageURL}${i + 1}.png`,
          name: '' // Static images use default title
        });
      }
    } else {
      // Only static images
      for (let i = 0; i < TOTAL_DISPLAY_COUNT; i++) {
        items.push({
          type: 'static',
          id: `static-${i}`,
          image: `${imageURL}${i + 1}.png`,
          name: ''
        });
      }
    }

    return items;
  }, [useRealNfts, realNfts, imageURL]);

  return (
    <>
      {/* Image Carousel */}
      <div className="w-full overflow-hidden">
        <Swiper
          spaceBetween={"20px"}
          modules={[Autoplay]}
          breakpoints={{
            640: { slidesPerView: 4 },
            0: { slidesPerView: 3 },
          }}
          loop={true}
          speed={3000}
          autoplay={{ delay: 0 }}
          freeMode={true}
        >
          {displayItems.map((item) => (
            <SwiperSlide key={item.id} className="w-[auto]">
              <Image
                width={100}
                height={100}
                src={item.image}
                alt={item.name || `NFT`}
                className="rounded-lg shadow-md cursor-pointer"
                onClick={() => openModal(item.image, item.name)}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      {/* Image Modal */}
      <ImageModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        imageURL={modalImage} 
        title={modalTitle}
      />
    </>
  );
}
