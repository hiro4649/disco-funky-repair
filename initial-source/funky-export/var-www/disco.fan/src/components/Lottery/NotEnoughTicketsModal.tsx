import React, { useState, useEffect } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@nextui-org/modal";
import { prizelist } from "@/types/prizelist";
import Image from "next/image";
import ButtonDefault from "../Buttons/ButtonDefault";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useTranslations } from 'next-intl';

const NotEnoughTicketsModal = (props: {
    isOpen: boolean;
    isDismissable: boolean;
    onClose: () => void;
}) => {
    const router = useRouter();
    const [tokenBalance, setTokenBalance] = useState<Number>(10000);
    const t = useTranslations('ModalTiket');
    
    useEffect(() => {
        const getDiscoTokenBalance = async () => {
          try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/seting/tokenbalance`);
            if (res.status == 200) {
              if (res.data.success) {
                const data = res.data.data
                setTokenBalance(data.balance)
              }
            }
          } catch (e) {
            console.log(e);
          }
        }
        getDiscoTokenBalance();
      }, [])
      
    return (
        <>
            <Modal
                placement={"center"}
                size={"sm"}
                backdrop={"blur"}
                isOpen={props.isOpen}
                onClose={() => props.onClose()}
                hideCloseButton={true}
                isDismissable={props.isDismissable}
                shouldBlockScroll={true}
                classNames={{
                    backdrop:
                        "z-50 backdrop-blur-md backdrop-saturate-150 bg-overlay/30 w-screen h-screen fixed inset-0",
                    closeButton: "right-2 text-white",
                }}
                motionProps={{
                    variants: {
                        enter: {
                            y: 0,
                            opacity: 1,
                            transition: {
                                duration: 1,
                                ease: "easeOut",
                            },
                        },
                        exit: {
                            y: 30,
                            opacity: 0,
                            transition: {
                                duration: 0.2,
                                ease: "easeIn",
                            },
                        },
                    },
                }}
            >
                <ModalContent
                    className={`max-w-[390px] rounded-xl border-[0.3px] bg-black mx-6`}
                    role={"alertdialog"}
                >
                    {(onClose) => (
                        <>
                            <ModalBody className="gap-2 px-2 pt-4">
                                <div
                                    className={`py-[0.8rem]`}
                                >
                                    <div className="px-2">
                                        <div className="text-center text-[22px] leading-[24px] ">
                                            <p className="font-semibold text-[22px] text-[#00FFCC]">
                                                {t('Not enough')}
                                            </p>
                                        </div>
                                        <div className="my-2 text-[14px] leading-[24px] text-white text-center">
                                            <p>
                                                {t('Ticket Description').replace('10,000', tokenBalance.toLocaleString())}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 relative">
                                        <div className="grid grid-cols-3 gap-[.2rem] text-center text-white">
                                            <div className="flex flex-col items-center justify-center-safe">
                                                <Image
                                                    width={40}
                                                    height={40}
                                                    src={"/images/icon/no-deposit-100.svg"}
                                                    alt="icon"
                                                />
                                                <p className="text-[14px] font-bold text-[#00FFCC] leading-[18px] mt-2">{t("No Deposit")}</p>
                                            </div>
                                            <div className="flex flex-col items-center justify-center-safe">
                                                <Image
                                                    width={40}
                                                    height={40}
                                                    src={"/images/icon/transfer-crypto-100.svg"}
                                                    alt="icon"
                                                />
                                                <p className="text-[14px] font-bold text-[#00FFCC] leading-[18px] mt-2">{t("Transfer Money")}</p>
                                            </div>
                                            <div className="flex flex-col items-center justify-center-safe">
                                                <Image
                                                    width={40}
                                                    height={40}
                                                    src={"/images/icon/all-free-100.svg"}
                                                    alt="icon"
                                                />
                                                <p className="text-[14px] font-bold text-[#00FFCC] leading-[18px] mt-2">{t("All Free")}</p>
                                            </div>
                                        </div>
                                        
                                        {/* Fixed horizontal line */}
                                        {/* <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#ff007f] mt-2"></div> */}
                                        
                                        <div className="grid grid-cols-3 gap-[.2rem] text-center text-white pt-2">
                                            <div className="flex flex-col items-center justify-center-safe">
                                                <p className="text-[12px] leading-[18px]">
                                                    {t("No Crypto")}
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-center justify-center-safe">
                                                <p className="text-[12px] leading-[18px]">
                                                    {t("Airdrop Sent")}
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-center justify-center-safe">
                                                <p className="text-[12px] leading-[18px]">
                                                    {t("No Decrease")}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4.5 mb-2 text-center space-y-2">
                                        <ButtonDefault
                                            label={t('Explore')}
                                            leftIconFlag={true}
                                            onClick={() => { router.push("/disco-rave-learn") }}
                                            customClasses="bg-[#00FFCC]/10 text-[#00FFCC] py-2 w-3/6 rounded-full border-[0.5px] border-[#00FFCC] text-[0.9rem] shadow  font-semibold "
                                        ></ButtonDefault>
                                        {/* <div>
                                            <ButtonDefault
                                                label={t("Close")}
                                                onClick={() => props.onClose()}
                                                customClasses="bg-gray-600/10 text-gray-400 py-2 w-3/6 rounded-full border-[0.5px] border-gray-600 text-[0.9rem] shadow font-semibold"
                                            ></ButtonDefault>
                                        </div> */}
                                    </div>
                                </div>

                            </ModalBody>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
};

export default NotEnoughTicketsModal;
