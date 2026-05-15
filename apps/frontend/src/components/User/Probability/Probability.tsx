import React from "react";
import Image from "next/image";

const Probability = (props: {
    imgURL?: String,
    title?: String,
    quantity?: String,
    className?: String
}) => {
    const { imgURL, title, quantity, className } = props;
    return (
        <>
            <div className={`flex items-center bg-black rounded-lg justify-between py-[9px] px-4 ${className}`}>
                <div className='flex items-center gap-x-2.5'>
                    <Image width={22} height={22} alt="lucky" src={`${imgURL}`} />
                    <p className='text-white font-normal leading-[19.36px]'>{title}</p>
                </div>
                <p className='font-normal leading-[19.36.px] text-[#FFCC00]'>{quantity}</p>
            </div>

        </>
    )
}
export default Probability;