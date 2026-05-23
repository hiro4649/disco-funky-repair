import React, { useState, useEffect } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@nextui-org/modal";
import { prizelist } from "@/types/prizelist";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { prizeHistory } from "@/types/prizeHistory";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

const PrizeHistoryModal = (props: {
  isOpen: boolean;
  onClose: () => void;
  prizes: prizeHistory[];
  showId: number | undefined;
}) => {
  const t = useTranslations('PrizeHistory');
  const data = props.prizes[props.showId!];
  const [rotation, setRotation] = useState(90);
  const [isCopied, setIsCopied] = useState(false);

  const shortenSuiAddress = (address: string) => {
    const start = address.substring(0, 10);
    const end = address.substring(address.length - 10);
    return `${start}...${end}`;
  };

  const copyText = (text: string) => {
    // Copy the text to clipboard
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
        isOpen={props.isOpen}
        onClose={() => props.onClose()}
        classNames={{
          backdrop:
            "z-50 backdrop-blur-md backdrop-saturate-150 bg-overlay/30 w-screen h-screen fixed inset-0",
          closeButton: "right-2 text-white",
        }}
      >
        <ModalContent
          className="max-w-[340px] rounded-xl border-[0.3px] bg-black p-2"
          role={"alertdialog"}
        >
          {(onClose) => (
            <>
              <ModalHeader className="flex items-center gap-x-2.5 px-2 pb-0 pt-4">
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
                    <Image
                      className="rounded-full"
                      src={`${process.env.NEXT_PUBLIC_API_URL}/icons/${data.prize.icon}`}
                      alt="icon"
                      width={54}
                      height={54}
                    />
                  </div>
                </div>
                <div className="flex gap-x-2">
                  <div className="itmes-center flex flex-col">
                    <p className="flex items-center gap-x-2 text-[1.4rem] font-medium leading-[1.6rem] text-white">
                      {data.prize.symbol}
                      <Image
                        className="rounded-full"
                        src={`${process.env.NEXT_PUBLIC_API_URL}/icons/${data.prize.default_image}`}
                        alt="icon"
                        width={15}
                        height={15}
                      />
                    </p>
                    <p className="text-[0.9rem] font-medium leading-[1.2rem]">
                      {data.prize.token_name}
                    </p>
                  </div>
                </div>
              </ModalHeader>
              <ModalBody className="gap-2 px-2 pb-[0.7rem] pt-2">
                <div className="flex gap-x-2.5">
                  <div className="w-2/4 rounded-lg border-y-[0.5px] border-y-[#666666] bg-[#1D1B20] px-3 py-2">
                    <p className="text-[12px] leading-[12.1px] text-[#00FFCC] ">
                      <span className="rounded-[3px] bg-black px-[4px] py-[1px] text-[12px]">
                        Quantity
                      </span>
                    </p>
                    <p className="text-end text-base text-[#FFFF33]">
                      {Number(data.prize.quantity).toLocaleString()}
                    </p>
                  </div>
                  <div className="w-2/4 rounded-lg border-y-[0.5px] border-y-[#666666] bg-[#1D1B20] px-3 py-2">
                    <p className="text-[12px] leading-[12.1px] text-[#00FFCC] ">
                      <span className="rounded-[3px] bg-black px-[4px] py-[1px] text-[12px]">
                        Probability
                      </span>
                    </p>
                    <p className="text-end text-base text-white">
                      {Number(data.prize.probability) * 100}%
                    </p>
                  </div>
                </div>
                <div className="relative rounded-lg border-y-[0.5px] border-y-[#666666] bg-[#1D1B20] px-3 py-2">
                  <p className="text-[12px] leading-[12.1px] text-[#00FFCC]">
                    <span className="rounded-[3px] bg-black px-[4px] py-[1px] text-[12px]">
                      CA
                    </span>
                  </p>
                  <div
                    className={` mt-2 flex w-[95%] justify-center items-center overflow-hidden ${data.prize.ca.length <= 13 && "justify-center"}`}
                  >
                    <p
                      className="text-[12px] leading-[11.1px] text-white"
                      onClick={() => copyText(data.prize.ca)}
                    >
                      {data.prize.ca.length <= 13
                        ? data.prize.ca
                        : shortenSuiAddress(data.prize.ca)}
                    </p>
                  </div>
                </div>
                <div className="rounded-lg border-y-[0.5px] border-y-[#666666] bg-[#1D1B20] px-3 py-2">
                  <p className="text-[12px] leading-[12.1px] text-[#00FFCC]">
                    <span className="rounded-[3px] bg-black px-[4px] py-[1px] text-[12px]">
                      Telegram
                    </span>
                  </p>
                  <p
                    className="block w-full text-end text-xs text-white"
                    onClick={() => data.prize.telegram}
                  >
                    {data.prize.telegram}
                  </p>
                </div>
                <div className="rounded-lg border-y-[0.5px] border-y-[#666666] bg-[#1D1B20] px-3 py-2">
                  <p className="text-[12px] leading-[12.1px] text-[#00FFCC]">
                    <span className="rounded-[3px] bg-black px-[4px] py-[1px] text-[12px]">
                      X (Twitter)
                    </span>
                  </p>
                  <a
                    className="block w-full text-end text-xs text-white"
                    onClick={() => data.prize.twitter}
                  >
                    {data.prize.twitter}
                  </a>
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};
export default PrizeHistoryModal;
