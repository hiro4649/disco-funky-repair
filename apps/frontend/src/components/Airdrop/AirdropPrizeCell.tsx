import React, { useState, useEffect, useRef } from "react";
import { airdrop } from "@/types/airdrop";
import Image from "next/image";
import gsap from "gsap";
import FallbackImage from "../common/fallbackImage";

const AirdropPrizeCell: React.FC<any> = (data: {
  item: airdrop;
  index: Number;
  openModal: Function;
  addClass: string;
}) => {
  const item = data.item;
  const index = Number(data.index);
  const openModal = (index: number) => {
    data.openModal(index);
  };

  const triggerRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLSpanElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const countUpTrigger = triggerRef.current;
    const countUpTarget = targetRef.current;

    const animateCountUp = () => {
      if (countUpTrigger && countUpTarget) {
        const fromValue = parseFloat(countUpTarget.dataset.from || "0");
        const toValue = parseFloat(countUpTarget.dataset.to || "0");

        // Initialize gsap animation
        const elementNum = { count: fromValue };
        gsap.to(elementNum, {
          count: toValue,
          duration: 3,
          ease: "none",
          onUpdate: () => {
            if (countUpTarget) {
              countUpTarget.textContent = elementNum.count
                .toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 });
            }
          },
        });
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            animateCountUp();
            setHasAnimated(true);
          }
        });
      },
      { threshold: 0.5 } // Adjust threshold based on when you want to trigger the animation
    );

    if (countUpTrigger) {
      observer.observe(countUpTrigger);
    }

    return () => {
      if (countUpTrigger) {
        observer.unobserve(countUpTrigger);
      }
    };
  }, [item, hasAnimated]);

  return (
    <div
      key={index}
      className={`airdrop-fade-in-left cursor-pointer rounded-[8px] border-y-[0.5px] border-y-[#666666] bg-white px-3.5 py-2.5 shadow-1 dark:bg-secondary transition-all duration-500 ease-in-out ${data.addClass}`}
      onClick={() => openModal(index)}
      ref={triggerRef}
    >
      <div className="flex items-center justify-between">
        <div className="flex gap-x-3">
          <FallbackImage
            src={`${item.icon}`}
            alt="Token Image"
            width={40}
            height={40}
            className="rounded-full aspect-square"
          />
          <div className="flex items-center">
            <div className="flex gap-x-2">
              <div className="itmes-center flex flex-col">
                <div className="flex items-center justify-start text-[15px] font-medium leading-[1.3rem] text-white text-center gap-x-[5px]">
                  <div>{item.symbol}</div>
                  <Image
                    width={13}
                    height={13}
                    src={`/images/logo/chain-logo.svg`}
                    alt="Icon"
                    className="rounded-full mb-[1px]"
                  />
                </div>
                <p className="text-[13px] font-normal leading-[1.1rem]">
                  {item.token_name}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-x-4">
          <span className="text-[1rem] text-[#FFFF33]" data-from="0" data-to={`${Number(item.quantity / (item.price || 1)).toFixed(5)}`} ref={targetRef}>
            0
          </span>
        </div>
      </div>
    </div>
  );
};

export default AirdropPrizeCell;
