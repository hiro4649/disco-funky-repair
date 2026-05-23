'use client';
import React, { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import PointCell from "./PointCell";
import { point } from "@/types/point";
import { useDisclosure } from "@nextui-org/modal";
import LeaderRewardModal from "./LeaderRewardModal";
import Image from "next/image";
import '@/css/animations.css'
import ConnectWalletMessageModal from "../Lottery/ConnectWalletMessageModal";
import { useAppDispatch, useAppSelector } from "@/store/store";
import gsap from "gsap";
import { setConnectBonus } from "@/store/slices/userSlice";
import confetti from "canvas-confetti"
import { useTranslations } from "next-intl";
import FanPointSnapshot from "./FanPointSnapshot";
import apiClient from "../../../utils/apiClient";
import { useAppKitAccount } from "@reown/appkit/react";
import Nfts from "../Lottery/Nfts";
import { refreshUserInfo } from "@/utils/refreshUserInfo";

const FanPoint: React.FC<{ pageSize: number, myRanking: boolean }> = (data) => {
    const { authState, ticket, connectBonus, user_id } = useAppSelector((state) => state.user);
    const [isClient, setIsClient] = useState(false);
    const [connectWalletModal, setConnectWalletModal] = useState(false);
    const [pointHistory, setPointHistory] = useState<any[]>([]);
    const [totalPts, setTotalPts] = useState<number | null>();
    const { isConnected } = useAppKitAccount();
    const dispatch = useAppDispatch();
    const t = useTranslations('FanPoints');
    const numberRef = useRef<HTMLParagraphElement>(null);
    const characterRef = useRef<HTMLImageElement>(null);

    // Random jumping image selection
    const jumpingImages = [
        "/images/jump_gacha/1_jump_03.png",
        "/images/jump_gacha/2_jump_03.png",
        "/images/jump_gacha/3_jump_03.png",
        "/images/jump_gacha/4_jump_03.png",
        "/images/jump_gacha/5_jump_03.png",
        "/images/jump_gacha/6_jump_03.png"
    ];

    useEffect(() => {
        setIsClient(true);
    }, []);

    const { isOpen, onOpen, onClose } = useDisclosure();

    // Function to get random jumping image
    const getRandomJumpingImage = () => {
        const randomIndex = Math.floor(Math.random() * jumpingImages.length);
        return jumpingImages[randomIndex];
    };

    const [randomJumpingImage, setRandomJumpingImage] = useState(getRandomJumpingImage());

    const getPointHistory = useCallback(async () => {
        if (!user_id) return;

        try {
            const res = await apiClient.get(`/user/point/history/${user_id}`);
            if (res.status === 200) {
                setTotalPts(res.data.pts.fan_points);
                const updateData = res.data.data.filter((item: any, index: number) => {
                    if (item.reason !== 3) {
                        if (index === 0) {
                            item.nftBonus = 0;
                        } else {
                            if (res.data.data[index - 1].reason === 3) {
                                item.nftBonus = res.data.data[index - 1].point;
                            } else {
                                item.nftBonus = 0;
                            }
                        }
                        return item;
                    }
                });
                setPointHistory(updateData);
            }
        } catch (error) {
            console.error('Error fetching point history:', error);
        }
    }, [user_id]);

    useEffect(() => {
        if (user_id && isConnected) {
            getPointHistory();
        }
    }, [user_id, getPointHistory, connectBonus, isConnected]);

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

    const startJumpingAnimation = () => {
        const character = characterRef.current;
        setRandomJumpingImage(getRandomJumpingImage());

        async function animateCharacter() {
            if (!character) return;

            character.style.display = 'block';

            // Wait for image to load before starting animation
            const startAnimation = () => {
                const startX = -280; // Use fixed width since image might not be loaded yet
                const endX = window.innerWidth + 200;
                const baseY = window.innerHeight - 140; // Adjust for image height
                const peakY = window.innerHeight * 0.05;
                const duration = 2000;

                let startTime: number | null = null;

                function jump(time: number) {
                    if (!startTime) startTime = time;
                    const t = (time - startTime) / duration;

                    if (t > 1) {
                        character!.style.display = 'none';
                        return;
                    }

                    const x = startX + (endX - startX) * t;
                    const jumpProgress = t;
                    const y = baseY - (4 * (baseY - peakY)) * jumpProgress * (1 - jumpProgress);

                    let scale;
                    if (jumpProgress < 0.5) {
                        scale = 1 + jumpProgress * 2;
                    } else {
                        scale = 2 - (jumpProgress - 0.5) * 2;
                    }

                    const rotate = 40 * jumpProgress;

                    character!.style.left = `${x}px`;
                    character!.style.top = `${y}px`;
                    character!.style.transform = `scale(${scale}) rotate(${rotate}deg)`;

                    requestAnimationFrame(jump);
                }

                requestAnimationFrame(jump);
            };

            // Check if image is already loaded
            if (character.complete && character.naturalHeight !== 0) {
                startAnimation();
            } else {
                // Wait for image to load
                character.onload = startAnimation;
            }
        }

        setTimeout(() => {
            animateCharacter();
        }, 100);
    };

    const dailyLoginStatus = async () => {
        if (!authState) {
            setConnectWalletModal(true);
            return;
        }

        try {
            const response = await apiClient.post(`/user/daily/point/${user_id}`);
            if (response.status === 200 && response.data.dailyLogined === false) {
                const data = response.data;
                dispatch(setConnectBonus(data.dailyLogined));

                // Refresh user info to get updated fan points
                await refreshUserInfo(user_id, dispatch);

                //display confetti
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                });

                startJumpingAnimation();
            }
            else if (response.status === 202) {
                toast(t("SuccessToast"),
                    {
                        icon: '⚠️',
                        style: {
                            borderRadius: '10px',
                            background: 'var(--color-secondary)',
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
        <div className="background overflow-hidden relative">
            {/* <div className="stars"></div>
            <div className="stars1"></div>
            <div className="stars2"></div> */}
            <div className="mx-auto max-w-[480px]">
                <div className="pt-7 space-y-5.5 px-3">
                    <div className="flex justify-center">
                        <p className="mb-2.5 text-[24px] leading-[28px] text-white normal">
                            {/* Fan <span className="text-main">P</span>oints */}
                            {t('Fan Points')}
                        </p>
                    </div>
                    <div className="w-full py-6 bg-main-150 rounded-lg border-y-[0.5px] border-main" onClick={authState ? () => { } : () => { setConnectWalletModal(true) }}>
                        <div className="mx-[15px] h-[75px] rounded-full bg-black items-center flex-col flex justify-center text-center">
                            <p className="text-[14px] text-main normal">{t('Total points')}</p>
                            {totalPts == null
                                ? <p className="text-[26px] text-[#FFFF33] font-normal mt-[3px] slow-blink">--</p>
                                : <p className="text-[26px] text-[#FFFF33] font-normal mt-[3px]" ref={numberRef}>{totalPts}</p>}
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
                        className="relative flex items-center justify-center gap-2 px-6 py-2 border-2 border-main rounded-full text-white text-lg font-normal hover:bg-main hover:text-black transition-all duration-300"
                    >
                        {t('Daily Connect Bonus')}
                        {connectBonus
                            ? <span className="absolute right-6 z-1 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                                1
                            </span>
                            : <></>
                        }
                    </div>
                    <div className="rounded-lg border-[.5px] border-[#666666] px-[1.1rem]">
                        <div className="flex justify-between items-center border-b-[0.5px] border-[#666666] text-[14px] text-main font-normal pt-[0.9rem] pb-[0.4rem]">
                            {/* <p>Day</p> */}
                            <p className="font-normal">{t('Reward Date and Time')}</p>
                            <p className="font-normal">{t('Points')}</p>
                        </div>
                        <div className="h-[300px] overflow-y-auto pt-1 pb-2 custom-scroll">
                            {pointHistory.length != 0 ? pointHistory.map((el, index) => (
                                <PointCell key={index} index={index} item={el}></PointCell>
                            )) : <div className="flex justify-center items-center h-full">
                                <div ref={noHisotry}>
                                    <div className="flex justify-center"><Image src={'/images/icon/NoHistory48.svg'} width={45} height={45} alt="" /></div>
                                    <p className="text-[16px] font-semibold text-main leading-[30px]">{t('NoHistory')}</p>
                                </div>
                            </div>}
                        </div>
                    </div>
                    <Nfts />
                    <div className="text-[14px] text-[hsla(0,0%,100%,.8)] font-light leading-[22px]">
                        {t('Points Description')}
                    </div>
                    {/* <BongoCat /> */}
                    <LeaderRewardModal isOpen={isOpen} onOpen={onOpen} onClose={onClose} />
                </div>
            </div>
            <img
                ref={characterRef}
                src={randomJumpingImage}
                alt="Bull character"
                style={{
                    position: 'fixed',
                    top: '60%',
                    left: '50%',
                    zIndex: '9999',
                    width: '420px',
                    height: 'auto',
                    transformOrigin: 'center center',
                    display: 'none'
                }}
            />
            <ConnectWalletMessageModal isOpen={connectWalletModal} isDismissable={true} onClose={() => { setConnectWalletModal(false) }} />
        </div>
    );
};

export default FanPoint;
