'use client';
import React from "react";
import { Heart, Star } from "lucide-react";
import ButtonDefault from "../Buttons/ButtonDefault";
import { useRouter } from "next/navigation";
import HeartIcon from "../common/icons/heart";
import LotteryTicketIcon from "../common/icons/lottery";

const topLeaderRankingData: {
    title: string,
    amount: number,
}[] = [
    {
        title: "First prize",
        amount: 100,
    },
    {
        title: "Second prize",
        amount: 90,
    },
    {
        title: "Thrid prize",
        amount: 80,
    },
    {
        title: "Fourth prize",
        amount: 70,
    },
    {
        title: "Fifth prize",
        amount: 60,
    },
    {
        title: "Sixth prize",
        amount: 50,
    },
    {
        title: "Seventh prize",
        amount: 40,
    },
    {
        title: "Eighth prize",
        amount: 30,
    },
    {
        title: "Ninth prize",
        amount: 20,
    },
    {
        title: "10th prize",
        amount: 10,
    },
    {
        title: "Prizes below",
        amount: 5,
    },
]

const TopLeaderRanking: React.FC<any> = () => {
    const router = useRouter();
    return (
        <>
            <div className="bg-secondary p-5 rounded-lg space-y-4 mb-10">
                <div className="flex text-[20px] items-center font-medium text-white gap-x-2">
                    <LotteryTicketIcon width={22} heigth={22} className="fill-white" />
                    <span>Top Leader Ranking</span>
                </div>
                <div className="text-xs text-white">
                    <span>
                        If you refer a friend to {process.env.NEXT_PUBLIC_APP_NAME}, I will give you the ticket you need to enter the airdrop lottery.
                    </span>
                </div>
                <div className="bg-black p-4 rounded-[8px] border-[0.5px] border-[#444444] space-y-4">
                    {
                        topLeaderRankingData.map((data, index)=>(
                            <div className="flex justify-between text-white text-xs pb-1 border-b-[0.5px] border-b-[#444444]" key={index}>
                                <span>
                                    {data.title}
                                </span>
                                <span className="flex gap-x-1">
                                    <b className="text-[#FFFF33]">{data.amount}</b>pts
                                </span>
                            </div>
                        ))
                    }
                </div>
                <div className="bg-black py-3.5 px-5 rounded-[8px] border-[0.5px] border-[#666666] flex items-center justify-between">
                    <div className="flex items-center text-[#474747] space-x-2">
                        <HeartIcon width={16} height={16} className="fill-white" />
                        <span className="text-sm text-white">
                        Get Ticket This Term
                        </span>
                    </div>
                    <span className="text-xs text-[#FFFF33]">12</span>
                </div>
                <div className="flex justify-center items-center space-x-6">
                    <ButtonDefault
                        label="Leader Board"
                        onClick={() => { router.push('/prize-history') }}
                        customClasses="w-3/6 bg-main/10 text-main w-full py-2 border-[0.5px] border-main rounded-full text-xs shadow-3"
                        leftIconFlag={true}
                    >
                    </ButtonDefault>
                </div>
            </div>
        </>
    );
};

export default TopLeaderRanking;
