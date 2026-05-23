import React, { useState, useEffect, useRef } from "react";
import { Modal, ModalContent, ModalHeader } from "@nextui-org/modal";
import { prizelist } from "@/types/prizelist";
import Image from "next/image";
import toast from "react-hot-toast";
import FallbackImage from "../common/fallbackImage";
import { useTranslations } from "next-intl";
import { Contract, formatUnits, JsonRpcProvider } from "ethers";
import { NFT_ABI } from "@/utils/constant";
import { useAuth } from "@/context/AuthContext";
import gsap from "gsap";

const PrizeDescriptionModal = (props: {
  isOpen: boolean;
  onClose: () => void;
  prizes: prizelist[];
  showId: number | undefined;
}) => {
  // Safely access prize data
  const prize = props.showId !== undefined && props.prizes[props.showId] ? props.prizes[props.showId] : null;
  const [rotation, setRotation] = useState(90);
  const social_url: string = prize?.twitter ?? prize?.telegram ?? prize?.discord ?? '';
  const social_name: string = social_url !== '' ? social_url?.split('//')[social_url?.split('//').length - 1].split('/')[social_url?.split('//')[social_url?.split('//').length - 1].split('/').length - 1] : "N/A";
  const t = useTranslations('ModalToken');
  const [isCopied, setIsCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const provTriggerRef = useRef<HTMLDivElement>(null);
  const provTargetRef = useRef<HTMLSpanElement>(null);
  const { ethPrice } = useAuth();
  const [displayPrice, setDisplayPrice] = useState(0);
  const numberRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (ethPrice && prize?.tokenDetail?.price) {
      setDisplayPrice(prize.tokenDetail.price / ethPrice)
      setLoading(false);
    }
  }, [ethPrice, prize]);

  // Function to copy text to clipboard
  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast(t('text copy'),
        {
          style: {
            borderRadius: '10px',
            background: 'var(--color-secondary)',
            color: '#fff',
          },
        }
      );
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast(t('text copy'),
        {
          style: {
            borderRadius: '10px',
            background: 'var(--color-secondary)',
            color: '#fff',
          },
        }
      );
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const formatNumber = (number: number) => {
    const str = number.toString();
    // Handle scientific notation
    if (str.includes('e-')) {
      let [base, exponent] = str.split('e-');
      let zeros = parseInt(exponent) - 1;
      let significantPart = base.replace('.', '').slice(0, 4);
      return {
        count: zeros,
        value: significantPart,
      }
    }

    // Handle standard decimal notation
    if (str.includes('.')) {
      let parts = str.split('.');
      let fractionalPart = parts[1]; // Get part after the decimal
      let leadingZeros = fractionalPart.match(/^0+/)?.[0]?.length || 0; // Count leading zeros
      let significantPart = fractionalPart.slice(leadingZeros); // Remaining digits
      return leadingZeros && leadingZeros != 1 ? {
        count: leadingZeros,
        value: significantPart.slice(0, 4),
      } : {
        count: 0,
        value: str.slice(0, 4),
      }
    }

    // If the input is not in decimal or scientific notation
    return {
      count: 0,
      value: str.slice(0, 4),
    };
  }

  // Function to calculate random fluctuation within ±60%
  const calculateFluctuation = (baseValue: number) => {
    const fluctuationRange = 0.6; // 60% range
    const randomFactor = Math.random() * fluctuationRange * 2 - fluctuationRange;
    return Math.max(baseValue + baseValue * randomFactor, 0); // Ensure value is not negative
  };
  const abbreviateNumber = (number: number) => {
    if (number == 0) {
      return {
        size: "",
        data: "N/A",
      }
    }

    // Handle very large numbers in scientific notation
    if (number >= 1e21) {
      return {
        size: "S",
        data: "$" + (number / 1e21).toFixed(1),
      };
    } else if (number >= 1e18) {
      return {
        size: "Q",
        data: "$" + (number / 1e18).toFixed(1),
      };
    } else if (number >= 1e15) {
      return {
        size: "P",
        data: "$" + (number / 1e15).toFixed(1),
      };
    } else if (number >= 1e12) {
      return {
        size: "T",
        data: "$" + (number / 1e12).toFixed(1),
      };
    } else if (number >= 1e9) {
      return {
        size: "B",
        data: "$" + (number / 1e9).toFixed(1),
      };
    } else if (number >= 1e6) {
      return {
        size: "M",
        data: "$" + (number / 1e6).toFixed(1),
      };
    } else if (number >= 1e3) {
      return {
        size: "K",
        data: "$" + (number / 1e3).toFixed(1),
      };
    } else {
      return {
        size: "",
        data: "$" + number.toString()
      };
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((prev) => (prev >= 450 ? 90 : prev + 1));
    }, 25); // Smooth rotation increment

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  useEffect(() => {
    if (props.isOpen) {
      const countUpTrigger = provTriggerRef.current;
      const countUpTarget = provTargetRef.current;
  
      if (countUpTrigger && countUpTarget) {
        const fromValue = parseFloat(countUpTarget.dataset.from || "0");
        const toValue = parseFloat(countUpTarget.dataset.to || "0");
  
        // GSAP animation
        const elementNum = { count: fromValue };
        gsap.to(elementNum, {
          count: toValue,
          duration: 0.5,
          ease: "none",
          onUpdate: () => {
            countUpTarget.textContent = elementNum.count.toFixed(4);
          },
        });
      }
    }
  }, [prize, props.isOpen]);

  useEffect(() => {
    gsap.fromTo(
        numberRef.current,
        { opacity: 0.5, scale: 2 },
        {
            opacity: 1,
            scale: 1,
            duration: 0.5,
            ease: "power1.out",
        }
    );
}, [props.isOpen]);

  return (
    <>
      <Modal
        placement={"center"}
        size={"sm"}
        backdrop={"blur"}
        isOpen={props.isOpen && (prize?.tokenDetail != null)}
        onClose={() => props.onClose()}
        classNames={{
          backdrop:
            "z-50 backdrop-blur-md backdrop-saturate-150 bg-overlay/30 w-screen h-screen fixed inset-0",
          closeButton: "right-2 text-white hidden",
        }}
        motionProps={{
          variants: {
            enter: {
              y: 0,
              opacity: 1,
              transition: {
                duration: 0.5,
                ease: "easeOut",
              },
            },
            exit: {
              y: 30,
              opacity: 0,
              transition: {
                duration: 0.1,
                ease: "easeIn",
              },
            },
          },
        }}
      >
        <ModalContent
          className={`max-w-[340px] rounded-xl border-[0.3px] bg-black p-2 pb-4`}
          role={"alertdialog"}
        >
          {prize ? (
            <>
              <ModalHeader className="flex items-center gap-x-2.5 px-2 pb-0 pt-2">
                <div
                  className="outer"
                  style={{
                    width: "70px",
                    height: "70px",
                    aspectRatio: "1/1",
                    background: `conic-gradient(
                      from ${rotation}deg, 
                      black, 
                      black, 
                      hsl(${rotation}deg 100% 70%)
                    )`,
                    clipPath: "circle(50%)",
                    display: "grid",
                    placeItems: "center",
                    animation: "rotate 2s ease-in-out infinite",
                    transform: "rotate(0deg)",
                    transformOrigin: "center",
                  }}
                >
                  <div className="flex h-[64px] w-[64px] items-center justify-center rounded-full bg-black">
                    <FallbackImage
                      src={`${prize.icon}`}
                      alt="Token Image"
                      width={54}
                      height={54}
                      className="rounded-full aspect-square"
                    />
                  </div>
                </div>
                <div className="flex gap-x-2 align-left">
                  <div className="items-left flex flex-col">
                    <p className="text-[1.6rem] font-medium leading-[1.7rem] text-white flex items-center gap-x-2">
                      {prize.symbol}
                      <Image
                        className="rounded-full"
                        src={`/images/logo/chain-logo.svg`}
                        alt="icon"
                        height={20}
                        width={20}
                      />
                    </p>
                    <p className="text-[1.2rem] mt-[3px] font-normal leading-[1.3rem]">
                      {prize.token_name}
                    </p>
                  </div>
                </div>
              </ModalHeader>
              <div className="flex flex-col gap-2 p-2 pb-0 ">
                <div className="flex gap-x-2.5">
                  <div className="w-2/4 rounded-lg border-y-[0.5px] border-y-[#666666] bg-secondary py-[0.3rem] px-[0.4rem]">
                    <p className="text-[10px] leading-[12.1px] text-white bg-black p-[2px] text-center rounded-[3px]">
                      <span className="px-[4px] py-[1px] text-[14px]">
                        {t('REWARD')}
                      </span>
                    </p>
                    <p className="text-center text-[18px] text-[#FFFF33] mt-[5px]" ref={numberRef}>
                      {prize.quantity === 0 ? 'N/A' : Number((prize.quantity / prize.price).toFixed(5)).toLocaleString()}
                    </p>
                  </div>
                  <div className="w-2/4 rounded-lg border-y-[0.5px] border-y-[#666666] bg-secondary py-[0.3rem] px-[0.4rem]" ref={provTriggerRef}>
                    <p className="text-[10px] leading-[12.1px] text-white bg-black p-[2px] text-center rounded-[3px]">
                      <span className="px-[4px] py-[1px] text-[14px]">
                        {t('PROBABILITY')}
                      </span>
                    </p>
                    <p className="text-center text-[18px] text-white mt-[5px]">
                      <span className="text-main" data-from="0" data-to={prize?.fake_probability?.toFixed(4) || "0"} ref={provTargetRef}>0</span><span className="text-[13px]">&nbsp;%</span>
                    </p>
                  </div>
                </div>
                <div className="flex gap-x-2.5">
                  <div className="justify-center px-[0.5rem] py-[0.15rem] items-center overflow-hidden flex w-full rounded-lg border-y-[0.5px] border-y-[#666666] bg-secondary gap-x-2">
                    <div className="flex justify-center items-center min-w-0">
                      <p className="text-[14px] text-white m-[1px] w-full text-center">
                        {prize.ca.length > 20
                          ? `${prize.ca.slice(0, 15)}...${prize.ca.slice(-15)}`
                          : prize.ca
                        }
                      </p>
                    </div>
                    <button
                      onClick={() => copyText(prize.ca)}
                      className="text-white hover:text-gray-300 transition-colors"
                      disabled={!prize.ca}
                    >
                      {isCopied ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 6L9 17l-5-5"></path>
                        </svg>
                      ) : (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex gap-x-2.5">
                  <div className="w-full border-[0.3px] border-[#666666] rounded-[5px] text-center leading-[1.1rem] p-[5px]">
                    <p className="text-[12px] text-[#999999]">{t('PRICE')}</p>
                    <div className="text-[12px] text-white flex items-center justify-center">
                      <div className="text-[15px] text-main flex justify-center items-center">
                        {loading ? (
                          <span className="text-[12px] text-gray-400">Loading...</span>
                        ) : (
                          <>
                            {formatNumber(displayPrice).count != 0 ? "0.0" : formatNumber(displayPrice).value}
                            <div className="text-[12px] -mb-2">{formatNumber(displayPrice).count == 0 ? "" : formatNumber(displayPrice).count}</div>
                            {formatNumber(displayPrice).count == 0 ? "" : formatNumber(displayPrice).value}
                          </>
                        )}
                      </div>
                      <span className="text-[11px] text-[#fff] pl-[3.2px] -mb-[3px]">BNB</span>
                    </div>
                  </div>
                  <div className="w-full border-[0.3px] border-[#666666] rounded-[5px] text-center leading-[1.1rem] p-[5px]">
                    <p className="text-[12px] text-[#999999]">{t('LIQUIDITY')}</p>
                    <p className="text-[15px] text-white">
                      {abbreviateNumber(prize.tokenDetail?.liquidity ?? 0).data}
                      <span className="text-[12px]">{abbreviateNumber(prize.tokenDetail?.liquidity ?? 0).size}</span>
                    </p>
                  </div>
                </div>
                <div className="flex gap-x-2.5">
                  <div className="w-full border-[0.3px] border-[#666666] rounded-[5px] text-center leading-[1.1rem] p-[5px]">
                    <p className="text-[12px] text-[#999999]">{t('FDV')}</p>
                    <p className="text-[15px] text-white">
                      {abbreviateNumber(prize.tokenDetail?.fdv ?? 0).data}<span className="text-[12px]">{abbreviateNumber(prize.tokenDetail?.fdv ?? 0).size}</span>
                    </p>
                  </div>
                  <div className="w-full border-[0.3px] border-[#666666] rounded-[5px] text-center leading-[1.1rem] p-[5px]">
                    <p className="text-[12px] text-[#999999]">{t('MARKET CAP')}</p>
                    <p className="text-[15px] text-white">
                      {abbreviateNumber(prize.tokenDetail?.market_cap ?? 0).data}<span className="text-[12px]">{abbreviateNumber(prize.tokenDetail?.market_cap ?? 0).size}</span>
                    </p>
                  </div>
                  <div className="w-full border-[0.3px] border-[#666666] rounded-[5px] text-center leading-[1.1rem] p-[5px]">
                    <p className="text-[12px] text-[#999999]">{t('SCARCITY')}</p>
                    <p className="text-[15px] text-white">
                      {/* {formatNumber(prize.tokenDetail?.price ?? 0).count != 0 ? "0.0" : formatNumber(prize.tokenDetail?.price ?? 0).value} */}
                      {formatNumber(prize.tokenDetail?.scarcityScore ?? 0).count != 0 ? "N/A" : Number((Number(formatNumber(prize.tokenDetail?.scarcityScore ?? 0).value) * 100).toFixed(1))}
                      <span className="text-[11px] text-[#fff] pl-[2px]">%</span>
                      {/* {prize.tokenDetail?.scarcityScore ?? "N/A"}<span className="text-[12px] text-[#999999]">%</span> */}
                    </p>
                  </div>
                </div>
                <div className="flex gap-x-2.5">
                  <div className="w-full border-[0.3px] border-[#666666] rounded-[5px] text-center leading-[1.1rem] p-[5px]">
                    <p className="text-[12px] text-[#999999]">{t('VOLUME')}</p>
                    <div className="text-[15px] text-white flex items-center justify-center">
                      {abbreviateNumber(prize.tokenDetail?.volume_24h ?? 0).data}
                      <span className="text-[12px] -mb-[3px]">
                        {abbreviateNumber(prize.tokenDetail?.volume_24h ?? 0).size}
                      </span>
                    </div>
                  </div>
                  <div className="w-full border-[0.3px] border-[#666666] rounded-[5px] text-center leading-[1.1rem] p-[5px]">
                    <p className="text-[12px] text-[#999999]">{t('TXNS')}</p>
                    <p className="text-[15px] text-white">
                      {(prize.tokenDetail?.txns_24h ?? 0) == 0 ? "N/A" : (prize.tokenDetail?.txns_24h ?? 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <ModalHeader>
              <p className="text-center text-white">No Prize Data Available</p>
            </ModalHeader>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default PrizeDescriptionModal;
