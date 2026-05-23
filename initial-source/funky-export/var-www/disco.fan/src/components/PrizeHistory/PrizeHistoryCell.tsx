'use client';
import React, { useState } from "react";
import Image from "next/image";
import { prizeHistory, PrizeStatus } from "@/types/prizeHistory";
import ButtonDefault from "../Buttons/ButtonDefault";
import { SendHorizontal, ChevronRight } from "lucide-react";
import Twitter from "../common/icons/twitter";
import moment from "moment-timezone";
import { useWallet } from "@suiet/wallet-kit";
import Link from "next/link";
import toast from "react-hot-toast";
import '@/css/animations.css'
import { useTranslations } from "next-intl";
const PrizeHistoryCell: React.FC<any> = (data: { item: prizeHistory, index: number, openModal: Function, addClass: string, onSendToWallet: Function }) => {
    const t = useTranslations('PrizeHistory');
    const { item, index, openModal, addClass, onSendToWallet } = data
    const formattedDate = moment(item.end_time).format('YYYY.MM.DD HH:mm:ss');
    const wallet = useWallet();
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
    const shortenSuiAddress = (address: string) => {
        const start = address.substring(0, ((address.length / 2) - 14)); // Get the first 10 characters
        const end = address.substring(address.length - ((address.length / 2) - 14)); // Get the last 10 characters
        return `${start}.....${end}`;
    };

    return (
        <>
            <div
                key={index}
                className={`prize-fade-in-left rounded-[8px] border-y-[0.5px] border-y-[#666666] bg-white px-[18px] py-[.85rem] shadow-1 dark:bg-[#1D1B20] transition-all duration-1000 ease-in-out  ${addClass}`}
            >
                <div className="text-[15px] leading-[1.2rem] font-medium text-[#00FFCC] flex justify-center">
                    {formattedDate}
                </div>
                <div className="flex items-center justify-between gap-x-4 mt-[8px]">
                    <div className="flex gap-x-2 items-center">
                        <div className="flex gap-x-3 items-center justify-center cursor-pointer">
                            <Image
                                width={40}
                                height={40}
                                className="rounded-full"
                                src={`${item.prize.icon}`}
                                alt="Icon"
                            />
                        </div>
                        <div className="flex flex-col items-start">
                            <div className="flex items-center gap-x-2">
                                <span className="text-[17px] leading-[1.3rem] text-white font-semibold">{item.prize.symbol}</span>
                                <Image
                                    width={11} // Slightly smaller to leave room for the outer circle
                                    height={11}
                                    src={`/images/logo/sui-logo.png`}
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
                                    {item.prize.quantity === 0 ? 'N/A' : Number(item.prize.quantity / item.prize.price).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-[16px] mb-[4px]">
                    {
                        item.status == 'EXPIRED' ?
                            <ButtonDefault
                                label={t('SendToWallet')}
                                onClick={() => { }}
                                customClasses={`relative shadow-3 w-full rounded-full text-[14px] leading-[1.2rem] text-black py-[5px] px-3 font-semibold ${item.clickStatus == false ? `bg-[#00FFCC]` : 'bg-[#474747] text-white'}`}
                            // disabled={item.clickStatus}
                            >
                                &nbsp;&nbsp;
                                <SendHorizontal className="absolute right-4 w-[14px] h-[14px]" />
                            </ButtonDefault>
                            :
                            <></>
                    }
                    {
                        item.status == 'READY' ?
                            <ButtonDefault
                                label={t('SendToWallet')}
                                onClick={() => { onSendToWallet(item.id) }}
                                customClasses={`relative shadow-3 w-full rounded-full text-[14px] leading-[1.2rem] text-black py-[5px] px-3 font-semibold ${item.clickStatus == false ? `bg-[#00FFCC]` : 'bg-[#474747] text-white'}`}
                            // disabled={item.clickStatus}
                            >
                                &nbsp;&nbsp;
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
                                customClasses="bg-[#474747] shadow-3 rounded-full w-full text-[14px] font-semibold  leading-[1.2rem] text-[#00FFCC] border-y-2 border-[#00FFCC] py-[5px] px-3"
                            >
                            </ButtonDefault>
                            :
                            <></>
                    }
                    {
                        item.status == 'RECEIVED' ?
                            <div className="relative flex items-center mt-[18px] text-[#00FFCC] text-[12px] leading-[12.1px] rounded-lg bg-black px-3.5" >
                                <p className="w-full break-all mr-1 py-2 text-left">{item.tx_hash}</p>

                                <div className="flex w-[25px] h-[25px] ml-1 align-center" style={{ color: "white" }}>
                                    <Image onClick={() => { copyText(item.tx_hash) }} src={'/images/icon/copy-w.svg'} width={20} height={20} alt="copy" />
                                </div>
                                <div className="flex w-[25px] h-[25px] ml-2" style={{ color: "white" }}>
                                    <Link href={`https://suivision.xyz/txblock/${item.tx_hash}`} target="_blank">
                                        <Image className="absolute right-[3px]" width={25} height={25} src={'/images/icon/iconlink.svg'} alt="link" />
                                    </Link>
                                </div>
                            </div> : <></>
                    }
                </div>
            </div>
        </>
    );
};

export default PrizeHistoryCell;
