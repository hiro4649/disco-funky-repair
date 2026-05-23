'use client';
import React, { useState } from "react";
import Image from "next/image";
import { prizeHistory, PrizeStatus } from "@/types/prizeHistory";
import ButtonDefault from "../Buttons/ButtonDefault";
import { SendHorizontal, ChevronRight } from "lucide-react";
import Twitter from "../common/icons/twitter";
import moment from "moment";
import Link from "next/link";
import toast from "react-hot-toast";
import '@/css/animations.css'
import { useTranslations } from "next-intl";
const PrizeHistoryCell: React.FC<any> = (data: { item: prizeHistory, index: number, openModal: Function, addClass: string, onSendToWallet: Function }) => {
    const t = useTranslations('PrizeHistory');
    const { item, index, openModal, addClass, onSendToWallet } = data
    const formattedDate = moment(item.end_time).utc().format('YYYY.MM.DD HH:mm:ss');

    return (
        <>
            <div
                key={index}
                className={`prize-fade-in-left rounded-[8px] border-y-[0.5px] border-y-[#666666] bg-white px-[18px] py-[.85rem] shadow-1 dark:bg-secondary transition-all duration-1000 ease-in-out  ${addClass}`}
            >
                <div className="text-[14px] leading-[1.2rem] font-light text-main flex justify-center gap-1 p-[.2rem] bg-black rounded-[5px] mb-[14px]">
                    <span>{formattedDate}</span> <span className="text-[#ffffff80] font-light">(UTC)</span>
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
                                customClasses={`relative shadow-3 w-full rounded-full text-[14px] leading-[1.2rem] text-black py-[5px] px-3 font-semibold ${item.clickStatus == false ? `gradient-bg-main` : 'bg-[#474747] text-white'}`}
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
                                customClasses={`relative shadow-3 w-full rounded-full text-[14px] leading-[1.2rem] text-black py-[5px] px-3 font-semibold ${item.clickStatus == false ? `gradient-bg-main` : 'bg-[#474747] text-white pointer-events-none'}`}
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
                                customClasses="bg-[#474747] shadow-3 rounded-full w-full text-[14px] font-semibold  leading-[1.2rem] text-main border-y-2 border-main py-[5px] px-3"
                            >
                            </ButtonDefault>
                            :
                            <></>
                    }
                    {
                        item.status == 'RECEIVED' ?
                            <div className="relative flex items-center justify-between gap-x-2 mt-[18px] text-main text-[12px] leading-[16px] rounded-lg bg-black p-[.6rem_.8rem]" >
                                <p className="w-full break-all text-left">{item.tx_hash}</p>
                                <div className="flex w-[25px] h-[25px]" style={{ color: "white" }}>
                                    <Link href={`${process.env.NEXT_PUBLIC_ETHERSCAN_EXPLORER}/tx/${item.tx_hash}`} target="_blank">
                                        <Image width={25} height={25} src={'/images/icon/iconlink.svg'} alt="link" />
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
