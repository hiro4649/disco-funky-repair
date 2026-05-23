'use client';
import React, { useEffect, useRef } from 'react';
import Image from "next/image";
import Particleground from '../Particleground';
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslations } from 'next-intl';

gsap.registerPlugin(ScrollTrigger);

const LearnRave = () => {
    const imageRefs = useRef<HTMLDivElement[]>([]);
    const t = useTranslations(`Explore${process.env.NEXT_PUBLIC_APP_NAME}RAVE`)
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
            {/* <div className='w-full'></div> */}
            <div className="px-3 z-10">
                <div className="space-y-[20px] pt-7">
                    <div className="flex items-center justify-center">
                        <p className="mb-2.5 text-[24px] leading-[28px] text-white normal">
                            {t(`${process.env.NEXT_PUBLIC_APP_NAME} RAVE`)}
                        </p>
                    </div>
                    <div className='text-white leading-[22px] text-[15px]'>
                        <p className='font-semibold pb-2'> {t('AI agent operating')} </p>
                        <p className='text-white/80 font-normal'> {t('RiseFlowAI Description')} </p>
                    </div>

                    <div className="flex relative justify-center">
                        <div ref={addToRefs} className=''>
                            <Image
                                className='z-40'
                                src="/images/exploreDiscoRave.png"
                                alt="top riseflowai"
                                width={480}
                                height={288.15}
                            />
                        </div>
                    </div>

                    <div className='text-white leading-[22px] text-[15px]'>
                        <p className='font-semibold text-main mb-2'> {t('Precision in Market Analysis')} </p>
                        <p className='text-white/80'> {t('Market Analysis Description')} </p>
                    </div>
                    <div className='text-white leading-[22px] text-[15px] '>
                        <p className='font-semibold text-main mb-2'> {t('Fair and Sustainable')} </p>
                        <p className='text-white/80'> {t('Airdrop Description')} </p>
                    </div>
                    <div className='text-white leading-[22px] text-[15px]'>
                        <p className='font-semibold text-main mb-2'> {t('Maximizing Returns')} </p>
                        <p className='text-white/80 mb-5'> {t('Returns Description')} </p>
                        <p className='text-white/80'> {t('Future Vision')} </p>
                    </div>
                    <div className="flex justify-center relative">
                        <Particleground />
                        <div ref={addToRefs} className=''>
                            <Image
                                className='z-40'
                                src="/images/top2_riseflowai.png"
                                alt="top riseflowai"
                                width={480}
                                height={366.75}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-center">
                        <p className="mt-7 mb-2 font-saira text-[24px] font-normal leading-[28px] text-main">
                            {t(`${process.env.NEXT_PUBLIC_APP_NAME} User Guide`)}
                        </p>
                    </div>
                    <div className='text-white leading-[22px] text-[15px] '>
                        <p className='text-white/80 mb-5'> {t('Guide Description')} </p>
                        <p className='text-white/80 mb-5'> {t('Token Holding')} </p>
                        <p className='font-semibold text-main mb-2'> {t('Features')} </p>
                        <p className='font-semibold'> {t('No Staking Required')} </p>
                        <p className='text-white/80 mb-2'> {t('No Staking Description')} </p>
                        <p className='font-semibold'> {t('Completely Free')} </p>
                        <p className='text-white/80 mb-2'> {t('Free Description')} </p>
                        <p className='font-semibold'>{t('No Losers')}</p>
                        <p className='text-white/80 mb-2'> {t('No Losers Description')} </p>
                        <p className='font-semibold'> {t('AI Management')} </p>
                        <p className='text-white/80'> {t('AI Management Description')} </p>
                    </div>

                    <div className='text-white leading-[22px] text-[15px] border-b border-main'>
                        <p className='font-semibold text-main mb-2'>
                            <span className="inline-block bg-secondary rounded-md text-center text-[14px] py-[2px] px-[6px]">{t('Step1')}</span>
                            &nbsp;&nbsp;&nbsp;
                            {t(`Hold ${process.env.NEXT_PUBLIC_APP_NAME} Tokens`)}
                        </p>
                    </div>
                    <div className='text-white leading-[22px] text-[15px]'>
                        <p className='font-semibold mt-5'> {t('Purchase Tokens')} </p>
                        <p className='text-white/80'> {t('Purchase Description')} </p>
                        <p className='text-white/80 mb-2'> {t('Purchase Description2')} </p>
                        <div ref={addToRefs} className='border-[0.5px] border-[#666666] m-6 bg-[#000000] rounded-lg'>
                            <div className="flex justify-center content-center p-3 text-center text-white">
                                <Image
                                    width={320}
                                    height={128}
                                    src={"/images/explore_images/disco_explore_001.jpg"}
                                    alt="icon"
                                    className="rounded-[4px]"
                                />
                            </div>
                        </div>
                        <div ref={addToRefs} className='border-[0.5px] border-[#666666] m-6 rounded-lg bg-[#000000]'>
                            <div className="flex justify-center content-center p-3 text-center text-white">
                                <Image
                                    width={320}
                                    height={128}
                                    src={"/images/explore_images/disco_explore_002.jpg"}
                                    alt="icon"
                                    className="rounded-[4px]"
                                />
                            </div>
                        </div>
                        <p className='font-semibold'> {t('Connect Wallet')} </p>
                        <p className='text-white/80'> {t('Connect Description')} </p>.
                        <div ref={addToRefs} className='border-[0.5px] border-[#666666] m-6 rounded-lg bg-[#000000]'>
                            <div className="flex justify-center content-center p-3 text-center text-white">
                                <Image
                                    width={320}
                                    height={128}
                                    src={"/images/explore_images/disco_explore_003.jpg"}
                                    alt="icon"
                                    className="rounded-[4px]"
                                />
                            </div>
                        </div>
                        <p className='text-white/80 '> {t('Connect Description2')} </p>
                        <div ref={addToRefs} className='border-[0.5px] border-[#666666] m-6 rounded-lg bg-[#000000]'>
                            <div className="flex justify-center content-center p-3 text-center text-white">
                                <Image
                                    width={320}
                                    height={128}
                                    src={"/images/explore_images/disco_explore_004.jpg"}
                                    alt="icon"
                                    className="rounded-[4px]"
                                />
                            </div>
                        </div>
                        <p className='font-semibold mt-5'>{t('Hold for 24 Hours')}</p>
                        <p className='text-white/80'> {t('Hold Description')} </p>
                        <p className='text-white/80'> {t('Hold Description2')} </p>
                        <div ref={addToRefs} className='border-[0.5px] border-[#666666] m-6 rounded-lg bg-[#000000]'>
                            <div className="flex justify-center content-center p-3 text-center text-white">
                                <Image
                                    width={320}
                                    height={128}
                                    src={"/images/explore_images/disco_explore_005.jpg"}
                                    alt="icon"
                                    className="rounded-[4px]"
                                />
                            </div>
                        </div>
                        <p className='font-semibold mt-5'> {t('Weekly Bonus')} </p>
                        <p className='text-white/80'> {t('Weekly Bonus Description')}</p>
                        <div ref={addToRefs} className='border-[0.5px] border-[#666666] m-6 rounded-lg bg-[#000000]'>
                            <div className="flex justify-center content-center p-3 text-center text-white">
                                <Image
                                    width={320}
                                    height={128}
                                    src={"/images/explore_images/disco_explore_006.jpg"}
                                    alt="icon"
                                    className="rounded-[4px]"
                                />
                            </div>
                        </div>
                    </div>
                    <div className='text-white leading-[22px] text-[15px] border-b border-main'>
                        <p className='font-semibold text-main mb-2'><span className="inline-block bg-secondary rounded-md text-center text-[14px] py-[2px] px-[6px]">{t('Step2')}</span>&nbsp;&nbsp;&nbsp;
                            {t('Receive Tickets')}</p>
                    </div>
                    <div className='text-white leading-[22px] text-[15px]'>
                        <p className='font-semibold mt-5'>{t('Snapshot Execution')}</p>
                        <p className='text-white/80'> {t('Snapshot Description')} </p>
                        <div ref={addToRefs} className='border-[0.5px] border-[#666666] m-6 rounded-lg bg-[#000000]'>
                            <div className="flex justify-center content-center p-3 text-center text-white">
                                <Image
                                    width={320}
                                    height={128}
                                    src={"/images/explore_images/disco_explore_007.jpg"}
                                    alt="icon"
                                    className="rounded-[4px]"
                                />
                            </div>
                        </div>
                        <p className='font-semibold mt-2'> {t('Ticket Distribution')} </p>
                        <p className='text-white/80'> {t('Distribution Description')} </p>
                        <p className='font-semibold mt-2'> {t('Ticket Validity')} </p>
                        <p className='text-white/80'> {t('Validity Description')} </p>
                        <div ref={addToRefs} className='border-[0.5px] border-[#666666] m-6 rounded-lg bg-[#000000]'>
                            <div className="flex justify-center content-center p-3 text-center text-white">
                                <Image
                                    width={320}
                                    height={128}
                                    src={"/images/explore_images/disco_explore_008.jpg"}
                                    alt="icon"
                                    className="rounded-[4px]"
                                />
                            </div>
                        </div>
                        <div ref={addToRefs} className='border-[0.5px] border-[#666666] m-6 rounded-lg bg-[#000000]'>
                            <div className="flex justify-center content-center p-3 text-center text-white">
                                <Image
                                    width={320}
                                    height={128}
                                    src={"/images/explore_images/disco_explore_009.jpg"}
                                    alt="icon"
                                    className="rounded-[4px]"
                                />
                            </div>
                        </div>
                        <p className='font-semibold mt-2'> {t('Ticket Management')} </p>
                        <p className='text-white/80'> {t('Management Description')} </p>
                        <div ref={addToRefs} className='border-[0.5px] border-[#666666] m-6 rounded-lg bg-[#000000]'>
                            <div className="flex justify-center content-center p-3 text-center text-white">
                                <Image
                                    width={320}
                                    height={128}
                                    src={"/images/explore_images/disco_explore_010.jpg"}
                                    alt="icon"
                                    className="rounded-[4px]"
                                />
                            </div>
                        </div>
                    </div>
                    {/* <div className="flex justify-center">
                        <div ref={addToRefs} className=''>
                            <Image
                                src="/images/rave-image.webp"
                                alt="Disco Rave"
                                width={480}
                                height={140}
                                className="rounded-lg z-40 "
                            />
                        </div>
                    </div> */}
                    <div className='text-white leading-[22px] text-[15px] border-b border-main'>
                        <p className='font-semibold text-main mb-2'><span className="inline-block bg-secondary rounded-md text-center text-[14px] py-[2px] px-[6px]"> {t('Step3')} </span>&nbsp;&nbsp;&nbsp;
                            {t('Participate')}</p>
                    </div>
                    <div className='text-white leading-[22px] text-[15px]'>
                        <p className='font-semibold mt-5'> {t('Press Button')} </p>
                        <p className='text-white/80'> {t('Button Description')} </p>
                        <div ref={addToRefs} className='border-[0.5px] border-[#666666] m-6 rounded-lg bg-[#000000]'>
                            <div className="flex justify-center content-center p-3 text-center text-white">
                                <Image
                                    width={320}
                                    height={128}
                                    src={"/images/explore_images/disco_explore_011.jpg"}
                                    alt="icon"
                                    className="rounded-[4px]"
                                />
                            </div>
                        </div>
                        <p className='font-semibold mt-2'> {t('Fair Lottery')} </p>
                        <p className='text-white/80'> {t('Lottery Description')} </p>
                        <div ref={addToRefs} className='border-[0.5px] border-[#666666] m-6 rounded-lg bg-[#000000]'>
                            <div className="flex justify-center content-center p-3 text-center text-white">
                                <Image
                                    width={320}
                                    height={128}
                                    src={"/images/explore_images/disco_explore_012.jpg"}
                                    alt="icon"
                                    className="rounded-[4px]"
                                />
                            </div>
                        </div>
                        <p className='font-semibold mt-2'> {t('Instant Results')}</p>
                        <p className='text-white/80'> {t('Results Description')} </p>
                        <div ref={addToRefs} className='border-[0.5px] border-[#666666] m-6 rounded-lg bg-[#000000]'>
                            <div className="flex justify-center content-center p-3 text-center text-white">
                                <Image
                                    width={320}
                                    height={128}
                                    src={"/images/explore_images/disco_explore_013.jpg"}
                                    alt="icon"
                                    className="rounded-[4px]"
                                />
                            </div>
                        </div>
                    </div>
                    <div className='text-white leading-[22px] text-[15px] border-b border-main'>
                        <p className='font-semibold text-main mb-2'><span className="inline-block bg-secondary rounded-md text-center text-[14px] py-[2px] px-[6px]">{t('Step4')}</span>&nbsp;&nbsp;&nbsp;
                            {t('Claim Prize')} </p>
                    </div>
                    <div className='text-white leading-[22px] text-[15px]'>
                        <p className='font-semibold mt-5'> {t('Check History')} </p>
                        <p className='text-white/80'> {t('History Description')} </p>
                        <div ref={addToRefs} className='border-[0.5px] border-[#666666] m-6 rounded-lg bg-[#000000]'>
                            <div className="flex justify-center content-center p-3 text-center text-white">
                                <Image
                                    width={320}
                                    height={128}
                                    src={"/images/explore_images/disco_explore_014.jpg"}
                                    alt="icon"
                                    className="rounded-[4px]"
                                />
                            </div>
                        </div>
                        <p className='font-semibold mt-2'>{t('Transfer Tokens')}</p>
                        <p className='text-white/80'> {t('Transfer Description')} </p>
                        <p className='text-white/80'> {t('Transfer Description2')} </p>
                        <div ref={addToRefs} className='border-[0.5px] border-[#666666] m-6 rounded-lg bg-[#000000]'>
                            <div className="flex justify-center content-center p-3 text-center text-white">
                                <Image
                                    width={320}
                                    height={128}
                                    src={"/images/explore_images/disco_explore_015.jpg"}
                                    alt="icon"
                                    className="rounded-[4px]"
                                />
                            </div>
                        </div>
                    </div>
                    <div className='text-white leading-[22px] text-[15px]'>
                        <p className='font-semibold text-main'> {t('Daily Tips')} </p>
                    </div>
                    <div className='text-white leading-[22px] text-[15px]'>
                        <p className='font-semibold'> {t('Participate Daily')} </p>
                        <p className='text-white/80'> {t('Daily Description')} </p>
                        <p className='font-semibold mt-2'> {t('Increase Holdings')} </p>
                        <p className='text-white/80'> {t('Holdings Description')} </p>
                        <p className='font-semibold mt-2'> {t('AI Confidence')} </p>
                        <p className='text-white/80'> {t('Confidence Description')} </p>
                    </div>
                    <div ref={addToRefs} className=''>
                        <Image
                            src="/images/explore3.png"
                            alt="Disco Rave"
                            width={480}
                            height={395}
                            className="rounded-lg "
                        />
                    </div>

                    <div className='text-white leading-[22px] text-[15px]'>
                        <p className='text-white/80 pb-5'> {t('Closing')} </p>
                        <p className='text-white/80'> {t('Final Message')} </p>
                    </div>
                </div>
            </div>
            {/* <div className='w-full'></div> */}
        </div>
    )
}

export default LearnRave;
