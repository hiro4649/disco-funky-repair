import React from "react";

const Ability = (props: {
    Icon?: React.ReactElement,
    title?: String,
    quantity?: String,
    className?: String,
}) => {
    const { Icon, title, quantity, className } = props;
    return (
        <>
            <div className={`flex items-center justify-between bg-black rounded-lg py-[9px] px-[17px] ${className}`}>
                <div className='flex items-center gap-x-2.5'>
                    {Icon}
                    <p className='text-white font-normal leading-[19.36px]'>{title}</p>
                </div>
                <p className='font-normal leading-[19.36.px] text-[#FFCC00]'>{quantity}</p>
            </div>
        </>
    )
}
export default Ability;