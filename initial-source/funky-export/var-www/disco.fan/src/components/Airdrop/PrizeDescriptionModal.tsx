import React, { useState, useEffect } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@nextui-org/modal";
import { prizelist } from "@/types/prizelist";
import Image from "next/image";
import toast from "react-hot-toast";
import FallbackImage from "../common/fallbackImage";
import { useTranslations } from "next-intl";

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
  // const social_image: string = prize?.twitter ? "/images/icon/x.png" : prize?.telegram ? "/images/icon/icon-telegram.svg" : prize?.discord ? "/images/icon/icon-discord.svg" : "/images/icon/x.svg";

  const [currentProbability, setCurrentProbability] = useState(0);
  // const [tokenDetail, setTokenDetail] = useState<DexScreenerData>();
  const t = useTranslations('ModalToken');

  // Function to copy text to clipboard
  const copyText = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast(t('text copy'),
          {
            style: {
              borderRadius: '10px',
              background: '#333',
              color: '#fff',
            },
          }
        );
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
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
    if (number >= 1e6) {
      return {
        size: "M",
        data: "$" + (number / 1e6).toFixed(1),
      };
    } else if (number >= 1e3) {
      return {
        size: "K",
        data: "$" + (number / 1e3).toFixed(1),
      };
    } else if (number == 0) {
      return {
        size: "",
        data: "N/A",
      }
    } else {
      return {
        size: "",
        data: "$" + number.toString()
      };
    }
  }

  useEffect(() => {
    if (props.isOpen) {
      let startValue = 0;
      const endValue = prize?.fake_probability ?? 0;

      const step = (endValue - startValue) / 50; // 50 steps for 0.5s animation (0.5s / 10ms)

      const interval = setInterval(() => {
        startValue += step;
        if (startValue >= endValue) {
          setCurrentProbability(parseFloat(endValue.toFixed(4)));
          clearInterval(interval);
        } else {
          setCurrentProbability(parseFloat(startValue.toFixed(4)));
        }
      }, 10);

      return () => clearInterval(interval);
    }
  }, [props.isOpen, prize?.fake_probability]);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((prev) => (prev >= 450 ? 90 : prev + 1));
    }, 25); // Smooth rotation increment

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

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
                    <p className="text-[1.6rem] font-semibold leading-[1.7rem] text-white flex items-center gap-x-2">
                      {prize.symbol}
                      <Image
                        className="rounded-full mb-[-2px]"
                        src={`/images/logo/${prize.default_image}`}
                        alt="icon"
                        height={15}
                        width={15}
                      />
                    </p>
                    <p className="text-[1.2rem] mt-[3px] font-normal leading-[1.3rem]">
                      {prize.token_name}
                    </p>
                  </div>
                </div>
              </ModalHeader>
              <ModalBody className="gap-2 px-2 pb-0 pt-2 ">
                <div className="flex gap-x-2.5">
                  <div className="w-2/4 rounded-lg border-y-[0.5px] border-y-[#666666] bg-[#1D1B20] py-[0.3rem] px-[0.4rem]">
                    <p className="text-[10px] leading-[12.1px] text-white bg-black p-[2px] text-center rounded-[3px]">
                      <span className="px-[4px] py-[1px] text-[14px]">
                        {t('REWARD')}
                      </span>
                    </p>
                    <p className="text-center text-[18px] text-[#FFFF33] mt-[5px]">
                      {prize.quantity === 0 ? 'N/A' : Number((prize.quantity/prize.price).toFixed(5)).toLocaleString()}
                    </p>
                  </div>
                  <div className="w-2/4 rounded-lg border-y-[0.5px] border-y-[#666666] bg-[#1D1B20] py-[0.3rem] px-[0.4rem]">
                    <p className="text-[10px] leading-[12.1px] text-white bg-black p-[2px] text-center rounded-[3px]">
                      <span className="px-[4px] py-[1px] text-[14px]">
                        {t('PROBABILITY')}
                      </span>
                    </p>
                    <p className="text-center text-[18px] text-white mt-[5px]">
                      <span className="text-[#00FFCC]">{currentProbability.toFixed(4)}</span><span className="text-[13px]">&nbsp;%</span>
                    </p>
                  </div>
                </div>
                <div className="flex gap-x-2.5">
                  <div className="justify-center px-[0.5rem] py-[0.15rem] items-center overflow-hidden flex w-2/4 rounded-lg border-y-[0.5px] border-y-[#666666] bg-[#1D1B20] " onClick={() => copyText(prize.ca)}>
                    {prize.ca.length <= 13
                    ? 
                    <p className="text-[13px] text-white m-[1px]">
                      {prize.ca}
                    </p>
                    :
                    <><p className="text-[13px] text-white overflow-hidden m-[1px]">
                        {prize.ca.length <= 13
                          ? prize.ca
                          : prize.ca.slice(0, 7)}
                      </p><p className="text-[13px] text-white m-[1px]">..</p><p className="text-[13px] m-[1px] text-white">
                          {prize.ca.length <= 13
                            ? prize.ca
                            : prize.ca.slice(-10)}
                        </p></>
                    }
                    <Image
                      src={"/images/icon/copy-w.svg"}
                      width={14}
                      height={14}
                      alt="icon"
                      className="ml-auto"
                    />
                  </div>
                  <div className="justify-start px-[0.5rem] mt-[2px] py-[0.15rem] items-center overflow-hidden flex w-2/4 rounded-lg border-y-[0.5px] border-y-[#666666] bg-[#1D1B20]" onClick={() => copyText(social_url)}>
                    <div className="w-[20px] h-[20px] flex justify-center items-center bg-black rounded-[3px] mr-1">
                      <Image
                        src={"/images/icon/x.png"}
                        width={14}
                        height={14}
                        alt="icon"
                        className=""
                      />
                    </div>
                    <p className="text-[13px] text-white flex justify-center m-[1px]">
                      {social_name === 'N/A' 
                      ? <span className="text-[13px]">＠{social_name}</span>
                      : social_name.length <= 12
                        ? <span className="text-[13px]">＠{social_name}</span>
                        :  <span className="text-[13px] overflow-hidden">＠{social_name.slice(0, 9)}..</span>
                      }
                    </p>
                    <Image
                      src={"/images/icon/copy-w.svg"}
                      width={14}
                      height={14}
                      alt="icon"
                      className="ml-auto "
                    />
                  </div>
                </div>
                <div className="flex gap-x-2.5">
                  <div className="w-full border-[0.3px] border-[#666666] rounded-[5px] text-center leading-[1.1rem] p-[5px]">
                    <p className="text-[12px] text-[#999999]">{t('PRICE')}</p>
                    <div className="text-[12px] text-white flex items-center justify-center">
                      {/* <span className="text-[15px] text-[#00FFCC]">{ }</span>&nbsp;SUI */}
                      <div className="text-[15px] text-[#00FFCC] flex justify-center items-center">
                        {formatNumber(prize.tokenDetail?.price ?? 0).count != 0 ? "0.0" : formatNumber(prize.tokenDetail?.price ?? 0).value}
                        <div className="text-[12px] -mb-2">{formatNumber(prize.tokenDetail?.price ?? 0).count == 0 ? "" : formatNumber(prize.tokenDetail?.price ?? 0).count}</div>
                        {formatNumber(prize.tokenDetail?.price ?? 0).count == 0 ? "" : formatNumber(prize.tokenDetail?.price ?? 0).value}
                      </div>
                      <span className="text-[11px] text-[#fff] pl-[3.2px] -mb-[3px]">SUI</span>
                    </div>
                  </div>
                  <div className="w-full border-[0.3px] border-[#666666] rounded-[5px] text-center leading-[1.1rem] p-[5px]">
                    <p className="text-[12px] text-[#999999]">{t('VOLUME')}</p>
                    <div className="text-[15px] text-white flex items-center justify-center">
                      {abbreviateNumber(prize.tokenDetail?.volume_24h ?? 0).data}
                      <span className="text-[12px] -mb-[3px]">
                        {abbreviateNumber(prize.tokenDetail?.volume_24h ?? 0).size}
                      </span>
                    </div>
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
                      {formatNumber(prize.tokenDetail?.scarcityScore ?? 0).count != 0 ? "N/A" : formatNumber(prize.tokenDetail?.scarcityScore ?? 0).value}
                      <span className="text-[11px] text-[#fff] pl-1">%</span>
                      {/* {prize.tokenDetail?.scarcityScore ?? "N/A"}<span className="text-[12px] text-[#999999]">%</span> */}
                    </p>
                  </div>
                </div>
                <div className="flex gap-x-2.5">
                  <div className="w-full border-[0.3px] border-[#666666] rounded-[5px] text-center leading-[1.1rem] p-[5px]">
                    <p className="text-[12px] text-[#999999]">{t('LIQUIDITY')}</p>
                    <p className="text-[15px] text-white">
                      {abbreviateNumber(prize.tokenDetail?.liquidity ?? 0).data}
                      <span className="text-[12px]">{abbreviateNumber(prize.tokenDetail?.liquidity ?? 0).size}</span>
                    </p>
                  </div>
                  <div className="w-full border-[0.3px] border-[#666666] rounded-[5px] text-center leading-[1.1rem] p-[5px]">
                    <p className="text-[12px] text-[#999999]">{t('TXNS')}</p>
                    <p className="text-[15px] text-white">
                      {(prize.tokenDetail?.txns_24h ?? 0) == 0 ? "N/A" : (prize.tokenDetail?.txns_24h ?? 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </ModalBody>
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
