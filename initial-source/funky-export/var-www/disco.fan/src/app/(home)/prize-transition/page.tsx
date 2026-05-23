"use client";
import PrizeTransitionModal from '@/components/PrizeTransitionModal/PrizeTransitionModal';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { setDrawLoading, setOpenScreen, setShowIllustration } from '@/store/slices/homeSlice';
import { useEffect } from 'react';
import DefaultLayout from '@/components/Layouts/DefaultLayout';

const PrizeTransitionPage = () => {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { drawState } = useAppSelector((state) => state.home);

    const handleTransitionComplete = () => {
        dispatch(setShowIllustration(true));
        router.push('/bull-animation');
    };

    useEffect(() => {
        if (drawState) {
            dispatch(setOpenScreen(true));
            setTimeout(() => {
                dispatch(setDrawLoading(false));
                dispatch(setOpenScreen(false));
            }, 1000);
        }
    }, [drawState]);

    return (
        <DefaultLayout>
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
                <PrizeTransitionModal
                    onTransitionComplete={handleTransitionComplete}
                />
            </div>
        </DefaultLayout>
    );
};

export default PrizeTransitionPage; 