import React from "react";
import { chram } from "@/types/chram";
import Image from "next/image";

const ChramItem = (data: {item: chram}) => {
    const item = data.item;
    return (
        <div key={item.index} className="px-2.5 pt-1.5 pb-[13px] border rounded-lg border-[#E7E0EC] bg-[#FFEFB680]">
            <p className="text-center text-sm font-medium leading-5 text-black">{item.name}</p>
            <div className="flex justify-center items-center mt-0.5"><Image width={90} height={90} src={item.imgURL ?? ""} alt="icon" /></div>
            <div className="bg-white rounded-lg mt-[7px]"><p className="text-sm font-medium text-black leading-5 text-center">{item.amount}</p></div>
        </div>
    )
}
export default ChramItem;