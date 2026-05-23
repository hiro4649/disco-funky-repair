'use client';
import React from "react";
import Image from "next/image";
import { point } from "@/types/point";
import moment from "moment";
import { useTranslations } from "next-intl";

const PointCell: React.FC<{ item: any, index: number }> = (data) => {
    const t = useTranslations('FanPoints');
    const { item, index } = data;
    const formattedDate = moment(item.receivedDate).utc().format('YYYY-MM-DD HH:mm:ss');
    return (
        <div key={index} className="flex justify-between text-[13px] py-[.35rem] border-b border-[#222]">
            <p className="text-white font-normal w-[40%] leading-[1.4]">{formattedDate}</p>
            <div className="flex flex-col w-[60%]">
                <div className="flex items-center w-full">
                    <p className="text-[#999999] font-normal flex-grow px-3 text-nowrap leading-[1.4]">
                        {item.reason == 1 && t('Daily Connect Bonus')}
                        {item.reason == 2 && t('point prize')}
                        {item.reason == 3 && t('point nft')}
                        {item.reason == 4 && "Referral Bonus"}
                    </p>
                    <p className="text-[#FFFF33] font-normal w-[40px] text-right leading-[1.4]">{item.point}</p>
                </div>
                <div className="flex items-center w-full">
                    <p className="text-[#999999] font-normal flex-grow px-3 text-nowrap leading-[1.4]">
                        {t('point nft')}
                    </p>
                    <p className="text-[#FFFF33] font-normal w-[40px] text-right leading-[1.4]">{item.nftBonus}</p>
                </div>
            </div>
        </div>
    );
};

export default PointCell;
