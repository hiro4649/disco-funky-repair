'use client';
import React from "react";
import Image from "next/image";
import { prizeHistory, PrizeStatus } from "@/types/prizeHistory";
import ButtonDefault from "../Buttons/ButtonDefault";
import { SendHorizontal, ChevronRight } from "lucide-react";
import { useAppKitAccount } from "@reown/appkit/react";

import Link from "next/link";
import { useTranslations } from 'next-intl';

const PrizeHistoryCellCustom: React.FC<any> = (data: { item: prizeHistory, index: number, openModal: Function, addClass: string, onSendToWallet: Function }) => {
    const { item, index, openModal, addClass, onSendToWallet } = data
    const t = useTranslations('PrizeHistory');
    const { address } = useAppKitAccount();

    const shortenWalletAddress = (address: string) => {
        const start = address.substring(0, ((address.length / 2) - 14)); // Get the first 10 characters
        const end = address.substring(address.length - ((address.length / 2) - 14)); // Get the last 10 characters
        return `${start}.....${end}`;
    };

    return (
        <>
            <div
                key={index}
                className={`prize-fade-in-left rounded-[8px] border-y-[0.5px] border-y-[#666666] bg-white px-[18px] py-[.85rem] shadow-1 dark:bg-secondary transition-all duration-1000 ease-in-out  ${addClass}`}
            >
                <div className="text-[14px] leading-[1.2rem] font-normal text-main flex justify-center gap-1 p-[.2rem] bg-black rounded-[5px] mb-[14px]">
                    <span>{item.probability_time}</span>
                    <span className="text-[#ffffff80] font-light">(UTC)</span>
                </div>
                <div className="flex items-center justify-between gap-x-4 mt-[8px]">
                    <div className="flex gap-x-2 items-center">
                        <div className="flex gap-x-3 items-center justify-center cursor-pointer" >
                            <Image
                                width={40}
                                height={40}
                                className="rounded-full"
                                src={item.prize.icon}
                                alt="Icon"
                            />
                        </div>
                        <div className="flex flex-col items-start">
                            <div className="flex items-center gap-x-2">
                                <span className="text-[17px] leading-[1.3rem] text-white font-medium">{item.prize.symbol}</span>
                                <Image
                                    width={16} // Slightly smaller to leave room for the outer circle
                                    height={16}
                                    src={`/images/logo/chain-logo.svg`}
                                    alt="Icon"
                                    className="rounded-full mb-[1px]"
                                />
                            </div>
                            <span className="text-[14px] leading-[1.2rem]">{item.prize.token_name}</span>
                        </div>
                    </div>
                    <div className="">

                        <div className="flex justify-between items-center">

                            <div className="flex justify-end items-center mt-2.5">

                                <span
                                    className={`text-base font-normal text-[#FFFF33]`}
                                >
                                    {Number(item.prize.quantity).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-[16px] mb-[4px]">
                    {
                        item.status == 'READY' ?
                            <ButtonDefault
                                label={t('SendToWallet')}
                                onClick={() => { }}
                                customClasses={`relative shadow-3 w-full rounded-full text-[14px] leading-[1.2rem] text-black py-[5px] px-3 font-semibold ${item.clickStatus == false ? `gradient-bg-main` : 'bg-[#474747] text-white'}`}
                            // disabled={item.clickStatus}
                            >
                                <SendHorizontal className="absolute right-4 w-[14px] h-[14px]" />
                            </ButtonDefault>
                            :
                            <></>
                    }
                    {
                        item.status == 'SENDING' ?
                            <ButtonDefault
                                label={t("Sending")}
                                onClick={() => { }}
                                customClasses="bg-[#474747] shadow-3 rounded-full w-full text-[14px] font-semibold  leading-[1.2rem] text-main border-y-2 border-main py-[5px] px-3 fade-sending-wallet"
                            >
                            </ButtonDefault>
                            :
                            <></>
                    } 
                    {
                        item.status == 'RECEIVED' ?
                            <div className="relative flex items-center mt-[18px]  text-main text-[10px] leading-[12.1px] rounded-lg bg-black py-2.5 px-2.5" >
                                <p className="w-full break-all mr-1">{address!}</p> <Image src={'/images/icon/copy-w.svg'} width={17} height={17} alt="copy" /> <Link href={`${process.env.NEXT_PUBLIC_ETHERSCAN_EXPLORER}/address/${address}`} target="_blank"><Image className="absolute right-1.5" width={15} height={15} src={'/images/icon/icon-link.svg'} alt="link" /></Link>
                            </div> : <></>
                    }
                </div>
            </div>

        </>
    );
};

export default PrizeHistoryCellCustom;
