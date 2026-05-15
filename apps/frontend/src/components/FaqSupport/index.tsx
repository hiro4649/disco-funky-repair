'use client';
import Image from "next/image";
import React, { useEffect, useRef } from 'react';
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslations } from 'next-intl';
import { Weight } from "lucide-react";

const FaqSupport = () => {
    const t = useTranslations('FAQ');

    useEffect(() => {
        const items = document.querySelectorAll<HTMLButtonElement>(".accordion button");

        function toggleAccordion(this: HTMLButtonElement) {
            const itemToggle = this.getAttribute("aria-expanded");
            items.forEach((item) => {
                if (item !== this) {
                    item.setAttribute("aria-expanded", "false");
                }
            });
            if (itemToggle === "false") {
                this.setAttribute("aria-expanded", "true");
            } else {
                this.setAttribute("aria-expanded", "false");
            }
        }
        items.forEach((item) => item.addEventListener("click", toggleAccordion));
        return () => {
            items.forEach((item) => item.removeEventListener("click", toggleAccordion));
        };
    }, []);

    const imageRefs = useRef<HTMLDivElement[]>([]);

    useEffect(() => {
        imageRefs.current.forEach((img) => {
            if (img) {
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
            }
        });
    }, []);

    const addToRefs = (el: HTMLDivElement | null) => {
        if (el && !imageRefs.current.includes(el)) {
            imageRefs.current.push(el);
        }
    };

    return (
        <>
            <div className="stars"></div>
            <div className="stars"></div>
            <div className="stars1"></div>
            <div className="stars1"></div>
            <div className="stars2"></div>
            <div className="mx-auto max-w-[480px] flex">
                <div className="pt-7 space-y-3 px-3 z-10">
                    <div className="flex justify-center">
                        <p className="mb-2.5 text-[24px] leading-[28px] text-white normal">
                            FAQ
                        </p>
                    </div>
                    <div className="accordion font-normal">
                        <div className="accordion-item">
                            <button id="accordion-button-1" aria-expanded="false">
                                <span className="accordion-title font-normal text-[15px] leading-[22px]">{t('How to hold')}</span>
                                <span className="icon" aria-hidden="true"></span>
                            </button>
                            <div className="accordion-content overflow-visible">
                                <p style={{ fontWeight: 300, fontSize: '15px', lineHeight: '22px' }}>{t('Hold Answer')}</p>
                            </div>
                        </div>

                        <div className="accordion-item">
                            <button id="accordion-button-1" aria-expanded="false">
                                <span className="accordion-title font-normal text-[15px] leading-[22px]">{t('What are Fan Points')}</span>
                                <span className="icon" aria-hidden="true"></span>
                            </button>
                            <div className="accordion-content overflow-visible">
                                <p style={{ fontWeight: 300, fontSize: '15px', lineHeight: '22px' }}>{t('Fan Points Answer')}</p>
                            </div>
                        </div>

                        <div className="accordion-item">
                            <button id="accordion-button-1" aria-expanded="false">
                                <span className="accordion-title font-normal text-[15px] leading-[22px]">{t('How to earn')}</span>
                                <span className="icon" aria-hidden="true"></span>
                            </button>
                            <div className="accordion-content overflow-visible">
                                <p style={{ fontWeight: 300, fontSize: '15px', lineHeight: '22px' }}>{t('Earn Answer')}</p>
                            </div>
                        </div>

                        <div className="accordion-item">
                            <button id="accordion-button-1" aria-expanded="false">
                                <span className="accordion-title font-normal text-[15px] leading-[22px]">{t('Points determination')}</span>
                                <span className="icon" aria-hidden="true"></span>
                            </button>
                            <div className="accordion-content overflow-visible">
                                <p style={{ fontWeight: 300, fontSize: '15px', lineHeight: '22px' }}>{t('Points Answer')}</p>
                            </div>
                        </div>

                        <div className="accordion-item">
                            <button id="accordion-button-1" aria-expanded="false">
                                <span className="accordion-title font-normal text-[15px] leading-[22px]">{t('Points usage')}</span>
                                <span className="icon" aria-hidden="true"></span>
                            </button>
                            <div className="accordion-content overflow-visible">
                                <p style={{ fontWeight: 300, fontSize: '15px', lineHeight: '22px' }}>{t('Usage Answer')}</p>
                            </div>
                        </div>

                        <div className="accordion-item">
                            <button id="accordion-button-1" aria-expanded="false">
                                <span className="accordion-title font-normal text-[15px] leading-[22px]">{t('Points expiration')}</span>
                                <span className="icon" aria-hidden="true"></span>
                            </button>
                            <div className="accordion-content overflow-visible">
                                <p style={{ fontWeight: 300, fontSize: '15px', lineHeight: '22px' }}>{t('Expiration Answer')}</p>
                            </div>
                        </div>

                        <div className="accordion-item">
                            <button id="accordion-button-2" aria-expanded="false">
                                <span className="accordion-title font-normal text-[15px] leading-[22px]">{t('Token spending')}</span>
                                <span className="icon" aria-hidden="true"></span>
                            </button>
                            <div className="accordion-content overflow-visible">
                                <p style={{ fontWeight: 300, fontSize: '15px', lineHeight: '22px' }}>{t('Spending Answer')}</p>
                            </div>
                        </div>

                        <div className="accordion-item">
                            <button id="accordion-button-3" aria-expanded="false">
                                <span className="accordion-title font-normal text-[15px] leading-[22px]">{t('Prize types')}</span>
                                <span className="icon" aria-hidden="true"></span>
                            </button>
                            <div className="accordion-content overflow-visible">
                                <p style={{ fontWeight: 300, fontSize: '15px', lineHeight: '22px' }}>{t('Prize Answer')}</p>
                            </div>
                        </div>

                        <div className="accordion-item">
                            <button id="accordion-button-4" aria-expanded="false">
                                <span className="accordion-title font-normal text-[15px] leading-[22px]">{t('Losing entries')}</span>
                                <span className="icon" aria-hidden="true"></span>
                            </button>
                            <div className="accordion-content overflow-visible">
                                <p style={{ fontWeight: 300, fontSize: '15px', lineHeight: '22px' }}>{t('Losing Answer')}</p>
                            </div>
                        </div>

                        <div className="accordion-item">
                            <button id="accordion-button-5" aria-expanded="false">
                                <span className="accordion-title font-normal text-[15px] leading-[22px]">{t('Multiple tickets')}</span>
                                <span className="icon" aria-hidden="true"></span>
                            </button>
                            <div className="accordion-content overflow-visible">
                                <p style={{ fontWeight: 300, fontSize: '15px', lineHeight: '22px' }}>{t('Tickets Answer')}</p>
                            </div>
                        </div>

                        <div className="accordion-item">
                            <button id="accordion-button-6" aria-expanded="false">
                                <span className="accordion-title font-normal text-[15px] leading-[22px]">{t('Check results')}</span>
                                <span className="icon" aria-hidden="true"></span>
                            </button>
                            <div className="accordion-content overflow-visible">
                                <p style={{ fontWeight: 300, fontSize: '15px', lineHeight: '22px' }}>{t('Results Answer')}</p>
                            </div>
                        </div>

                        <div className="accordion-item">
                            <button id="accordion-button-7" aria-expanded="false">
                                <span className="accordion-title font-normal text-[15px] leading-[22px]">{t('Ticket validity')}</span>
                                <span className="icon" aria-hidden="true"></span>
                            </button>
                            <div className="accordion-content overflow-visible">
                                <p style={{ fontWeight: 300, fontSize: '15px', lineHeight: '22px' }}>{t('Validity Answer')}</p>
                            </div>
                        </div>

                        <div className="accordion-item">
                            <button id="accordion-button-8" aria-expanded="false">
                                <span className="accordion-title font-normal text-[15px] leading-[22px]">{t('Unused tickets')}</span>
                                <span className="icon" aria-hidden="true"></span>
                            </button>
                            <div className="accordion-content overflow-visible">
                                <p style={{ fontWeight: 300, fontSize: '15px', lineHeight: '22px' }}>{t('Unused Answer')}</p>
                            </div>
                        </div>

                        <div className="accordion-item">
                            <button id="accordion-button-9" aria-expanded="false">
                                <span className="accordion-title font-normal text-[15px] leading-[22px]">{t('Prize location')}</span>
                                <span className="icon" aria-hidden="true"></span>
                            </button>
                            <div className="accordion-content overflow-visible">
                                <p style={{ fontWeight: 300, fontSize: '15px', lineHeight: '22px' }}>{t('Location Answer')}</p>
                            </div>
                        </div>

                        <div className="accordion-item">
                            <button id="accordion-button-10" aria-expanded="false">
                                <span className="accordion-title font-normal text-[15px] leading-[22px]">{t('Purchase tokens')}</span>
                                <span className="icon" aria-hidden="true"></span>
                            </button>
                            <div className="accordion-content overflow-visible">
                                <p style={{ fontWeight: 300, fontSize: '15px', lineHeight: '22px' }}>{t('Purchase Answer')}</p>
                            </div>
                        </div>

                        <div className="accordion-item">
                            <button id="accordion-button-11" aria-expanded="false">
                                <span className="accordion-title font-normal text-[15px] leading-[22px]">{t('Service fees')}</span>
                                <span className="icon" aria-hidden="true"></span>
                            </button>
                            <div className="accordion-content overflow-visible">
                                <p style={{ fontWeight: 300, fontSize: '15px', lineHeight: '22px' }}>{t('Fees Answer')}</p>
                            </div>
                        </div>

                        <div className="accordion-item">
                            <button id="accordion-button-12" aria-expanded="false">
                                <span className="accordion-title font-normal text-[15px] leading-[22px]">{t('Token deposit')}</span>
                                <span className="icon" aria-hidden="true"></span>
                            </button>
                            <div className="accordion-content overflow-visible">
                                <p style={{ fontWeight: 300, fontSize: '15px', lineHeight: '22px' }}>{t('Deposit Answer')}</p>
                            </div>
                        </div>

                        <div className="accordion-item">
                            <button id="accordion-button-13" aria-expanded="false">
                                <span className="accordion-title font-normal text-[15px] leading-[22px]">{t('Token verification')}</span>
                                <span className="icon" aria-hidden="true"></span>
                            </button>
                            <div className="accordion-content overflow-visible">
                                <p style={{ fontWeight: 300, fontSize: '15px', lineHeight: '22px' }}>{t('Verification Answer')}</p>
                            </div>
                        </div>

                        <div className="accordion-item">
                            <button id="accordion-button-14" aria-expanded="false">
                                <span className="accordion-title font-normal text-[15px] leading-[22px]">{t('Ticket distribution')}</span>
                                <span className="icon" aria-hidden="true"></span>
                            </button>
                            <div className="accordion-content overflow-visible">
                                <p style={{ fontWeight: 300, fontSize: '15px', lineHeight: '22px' }}>{t('Distribution Answer')}</p>
                            </div>
                        </div>

                        <div className="accordion-item">
                            <button id="accordion-button-15" aria-expanded="false">
                                <span className="accordion-title font-normal text-[15px] leading-[22px]">{t('Holding conditions')}</span>
                                <span className="icon" aria-hidden="true"></span>
                            </button>
                            <div className="accordion-content overflow-visible">
                                <p style={{ fontWeight: 300, fontSize: '15px', lineHeight: '22px' }}>{t('Conditions Answer')}</p>
                            </div>
                        </div>

                        <div className="accordion-item">
                            <button id="accordion-button-16" aria-expanded="false">
                                <span className="accordion-title font-normal text-[15px] leading-[22px]">{t('Unconnected wallets')}</span>
                                <span className="icon" aria-hidden="true"></span>
                            </button>
                            <div className="accordion-content overflow-visible">
                                <p style={{ fontWeight: 300, fontSize: '15px', lineHeight: '22px' }}>{t('Unconnected Answer')}</p>
                            </div>
                        </div>

                        <div className="accordion-item">
                            <button id="accordion-button-17" aria-expanded="false">
                                <span className="accordion-title font-normal text-[15px] leading-[22px]">{t('Connection cost')}</span>
                                <span className="icon" aria-hidden="true"></span>
                            </button>
                            <div className="accordion-content overflow-visible">
                                <p style={{ fontWeight: 300, fontSize: '15px', lineHeight: '22px' }}>{t('Connection Answer')}</p>
                            </div>
                        </div>

                        <div className="accordion-item">
                            <button id="accordion-button-18" aria-expanded="false">
                                <span className="accordion-title font-normal text-[15px] leading-[22px]">{t('Token selling')}</span>
                                <span className="icon" aria-hidden="true"></span>
                            </button>
                            <div className="accordion-content overflow-visible">
                                <p style={{ fontWeight: 300, fontSize: '15px', lineHeight: '22px' }}>{t('Selling Answer')}</p>
                            </div>
                        </div>

                        <div className="accordion-item">
                            <button id="accordion-button-19" aria-expanded="false">
                                <span className="accordion-title font-normal text-[15px] leading-[22px]">{t('Lottery process')}</span>
                                <span className="icon" aria-hidden="true"></span>
                            </button>
                            <div className="accordion-content overflow-visible">
                                <p style={{ fontWeight: 300, fontSize: '15px', lineHeight: '22px' }}>{t('Process Answer')}</p>
                            </div>
                        </div>

                        <div className="accordion-item">
                            <button id="accordion-button-20" aria-expanded="false">
                                <span className="accordion-title font-normal text-[15px] leading-[22px]">{t('Token loss')}</span>
                                <span className="icon" aria-hidden="true"></span>
                            </button>
                            <div className="accordion-content overflow-visible">
                                <p style={{ fontWeight: 300, fontSize: '15px', lineHeight: '22px' }}>{t('Loss Answer')}</p>
                            </div>
                        </div>

                        <div className="accordion-item">
                            <button id="accordion-button-21" aria-expanded="false">
                                <span className="accordion-title font-normal text-[15px] leading-[22px]">{t('Token display')}</span>
                                <span className="icon" aria-hidden="true"></span>
                            </button>
                            <div className="accordion-content overflow-visible">
                                <p style={{ fontWeight: 300, fontSize: '15px', lineHeight: '22px' }}>{t('Display Answer')}</p>
                            </div>
                        </div>

                        <div className="accordion-item">
                            <button id="accordion-button-22" aria-expanded="false">
                                <span className="accordion-title font-normal text-[15px] leading-[22px]">{t('Network')}</span>
                                <span className="icon" aria-hidden="true"></span>
                            </button>
                            <div className="accordion-content overflow-visible">
                                <p style={{ fontWeight: 300, fontSize: '15px', lineHeight: '22px' }}>{t('Network Answer')}</p>
                            </div>
                        </div>
                        <div className="accordion-item">
                            <button id="accordion-button-23" aria-expanded="false">
                                <span className="accordion-title font-normal text-[15px] leading-[22px]">{t('Prize amount')}</span>
                                <span className="icon" aria-hidden="true"></span>
                            </button>
                            <div className="accordion-content overflow-visible">
                                <p style={{ fontWeight: 300, fontSize: '15px', lineHeight: '22px' }}>{t('Amount Answer')}</p>
                            </div>
                        </div>
                        <div className="accordion-item">
                            <button id="accordion-button-23" aria-expanded="false">
                                <span className="accordion-title font-normal text-[15px] leading-[22px]">{t('Gas fees')}</span>
                                <span className="icon" aria-hidden="true"></span>
                            </button>
                            <div className="accordion-content overflow-visible">
                                <p style={{ fontWeight: 300, fontSize: '15px', lineHeight: '22px' }}>{t('Gas Answer')}</p>
                            </div>
                        </div><br />
                    </div>
                    <div ref={addToRefs} className='pt-3'>
                        <Image
                            src="/images/faq1.png"
                            alt="Disco Rave"
                            width={447}
                            height={334.05}
                            className="airdrop-fade-in"
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

export default FaqSupport;