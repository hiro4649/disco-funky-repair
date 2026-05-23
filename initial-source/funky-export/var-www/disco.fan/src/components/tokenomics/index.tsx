'use client';
import React, { useEffect, useRef } from 'react';
import Image from "next/image";
import PieChart from './PieChart';
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslations } from 'next-intl';
import Particleground from '../LearnRave/Particleground';

gsap.registerPlugin(ScrollTrigger);

const Tokenomics = () => {
    const t = useTranslations('Tokenomics');
    const imageRefs = useRef<HTMLDivElement[]>([]);

    useEffect(() => {
        // Reset the refs array to avoid duplicates
        imageRefs.current = imageRefs.current.filter(Boolean);

        imageRefs.current.forEach((img) => {
            gsap.fromTo(
                img,
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1.2,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: img,
                        start: "top 80%",
                        toggleActions: "play none none reverse",
                    },
                }
            );
        });
}, []);

    const addToRefs = (el: HTMLDivElement | null) => {
        if (el && !imageRefs.current.includes(el)) {
            imageRefs.current.push(el);
        }
    };

    return (
        <div className='mx-auto max-w-[480px]'>
            <Particleground />
            <div className="px-3">
                <div className="space-y-3 pt-7 backface-hidden">
                    <div className="flex items-center justify-center">
                        <p className="mb-2.5 text-[24px] leading-[28px] text-white normal">
                            {t('Tokenomics')}
                        </p>
                    </div>
                    <div className='text-white text-[15px] leading-[22px]'>
                        <p className='font-semibold'> {t('Dear Investors')} </p>
                        <p className='font-normal text-white/80 mt-5'> {t('Introduction')} </p>
                        <p className='font-normal text-white/80 mt-5'> {t('Total Issuance')} {t('Total Issuance2')} {t('Total Issuance3')} </p>
                    </div>
                    <div>
                        <PieChart />
                    </div>
                    <div ref={addToRefs} className='pt-2'>
                        <Image
                            src="/images/tokenomics1.png"
                            alt="top vgc"
                            width={447}
                            height={313.99}
                            className="rounded-lg"
                        />
                    </div>
                    <div className='text-[15px] text-white leading-[22px] pt-2'>
                        <p className='font-semibold text-[#00FFCC] pb-[0.8rem]'> {t('Token Allocation')} </p>
                        <p className='font-semibold'> {t('Airdrops')} </p>
                        <p className='text-white/80'> {t('Airdrops Description')} </p>
                        <p className='font-semibold pt-[0.8rem]'> {t('Incentives')} </p>
                        <p className='text-white/80'> {t('Incentives Description')} </p>
                        <p className='font-semibold pt-[0.8rem]'> {t('Liquidity')} </p>
                        <p className='text-white/80'> {t('Liquidity Description')} </p>
                        <p className='font-semibold pt-[0.8rem]'> {t('Foundation')} </p>
                        <p className='text-white/80'> {t('Foundation Description')} </p>
                        <p className='font-semibold pt-[0.8rem]'> {t('Stability')} </p>
                        <p className='text-white/80'> {t('Stability Description')} </p>
                        <p className='font-semibold pt-[0.8rem]'> {t('Reserves')} </p>
                        <p className='text-white/80'> {t('Reserves Description')} </p>
                        <p className='font-semibold pt-[0.8rem]'> {t('Burns')} </p>
                        <p className='text-white/80'> {t('Burns Description')} </p>
                        <p className='font-semibold pt-[0.8rem]'> {t('Partnerships')} </p>
                        <p className='text-white/80'> {t('Partnerships Description')} </p>
                    </div>
                    <div ref={addToRefs} className='pt-2'>
                        <Image
                            src="/images/tokenomics2.png"
                            alt="top vgc"
                            width={447}
                            height={313.99}
                            className={`rounded-lg`}
                        />
                    </div>
                    <div className='text-[15px] text-white leading-[22px] pt-2'>
                        <p className='pb-[0.8rem] text-[#00FFCC] font-semibold'>{t('Key Features')}</p>
                        <p className='font-semibold'>{t('Ecosystem Growth')}</p>
                        <p className='text-white/80'>{t('Growth Description')}</p>
                        <p className='font-semibold pt-[0.8rem]'>{t('Liquidity Support')}</p>
                        <p className='text-white/80'>{t('Liquidity Support Description')}</p>
                        <p className='font-semibold pt-[0.8rem]'>{t('Operational Strength')}</p>
                        <p className='text-white/80'>{t('Operational Description')}</p>
                    </div>
                </div>
                <div className='text-[15px] text-white/80 leading-[22px]'>
                    <p className='text-[#00FFCC] font-semibold mt-5 mb-[0.8rem]'>{t('Closing Statement')}</p>
                    <p>{t('Closing Description')}</p>
                    <p className='mt-5'>{t('Sincerely')}</p>
                    <p className='font-normal text-[15px] text-white mt-[1.25rem] italic'>{t('Project Team')}</p>
                </div>
            </div>
        </div>
    )
}

export default Tokenomics;
