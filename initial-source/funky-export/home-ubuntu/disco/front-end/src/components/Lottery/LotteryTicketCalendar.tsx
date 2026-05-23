import React, { useCallback, useEffect, useState } from "react";
import { Heart, SendHorizontal, Ticket } from "lucide-react";
import { useAppSelector } from "@/store/store";
import DayList from "./dayList";
import apiClient from "../../../utils/apiClient";
import { lotteryDate } from "@/types/lotteryDate";
import moment from "moment";
import { useAppKitAccount } from "@reown/appkit/react";
import Image from "next/image";
import { useTranslations } from 'next-intl';

interface Day {
  date: string;
  dayOfWeek: string;
  value: string;
}

const LotteryTicketCalendar = (props: {
  waitBalance: number;
  totalBalance: number;
  weeklyBalance: number;
  tallyProgress?: number;
  loading?: boolean;
}) => {
  const { authState, user_id, tallyTokenBalance, claimTickets } = useAppSelector((state) => state.user);
  const [days, setDays] = useState<Day[]>([]);
  const [newDays, setNewDays] = useState<Day[]>([]);
  const [tokenBalance, setTokenBalance] = useState<number>(10000);
  const [localTallyProgress, setLocalTallyProgress] = useState<number>(0);
  const { isConnected } = useAppKitAccount();
  const t = useTranslations('LotteryTicket');

  let weeklyTicket: number;

  // Calculate which days have claimable tickets
  const getClaimableStatus = (dayIndex: number, daysArray: Day[]) => {
    let accumulatedTickets = 0;
    // const claimTickets = claimTickets; // Total tickets available to claim

    for (let i = 0; i < daysArray.length; i++) {
      const ticketCount = parseInt(daysArray[i].value) || 0;

      if (i === dayIndex) {
        // Check if this day's tickets are within the claimable range
        return accumulatedTickets < claimTickets;
      }

      accumulatedTickets += ticketCount;
    }

    return false;
  };

  // Check if today is Monday in UTC time zone
  // const isMonday = moment.utc().day() === 1;

  // If tallyProgress is provided, use it; otherwise use local state
  useEffect(() => {
    if (props.tallyProgress !== undefined) {
      setLocalTallyProgress(props.tallyProgress);
    }
  }, [props.tallyProgress]);

  useEffect(() => {
    const getDiscoTokenBalance = async () => {
      try {
        const res = await apiClient.get(`/admin/seting/tokenbalance`);
        if (res.status === 200) {
          if (res.data.success) {
            const data = res.data.data;
            setTokenBalance(data.balance);
          }
        }
      } catch (e) {
        console.error('Error fetching token balance:', e);
      }
    };
    getDiscoTokenBalance();
  }, []);

  const getUserLotteryTicketDate = useCallback(async () => {
    if (user_id && isConnected) {
      try {
        const response = await apiClient.get(
          `/lottery/ticket/date/${user_id}`,
        );

        if (response.status === 200) {
          const { data } = response.data;
          days.forEach((day) => {
            const matchingEntry = data.find(
              (entry: { receivedDate: moment.MomentInput }) =>
                moment(entry.receivedDate).format("MM/DD") === day.date,
            );
            if (matchingEntry) {
              day.value = matchingEntry.ticket.toString();
            }
          });
          setNewDays(days);
        }
      } catch (e) {
        console.error('Error fetching lottery ticket date:', e);
      }
    }
  }, [user_id, isConnected, days]);

  useEffect(() => {
    const today = moment.utc();
    const generatedDays: Day[] = Array.from({ length: 7 }, (_, i) => {
      const day = today.clone().subtract(i, "days");
      return {
        date: day.format("MM/DD"),
        dayOfWeek: day.format("ddd").toUpperCase(),
        value: authState ? "0" : "--", // Default value when user logined
      };
    });
    setDays(generatedDays); // Initialize days state
  }, [authState]);

  useEffect(() => {
    getUserLotteryTicketDate(); // Fetch lottery data and update days
  }, [getUserLotteryTicketDate]);

  useEffect(() => {
    if (Number(localTallyProgress.toFixed(0)) === 100) {
      getUserLotteryTicketDate();
    }
  }, [localTallyProgress, getUserLotteryTicketDate]);

  return (
    <div className="bg-secondary px-3.5 py-5 pt-0 text-white">
      {/* <p className="text-[15px] font-normal leading-[15.73px]">
        {t('TodayGift')}
      </p> */}
      <div className="flex items-center justify-between">
        <div className="w-full rounded-lg bg-black p-2 text-center">
          <p className="text-center text-[11px] text-white">
            {t(`Hold ${process.env.NEXT_PUBLIC_APP_NAME} Tokens → Get 1 Ticket`)}
          </p>
          <div className="10000 inline-flex items-center justify-center gap-x-2 text-center">
            <Image
              className="mb-[-4px] rounded-full"
              src={`/images/logo/funky_trans_150_s.png`}
              alt="icon"
              height={18}
              width={18}
            />
            <div className="flex items-center gap-x-[5px]">
              <span className="text-[20px] font-medium text-main mb-[-4px]">
                {tokenBalance.toLocaleString()}
              </span>
              <span className="text-[15px] heading-[18px] text-white mb-[-4px]">{process.env.NEXT_PUBLIC_APP_NAME}</span>
            </div>
            <span className="text-[15px] heading-[18px]">
              <Image
                className="mb-[-4px] rounded-full"
                src={`/images/logo/chain-logo.svg`}
                alt="icon"
                height={16}
                width={16}
              />
            </span>
          </div>
          <div className="absolute right-[-30px] top-0 h-0 w-0 border-b-[37px] border-l-[30px] border-t-[33px] border-y-transparent border-l-black"></div>
        </div>
      </div>
      <div className="flex flex-col gap-y-1.5 pt-3">
        {newDays.length > 0 ? (
          <>
            {/* Today's information - full width */}
            {newDays[0] && (
              <DayList
                receivedDate={newDays[0].date}
                dayOfWeek={newDays[0].dayOfWeek}
                tickets={newDays[0].value}
                isClaimable={getClaimableStatus(0, newDays)}
              />
            )}
            {/* Remaining 6 days in two columns */}
            <div className="flex flex-row justify-between gap-x-1.5">
              <div className="flex w-2/4 flex-col gap-y-1.5">
                {newDays.slice(1, 4).map((day, index) => (
                  <DayList
                    key={index}
                    receivedDate={day.date}
                    dayOfWeek={day.dayOfWeek}
                    tickets={day.value}
                    isClaimable={getClaimableStatus(index + 1, newDays)}
                  />
                ))}
              </div>
              <div className="flex w-2/4 flex-col gap-y-1.5">
                {newDays.slice(4, 7).map((day, index) => (
                  <DayList
                    key={index}
                    receivedDate={day.date}
                    dayOfWeek={day.dayOfWeek}
                    tickets={day.value}
                    isClaimable={getClaimableStatus(index + 4, newDays)}
                  />
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Today's information - full width */}
            {days[0] && (
              <DayList
                receivedDate={days[0].date}
                dayOfWeek={days[0].dayOfWeek}
                tickets={days[0].value}
                isClaimable={getClaimableStatus(0, days)}
              />
            )}
            {/* Remaining 6 days in two columns */}
            <div className="flex flex-row justify-between gap-x-1.5">
              <div className="flex w-2/4 flex-col gap-y-1.5">
                {days.slice(1, 4).map((day, index) => (
                  <DayList
                    key={index}
                    receivedDate={day.date}
                    dayOfWeek={day.dayOfWeek}
                    tickets={day.value}
                    isClaimable={getClaimableStatus(index + 1, days)}
                  />
                ))}
              </div>
              <div className="flex w-2/4 flex-col gap-y-1.5">
                {days.slice(4, 7).map((day, index) => (
                  <DayList
                    key={index}
                    receivedDate={day.date}
                    dayOfWeek={day.dayOfWeek}
                    tickets={day.value}
                    isClaimable={getClaimableStatus(index + 4, days)}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LotteryTicketCalendar;
