"use client";
import React from "react";
import moment from "moment";
import Image from "next/image";
import { prizeHistory, PrizeStatus } from "@/types/prizeHistory";
import { SendHorizontal, ChevronRight } from "lucide-react";

const PrizeTransactionCell: React.FC<any> = (data: {
  item: prizeHistory;
  index: number;
}) => {
  const { item, index } = data;
  const isoDate = item.probability_time;
  const date = moment.utc(isoDate);

  // Extract the year, month, day, hours, minutes, and seconds
  const year = date.year();
  const month = String(date.month() + 1).padStart(2, "0");
  const day = String(date.date()).padStart(2, "0");
  const hours = String(date.hours()).padStart(2, "0");
  const minutes = String(date.minutes()).padStart(2, "0");
  const seconds = String(date.seconds()).padStart(2, "0");

  // Format the date
  const formattedDate = `${year}.${month}.${day} ${hours}:${minutes}:${seconds}`;

  return (
    <>
      <div
        key={index}
        className="rounded-[8px] bg-white px-[18px] py-3 shadow-1 dark:bg-secondary"
      >
        <div className="flex justify-between font-medium text-black ">
          <div className="flex items-center text-2xl gap-x-2">
            <p>{item.prize.symbol}</p>
             <p>({item.prize.token_name})</p>
          </div>
          <p className="text-xs">{formattedDate}</p>
        </div>
        <div className="mt-2.5 flex items-center justify-between">
          <span>{item.prize.ca}</span>
          <span className={`text-base font-normal text-black`}>
            {item.prize.quantity}
          </span>
        </div>
      </div>
    </>
  );
};

export default PrizeTransactionCell;
