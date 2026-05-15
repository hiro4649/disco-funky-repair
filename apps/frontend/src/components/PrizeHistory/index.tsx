'use client';
import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import PrizeHistoryCell from "./PrizeHistoryCell";
import { prizeHistory, PrizeStatus } from "@/types/prizeHistory";
import apiClient from "../../../utils/apiClient";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { setOpenScreen, setDrawLoading, setDrawState, setFailedDraw, setShowIllustration, setDrawSuccess, setShowPrizeImage, setShowBullAnimation } from "@/store/slices/homeSlice";
import PrizeHistoryModal from "./PrizeHistoryModal";
import { useRouter } from "next/navigation";
import moment from "moment";
import { Pagination } from "@nextui-org/react";
import gsap from "gsap";
import Image from "next/image";
import Confetti from "./Confetti";
import PrizeHistoryCellCustom from "./PrizeHistoryCellCustom";
import { useTranslations } from 'next-intl';
import '@/css/animations.css'
import { setPrizeId, setPrizeName, setPrizeSymbol, setPrizeImage, setPrizeAmount, setPrizeExpAmount, setEarnedPts, resetPrize } from "@/store/slices/prizeSlice";
import { useAppKitAccount } from "@reown/appkit/react";
import toast from "react-hot-toast";
const PrizeHistory: React.FC<{ pageSize: number }> = (data) => {
    const [prizeHistoryList, setPrizeHistoryList] = useState<prizeHistory[]>([]);
    const { isConnected } = useAppKitAccount();
    const [updatedPrizeHistoryList, setUpdatedPrizeHistoryList] = useState<prizeHistory[]>([]);
    const { authState, ticket, user_id } = useAppSelector((state) => state.user);
    const [showId, setShowId] = useState<number>();
    const [isOpen, setIsOpen] = useState(false);
    const dispatch = useAppDispatch();
    const router = useRouter();
    const isDrawingRef = useRef(false);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 4;
    const [addClass, setAddClass] = useState<string>('opacity-0 -translate-x-100');
    const [sendStatus, SetSendStatus] = useState<boolean>(false);
    const isSending = useRef(false);
    const [isSelectedId, SetIsSelectedId] = useState<number>();
    const t = useTranslations('PrizeHistory');
    const { drawState } = useAppSelector(state => state.home);

    const [isClient, setIsClient] = useState(false);
    const prizeItemsRef = useRef<(HTMLDivElement | null)[]>([]);
    const { drawSuccess } = useAppSelector(state => state.home);

    function truncateTo(value: number, decimals: number): number {
        const factor = Math.pow(10, decimals);
        return Math.floor(value * factor) / factor;
    }


    useEffect(() => {
        setIsClient(true);
    }, []);

    const getTransaction = useCallback(async () => {
        if (user_id && isConnected) {
            try {
                const res = await apiClient.get(`/airdrop/prize/transactions/${user_id}`);
                const { data, success } = res.data;
                if (success) {
                    setPrizeHistoryList(data);
                    dispatch(resetPrize());
                } else {
                    console.error(data.message);
                }
            } catch (err) {
                console.error('Error fetching transactions:', err);
            }
        }
    }, [user_id, isConnected, dispatch]);

    const sendToWallet = useCallback(async (id: number) => {
        if (user_id && isConnected) {
            if (!isSending.current) {
                isSending.current = true;
                const updatedList = updatedPrizeHistoryList.map((el) => {
                    return {
                        ...el,
                        status: el.id === id ? 'SENDING' : el.status,
                    };
                });
                setUpdatedPrizeHistoryList(updatedList);
                try {
                    const res = await apiClient.post(`/airdrop/prize/send/${id}`);
                    if (res.status === 200) {
                        // Backend returns { success: true } on success; errors return { msg }
                        if (res.data?.success === true) {
                            toast('Sent to wallet successfully',
                                {
                                    style: {
                                        borderRadius: '10px',
                                        background: 'var(--color-secondary)',
                                        color: '#fff',
                                    },
                                }
                            );

                            const updatedList = prizeHistoryList.map((el) => {
                                return {
                                    ...el,
                                    status: el.id === id ? 'RECEIVED' : el.status,
                                    tx_hash: res.data.txHash
                                };
                            });
                            setUpdatedPrizeHistoryList(updatedList);
                        } else if (res.data?.msg) {
                            toast(res.data.msg,
                                {
                                    style: {
                                        borderRadius: '10px',
                                        background: 'var(--color-secondary)',
                                        color: '#fff',
                                    },
                                }
                            );
                            const updatedList = updatedPrizeHistoryList.map((el) => {
                                return {
                                    ...el,
                                    status: el.id === id ? 'READY' : el.status
                                };
                            });
                            setUpdatedPrizeHistoryList(updatedList);
                        }
                    }
                } catch (err: any) {
                    console.error('Error sending to wallet:', err);
                    const apiMsg = err?.response?.data?.msg || err?.response?.data?.message;
                    toast(apiMsg || 'Failed to send to wallet',
                        {
                            style: {
                                borderRadius: '10px',
                                background: 'var(--color-secondary)',
                                color: '#fff',
                            },
                        }
                    );
                    const updatedList = updatedPrizeHistoryList.map((el) => {
                        return {
                            ...el,
                            status: el.id === id ? 'READY' : el.status
                        };
                    });
                    setUpdatedPrizeHistoryList(updatedList);
                } finally {
                    isSending.current = false;
                }
            }
        }
    }, [user_id, prizeHistoryList]);

    useEffect(() => {
        getTransaction();
    }, [getTransaction, dispatch]);

    const onDraw = useCallback(async () => {
        if (user_id && isConnected) {
            try {
                const res = await apiClient.post(`/airdrop/prize/draw/${user_id}`);
                if (res.status === 200) {
                    if (res.data.success) {
                        dispatch(setDrawState(false));
                        dispatch(setShowIllustration(true));
                        setTimeout(() => {
                            dispatch(setDrawLoading(false));
                        }, 1000);
                        await getTransaction();
                    } else if (!res.data.ticket) {
                        dispatch(setFailedDraw(true));
                        router.push('/lottery-ticket');
                    } else {
                        console.error(res.data.msg);
                        router.push("/");
                    }
                }
            } catch (err) {
                console.error('Draw failed:', err);
                dispatch(setDrawState(false));
            }
        } else {
            dispatch(setFailedDraw(true));
        }
    }, [user_id, getTransaction, dispatch, router]);

    // useEffect(() => {
    //     if (drawState && !isDrawingRef.current) {
    //         isDrawingRef.current = true;
    //         onDraw().finally(() => {
    //             isDrawingRef.current = false;
    //         });
    //     }
    // }, [drawState, onDraw]);

    const openModal = (id: number) => {
        setShowId(id);
        setIsOpen(true);
    };

    const isClose = () => {
        setIsOpen(false);
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            const today = moment.utc();
            const updatedList = prizeHistoryList.map((el) => {
                const end_time = moment.utc(el.end_time);
                return {
                    ...el,
                    clickStatus: end_time.isSameOrBefore(today)
                };
            });
            setUpdatedPrizeHistoryList(updatedList);
        }, 1000);

        return () => clearTimeout(timer);
    }, [prizeHistoryList]);

    // useEffect(() => {
    //     if (drawSuccess) {
    //         const timer = setTimeout(() => {
    //             dispatch(setDrawSuccess(false));
    //             dispatch(setShowIllustration(false));
    //             dispatch(setShowPrizeImage(false));
    //             dispatch(setShowBullAnimation(false));
    //             dispatch(setDrawLoading(false));
    //             dispatch(setOpenScreen(false));
    //             dispatch(setFailedDraw(false));
    //             dispatch(setDrawState(false));
    //         }, 8000); // Extended to 8 seconds to allow confetti to complete

    //         return () => clearTimeout(timer);
    //     }
    // }, [drawSuccess, dispatch]);

    useEffect(() => {
        if (drawState && !isDrawingRef.current) {
            dispatch(setDrawState(false));
            dispatch(setDrawLoading(false));
            dispatch(setOpenScreen(true));
            setTimeout(() => {
                dispatch(setOpenScreen(false));
            }, 1000);
        }
    }, [dispatch]);

    // Calculate total pages
    const totalPages = Math.ceil(updatedPrizeHistoryList.length / pageSize);

    // Get the current page data
    const paginatedList = useMemo(() => {
        return updatedPrizeHistoryList.slice(
            (currentPage - 1) * pageSize,
            currentPage * pageSize
        );
    }, [updatedPrizeHistoryList, currentPage, pageSize]);

    // Handle page change
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    useEffect(() => {
        const fadeInLeft = () => {
            const elements = document.querySelectorAll(".prize-fade-in-left");
            const tl = gsap.timeline();
            elements.forEach((element) => {
                const rect = element.getBoundingClientRect();
                if (rect.top <= window.innerHeight - 100) {
                    tl.fromTo(
                        element,
                        { opacity: 0, x: -100, duration: 0.1, ease: "power1.in" },
                        {
                            opacity: 1, x: 0, duration: 0.1, ease: "power1.out", onStart: () => {
                                element.classList.remove("prize-fade-in-left"); // Prevent duplicate animations
                            },
                        },
                        "+=0.2"
                    );
                }
            });
        };

        // Add it as a scroll event listener
        const handleScroll = () => fadeInLeft();
        handleScroll();
        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };

    }, [paginatedList]);

    const noHisotry = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (noHisotry.current) {
            gsap.fromTo(noHisotry.current,
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1.2,
                    delay: 1.7,
                    ease: "power2.out",
                    trigger: noHisotry.current,
                    start: "top 80%",
                    once: true,
                }
            );
        }
    }, []);

    return (
        <>
            <div className={`flex background overflow-hidden ${(!isClient || !user_id || prizeHistoryList.length === 0 || !isConnected) ? "min-h-[400px]" : ""}`}>
                <div className="pt-7 space-y-3 px-3 mx-auto w-[480px] z-10">
                    <div className="flex justify-center items-center px-1.5">
                        <p className="mb-2.5 text-[24px] leading-[28px] text-white normal">
                            {t('Prize History')}
                        </p>
                    </div>


                    {(!isClient || !user_id || prizeHistoryList.length === 0 || !isConnected) && (
                        <div
                            className="flex justify-center items-center h-[170px]"
                            ref={noHisotry}
                        >
                            <div className="flex justify-center items-center h-full">
                                <div>
                                    <div className="flex justify-center"><Image src={'/images/icon/NoHistory48.svg'} width={48} height={48} alt="" /></div>
                                    <p className="text-[16px] font-semibold text-main leading-[30px]"> {t('No history')} </p>
                                </div>
                            </div>
                        </div>
                    )}
                    <div>
                        <p className="text-[13px] text-[hsla(0,0%,100%,.8)]">
                            {t('Description')}
                        </p>
                        {prizeHistoryList.length > 0 && isConnected && (
                            paginatedList.map((item, index) => (
                                <div
                                    key={index}
                                    ref={(el) => {
                                        prizeItemsRef.current[index] = el;
                                    }}
                                    className="my-3"
                                >
                                    <PrizeHistoryCell
                                        item={item}
                                        key={index}
                                        index={index}
                                        openModal={openModal}
                                        addClass={addClass}
                                        onSendToWallet={sendToWallet}
                                    />
                                </div>
                            ))
                        )}
                        {prizeHistoryList.length === 0 && (
                            <div className="my-3">
                                <PrizeHistoryCellCustom
                                    item={{
                                        id: 1,
                                        probability_time: "202X.12.15 11:32:47",
                                        status: "READY",
                                        prize: {
                                            id: 1,
                                            symbol: process.env.NEXT_PUBLIC_APP_NAME,
                                            token_name: `${process.env.NEXT_PUBLIC_APP_NAME} RAVE`,
                                            icon: "/images/logo/logo.png",
                                            quantity: 10000,
                                            ca: "string",
                                            telegram: "string",
                                            twitter: "string",
                                            default_image: "/images/logo/logo.png",
                                        },
                                        end_time: "",
                                        clickStatus: false,
                                    }}
                                    openModal={openModal}
                                    addClass={addClass}
                                // onSendToWallet={sendToWallet}
                                />
                            </div>
                        )}

                    </div>
                    <div className="flex justify-center pt-[15px]">
                        {totalPages > 1 ? <Pagination
                            total={totalPages}
                            initialPage={1}
                            page={currentPage}
                            onChange={handlePageChange}
                            color="secondary"
                        /> : <></>}
                    </div>
                </div>

                <PrizeHistoryModal isOpen={isOpen} onClose={isClose} prizes={prizeHistoryList} showId={showId} />
                {drawSuccess && <Confetti />}
            </div>

        </>
    );
};

export default PrizeHistory;
