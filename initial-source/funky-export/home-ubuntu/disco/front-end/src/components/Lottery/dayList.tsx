import React from "react";

const DayList = (props: {
  receivedDate: string;
  tickets: string;
  dayOfWeek: string;
  isClaimable?: boolean;
}) => {
  // const date = moment(props.receivedDate).tz("GMT");
  // const day = date.format("MM/DD");
  // const dayOfWeek = date.format("(ddd)");
  const ticketColor = props.isClaimable ? "text-[#FFFF33]" : "text-[#CCCCCC]";

  return (
    <div className="flex justify-between items-center rounded-[4px] bg-black px-3.5 py-2">
      <p className="gap-x-2 text-[14px] text-white">
        {props.receivedDate} <span className="text-[12px] text-white/45">({props.dayOfWeek})</span>
      </p>
      <p className={`${ticketColor} text-sm`}>{props.tickets}</p>
    </div>
  );
};

export default DayList;
