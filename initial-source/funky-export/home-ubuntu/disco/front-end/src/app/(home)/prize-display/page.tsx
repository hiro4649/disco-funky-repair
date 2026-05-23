"use client";
import Particleground from '@/components/Particleground';
import PrizeItemModal from '@/components/PrizeItemModal/PrizeItemModal';
import StarAnimation from '@/components/StarAnimation/StarAnimation';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { setDrawLoading, setDrawState, setOpenScreen, setShowBullAnimation, setShowIllustration, setShowPrizeImage } from '@/store/slices/homeSlice';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useTranslations } from 'next-intl';


const PrizeDisplayPage = () => {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { prize_image, prize_symbol, prize_name, prize_exp_amount, earnedPts } = useAppSelector((state) => state.prize);
    const openScreen = useAppSelector((state) => state.home.openScreen);
    const showIllustration = useAppSelector((state) => state.home.showIllustration);
    const drawLoading = useAppSelector((state) => state.home.drawLoading);
    const t_drawing = useTranslations('drawing');
    const handleClose = () => {
        router.push('/prize-history');
        dispatch(setDrawLoading(false));
    };
    useEffect(() => {
        if (showIllustration) {
            dispatch(setDrawLoading(false));
            dispatch(setOpenScreen(false));
        }
    }, [showIllustration]);

    return (
        <div className={`${openScreen == true ? "loaded" : ""}`}>
            <div className="h-[100dvh] bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500">
                <StarAnimation />
                <Particleground />
                <PrizeItemModal
                    iconUrl={prize_image || "/images/logo/chain-logo.svg"}
                    tokenSymbol={prize_symbol || "BNB"}
                    tokenName={prize_name || "BNB Chain"}
                    expAmount={prize_exp_amount || 1}
                    earnedPts={earnedPts || 1}
                    onClose={handleClose}
                />
            </div>
            {drawLoading && (
                <>
                    <div id="loading-wrapper">
                        <div id="loading-text">{t_drawing('drawing')}</div>
                        <div id="loading-content"></div>
                        <div className="loader-section section-left"></div>
                        <div className="loader-section section-right"></div>
                        <div
                            className="sticky top-[55%] z-[1001]  px-[30px] text-center"
                            id="con-text"
                        >
                            <p className="text-white">
                                {t_drawing('Description')}
                            </p>
                        </div>
                    </div>
                </>
                // will be add lottery illustration here
            )}
        </div>
    );
};

export default PrizeDisplayPage; 