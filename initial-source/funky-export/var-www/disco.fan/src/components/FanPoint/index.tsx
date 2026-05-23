'use client';
import React, { useCallback, useEffect, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import PointCell from "./PointCell";
import { point } from "@/types/point";
import { useDisclosure } from "@nextui-org/modal";
import LeaderRewardModal from "./LeaderRewardModal";
import Image from "next/image";
import { useWallet } from "@suiet/wallet-kit";
import BongoCat from "./BongoCat";
import '@/css/animations.css'
import ConnectWalletMessageModal from "../Lottery/ConnectWalletMessageModal";
import { useAppDispatch, useAppSelector } from "@/store/store";
import gsap from "gsap";
import { setAuthstate, setUserId, setConnectBonus } from "@/store/slices/userSlice";
import confetti from "canvas-confetti"
import { useTranslations } from "next-intl";
import moment from "moment-timezone";
import FanPointSnapshot from "./FanPointSnapshot";
import apiClient from "../../../utils/apiClient";

const FanPoint: React.FC<{ pageSize: number, myRanking: boolean }> = (data) => {
    const { authState, ticket, connectBonus, user_id } = useAppSelector((state) => state.user);
    const [isClient, setIsClient] = useState(false);
    const [connectWalletModal, setConnectWalletModal] = useState(false);
    const [pointHistory, setPointHistory] = useState<point[]>([]);
    const [totalPts, setTotalPts] = useState<number | null>();
    const wallet = useWallet();
    const dispatch = useAppDispatch();
    const t = useTranslations('FanPoints');
    const numberRef = useRef<HTMLParagraphElement>(null);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const { isOpen, onOpen, onClose } = useDisclosure();

    const getPointHistory = useCallback(async () => {
        if (!user_id) return;
        
        try {
            const res = await apiClient.get(`/user/point/history/${user_id}`);
            if (res.status === 200) {
                setPointHistory(res.data.data);
                setTotalPts(res.data.pts.experience);
            }
        } catch (error) {
            console.error('Error fetching point history:', error);
        }
    }, [user_id]);

    useEffect(() => {
        if (user_id && wallet.account?.address) {
            getPointHistory();
        }
    }, [user_id, getPointHistory, connectBonus, wallet.account?.address]);

    const noHisotry = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (noHisotry.current) {
            gsap.fromTo(noHisotry.current,
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1.2,
                    ease: "power2.out",
                    trigger: noHisotry.current,
                    start: "top 80%",
                    once: true,
                }
            );
        }
    }, []);

    const dailyLoginStatus = async () => {
        if (!authState) {
            setConnectWalletModal(true);
            return;
        }

        try {
            const response = await apiClient.post(`/user/daily/point/${user_id}`);
            if (response.status === 200 && response.data.dailyLogined === true) {
                const data = response.data;
                dispatch(setConnectBonus(data.dailyLogined));
                //display confetti
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                });
            }
            else if (response.status === 202) {
                toast(t("SuccessToast"),
                    {
                        icon: '⚠️',
                        style: {
                            borderRadius: '10px',
                            background: '#333',
                            color: '#fff',
                        },
                    }
                );
                return;
            }
        } catch (error) {
            console.error('Error in daily login:', error);
        }
    };

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
    }, [totalPts]);

    return (
        <div className="background overflow-hidden">
            {/* <div className="stars"></div>
            <div className="stars1"></div>
            <div className="stars2"></div> */}
            <div className="mx-auto max-w-[480px]">
                <div className="pt-7 space-y-5.5 px-3">
                    <div className="flex justify-center">
                        <p className="mb-2.5 text-[24px] leading-[28px] text-white normal">
                            {/* Fan <span className="text-[#00FFCC]">P</span>oints */}
                            {t('Fan Points')}
                        </p>
                    </div>
                    <div className="w-full py-6 bg-[#00FFCC1A] rounded-lg border-y-[0.5px] border-[#00FFCC]" onClick={authState ? () => { } : () => { setConnectWalletModal(true) }}>
                        <div className="mx-[15px] h-[75px] rounded-full bg-black items-center flex-col flex justify-center text-center">
                            <p className="text-[14px] text-[#00FFCC] normal">{t('Total points')}</p>
                            {totalPts == null
                                ? <p className="text-[26px] text-[#FFFF33] font-normal mt-[3px] slow-blink">--</p>
                                : <p className="text-[26px] rainbow-text font-normal mt-[3px]" ref={numberRef}>{totalPts}</p>}
                            {/* <p className="text-[26px] text-[#FFFF33] font-normal mt-[3px]">{totalPts}</p> */}
                        </div>
                        {/* <p className="text-xs mx-[15px] text-center normal text-white leading-4 mt-[11px]">{t('Description')}</p> */}
                    </div>
                    <div className="px-3.5 py-2 pb-0">
                        {/* Replace the token snapshot section with the FanPointSnapshot component */}
                        <FanPointSnapshot onProgressComplete={getPointHistory} />
                    </div>
                    <div
                        onClick={dailyLoginStatus}
                        className="relative flex items-center justify-center gap-2 px-6 py-2 border-2 border-[#00FFCC] rounded-full text-white text-lg font-semibold hover:bg-[#00FFCC] hover:text-black transition-all duration-300"
                    >
                        {t('Daily Connect Bonus')}
                        {connectBonus
                            ? <></>
                            : <span className="absolute right-6 z-1 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                                1
                            </span>
                        }

                    </div>
                    <div className="rounded-lg border-[.5px] border-[#666666] px-[1.1rem]">
                        <div className="flex justify-between items-center border-b-[0.5px] border-[#666666] text-[14px] text-[#00FFCC] font-normal pt-[0.9rem] pb-[0.4rem]">
                            {/* <p>Day</p> */}
                            <p className="font-normal">{t('Reward Date and Time')}</p>
                            <p className="font-normal">{t('Points')}</p>
                        </div>
                        <div className="h-[260px] overflow-y-auto py-2 custom-scroll">
                            {pointHistory.length != 0 ? pointHistory.map((el, index) => (
                                <PointCell key={index} index={index} item={el}></PointCell>
                            )) : <div className="flex justify-center items-center h-full">
                                <div ref={noHisotry}>
                                    <div className="flex justify-center"><Image src={'/images/icon/NoHistory48.svg'} width={45} height={45} alt="" /></div>
                                    <p className="text-[16px] font-semibold text-[#00FFCC] leading-[30px]">{t('NoHistory')}</p>
                                </div>
                            </div>}
                        </div>
                    </div>
                    <div className="text-[14px] text-[hsla(0,0%,100%,.8)] font-normal leading-[22px]">
                        {t('Points Description')}
                    </div>
                    {/* <BongoCat /> */}
                    <LeaderRewardModal isOpen={isOpen} onOpen={onOpen} onClose={onClose} />
                </div>
            </div>
            <ConnectWalletMessageModal isOpen={connectWalletModal} isDismissable={true} onClose={() => { setConnectWalletModal(false) }} />
        </div>
    );
};

export default FanPoint;
