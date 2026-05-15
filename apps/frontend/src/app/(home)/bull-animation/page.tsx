"use client";
import BullAnimation from '@/components/BullAnimation';
import StarAnimation from '@/components/StarAnimation/StarAnimation';

const BullAnimationPage = () => {
    return (
        <div className="min-h-screen bg-black">
            <StarAnimation />
            <BullAnimation />
        </div>
    );
};

export default BullAnimationPage; 