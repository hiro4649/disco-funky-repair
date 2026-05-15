import React, { useEffect, useCallback, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { setLoading, setItems, setError } from "@/store/slices/airdropItemSlice";
import apiClient from "../../../utils/apiClient";
import { prizelist } from "@/types/prizelist";
import Image from "next/image";
import PrizeDescriptionModal from "../Airdrop/PrizeDescriptionModal";
import "@/css/animations.css";

const PrizeMarquee: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((state) => state.airdropItem);
  const [showModal, setShowModal] = useState(false);
  const [selectedPrizeIndex, setSelectedPrizeIndex] = useState<number | undefined>(undefined);

  const getAirdropData = useCallback(async () => {
    // If we already have data, don't fetch again
    if (items.length > 0) {
      return;
    }

    dispatch(setLoading(true));
    try {
      const res = await apiClient.get(`/airdrop/prize`);
      if (res.data.success === true) {
        let sortedValue: prizelist[] = res.data.data
          .sort((a: prizelist, b: prizelist) => {
            return Number(b.quantity) - Number(a.quantity);
          })
          .map((item: prizelist) => {
            return {
              ...item,
              // Use fake_probability from database, fallback to probability if not set
              fake_probability: item.fake_probability || item.probability,
            };
          });
        
        const adjustedSum = sortedValue.reduce((sum, value) => sum + (value.fake_probability ?? 0), 0);
        
        // Scale the values to make the total sum equal to 100
        let scaled = sortedValue.map(value => {
          return {
            ...value,
            fake_probability: ((value.fake_probability ?? 0) / adjustedSum) * 100
          }
        });
        
        dispatch(setItems(scaled));
      }
    } catch (err: any) {
      console.error("Error fetching airdrop data:", err);
      dispatch(setError(err.message || "Failed to fetch airdrop data"));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, items.length]);

  useEffect(() => {
    getAirdropData();
  }, [getAirdropData]);

  const handlePrizeClick = (prizeId: number) => {
    const originalIndex = items.findIndex(item => item.id === prizeId);
    if (originalIndex !== -1) {
      setSelectedPrizeIndex(originalIndex);
      setShowModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPrizeIndex(undefined);
  };

  if (loading || items.length === 0) {
    return null;
  }

  // Limit to top 10 items for the marquee display
  const marqueeItems = items.slice(0, 10);
  
  // Create enough copies for seamless scrolling
  const seamlessItems = [...marqueeItems, ...marqueeItems, ...marqueeItems];

  const PrizeItem = ({ item, index }: { item: prizelist; index: number }) => (
    <div
      key={`${item.id}-${index}`}
      className="flex items-center pr-[15px] py-2 cursor-pointer rounded-lg transition-colors whitespace-nowrap flex-shrink-0"
      onClick={() => handlePrizeClick(item.id)}
    >
      <div className="w-6 h-6 rounded-full overflow-hidden mr-2 flex-shrink-0">
        <Image
          src={item.icon || `/images/logo/chain-logo.svg`}
          alt={item.token_name}
          width={24}
          height={24}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `/images/logo/chain-logo.svg`;
          }}
        />
      </div>
      
      <span className="text-white text-sm font-medium mr-2 flex-shrink-0">
        {item.symbol}
      </span>
      
      <span className="text-[#FFFF33] text-sm mr-2 flex-shrink-0">
        {item.quantity === 0 ? 'N/A' : Number((item.quantity/item.price).toFixed(5)).toLocaleString()}
      </span>
      
      <span className="text-main text-sm mr-3 flex-shrink-0">
        {item.fake_probability?.toFixed(4)}%
      </span>
    </div>
  );

  // Calculate animation duration based on content width to maintain consistent speed
  const baseSpeed = 50; // pixels per second - adjust this to control overall speed
  const estimatedItemWidth = 200; // estimated width per item in pixels
  const totalItems = marqueeItems.length;
  const totalWidth = totalItems * estimatedItemWidth;
  const animationDuration = totalWidth / baseSpeed; // duration in seconds

  return (
    <div className="w-full overflow-hidden bg-gradient-to-r via-gray-900 to-black border-gray-700 relative">
      <div 
        className="flex"
        style={{
          animation: `css-marquee ${animationDuration}s linear infinite`,
          display: 'flex',
          width: 'max-content',
          willChange: 'transform'
        }}
      >
        {seamlessItems.map((item, index) => (
          <PrizeItem key={`${item.id}-${index}`} item={item} index={index} />
        ))}
      </div>
      
      <PrizeDescriptionModal
        isOpen={showModal}
        onClose={closeModal}
        prizes={items}
        showId={selectedPrizeIndex}
      />
    </div>
  );
};

export default PrizeMarquee; 