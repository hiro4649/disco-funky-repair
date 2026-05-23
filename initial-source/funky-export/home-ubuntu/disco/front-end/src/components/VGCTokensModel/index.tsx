'use client';
import React, { useEffect, useRef } from 'react';
import Image from "next/image";
import Particleground from '../Particleground';
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslations } from 'next-intl';

gsap.registerPlugin(ScrollTrigger);

const VGCTokensModel = () => {
    const t = useTranslations('VGCTokensModel');
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

        <div className='mx-auto max-w-[480px] flex'>
            <Particleground />
            <div className='px-3 z-10'>
                <div className="pt-7">
                    <div className="flex items-center justify-center">
                        <p className="mb-2.5 text-[24px] leading-[28px] text-white normal">
                            {/* <AirdropIcon className="inline-block fill-white" />  */}
                            {t('VGC Tokens Model')}
                        </p>
                    </div>
                    <div className='mt-5 text-white/80 leading-[22px] text-[15px]'>
                        <p>{t('Introduction')}</p>
                        <p className='my-5'>{t('Model Description')}</p>
                        <div className="flex justify-center mb-[0.8rem]">
                            <div ref={addToRefs} className='pt-3 opacity-0 translate-y-[30px]'>
                                <Image
                                    src="/images/top_vgc.png"
                                    alt="top vgc"
                                    width={480}
                                    height={313.99}
                                    className="rounded-lg "
                                />
                            </div>
                        </div>
                        <div>
                            <p className='text-main font-semibold mt-5 mb-[0.8rem]'>{t('How It Works')}</p>
                            <p className='text-white font-semibold'>{t('Circulation')}</p>
                            <p>{t('Circulation Description')}</p>
                            <p className='text-white font-semibold mt-[0.8rem]'>{t('Reward Pool')}</p>
                            <p>{t('Reward Description')}</p>
                            <p className='text-white font-semibold mt-[0.8rem]'>{t('Liquidity Pool')}</p>
                            <p>{t('Liquidity Description')}</p>
                            <p className='text-white font-semibold mt-[0.8rem]'>{t('Growth and Return')}</p>
                            <p>{t('Growth Description')}</p>
                        </div>
                        <div>
                            <p className='text-main font-semibold mt-5 mb-[0.8rem]'>{t('Investor Benefits')}</p>
                            <p className='text-white font-semibold'>{t('Returns')}</p>
                            <p>{t('Returns Description')}</p>
                            <p className='text-white font-semibold mt-[0.8rem]'>{t('Price Stability')}</p>
                            <p>{t('Stability Description')}</p>
                            <p className='text-white font-semibold mt-[0.8rem]'>{t('Price Appreciation')}</p>
                            <p>{t('Appreciation Description')}</p>
                            <p className='text-white font-semibold mt-[0.8rem]'>{t('Transparency')}</p>
                            <p>{t('Transparency Description')}</p>
                        </div>
                        <div>
                            <p className='text-main font-semibold mt-5 mb-[0.8rem]'>{t('Model Differences')}</p>
                            <p>{t('Differences Description')}</p>
                        </div>
                        <div>
                            <p className='text-main font-semibold mt-5 mb-[0.8rem]'>{t('Future')}</p>
                            <p>{t('Future Description')}</p>
                            <div className='mt-[0.8rem]'>
                                <p>• {t('Benefits List').split('\n')[0]}</p>
                                <p>• {t('Benefits List').split('\n')[1]}</p>
                                <p>• {t('Benefits List').split('\n')[2]}</p>
                                <p>• {t('Benefits List').split('\n')[3]}</p>
                            </div>
                            <div ref={addToRefs} className='py-5 opacity-0 translate-y-[30px]'>
                                <Image
                                    src="/images/top2_vgc.png"
                                    alt="Disco Rave"
                                    width={480}
                                    height={296.64}
                                    className='rounded-lg '
                                />
                            </div>
                            <p>{t('Join Us')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VGCTokensModel;
