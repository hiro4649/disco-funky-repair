'use client';
import React from "react";
import Image from "next/image";
import { point } from "@/types/point";
import moment from "moment-timezone";
import { useTranslations } from "next-intl";

const PointCell: React.FC<{ item: point, index: number }> = (data) => {
    const t = useTranslations('FanPoints');
    const { item, index } = data;
    const formattedDate = moment(item.receivedDate).utc().format('YYYY-MM-DD HH:mm');
    
    // Get the appropriate description based on reason
    const getDescription = () => {
        switch (item.reason) {
            case 1:
                return t('point daily');
            case 2:
                return t('point prize');
            case 3:
                return t('point nft');
            case 4:
                return t('point referral');
            default:
                return t('point daily');
        }
    };

    return (
        <div 
            key={index} 
            className="flex justify-between items-center text-[13px] py-[0.3rem] border-b border-[#222]"
        >
            <p className="text-white font-normal w-[40%]">{formattedDate}</p>
            <div className="flex items-center w-[60%]">
                <p className="text-[#999999] font-normal flex-grow px-3">{getDescription()}</p>
                <p className="text-[#FFFF33] font-semibold w-[40px] text-right">{item.point}</p>
            </div>
        </div>
    );
};

export default PointCell;
