import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Heart, SendHorizontal, Ticket } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/store";
import DayList from "./dayList";
import apiClient from "../../../utils/apiClient";
import { lotteryDate } from "@/types/lotteryDate";
import moment from "moment-timezone";
import { useWallet } from "@suiet/wallet-kit";
import Image from "next/image";
import { useTranslations } from 'next-intl';

interface Day {
  date: string;
  dayOfWeek: string;
  value: string;
}

const LotteryTicketCalendar = (props: {
  totalBalance: number;
  weeklyBalance: number;
  tallyProgress?: number;
}) => {
  const [lotteryTicketDate, setLotteryTicketDate] = useState<lotteryDate[]>([]);
  const { authState, user_id } = useAppSelector((state) => state.user);
  const [days, setDays] = useState<Day[]>([]);
  const [newDays, setNewDays] = useState<Day[]>([]);
  const [tokenBalance, setTokenBalance] = useState<Number>(10000);
  const [localTallyProgress, setLocalTallyProgress] = useState<number>(0);
  const wallet = useWallet();
  const t = useTranslations('LotteryTicket');

  let lotteryTicket: number;
  let weeklyTicket: number;
  let distributionTicket: number;
  
  // Check if today is Monday in UTC time zone
  const isMonday = new Date().getUTCDay() === 1;
  
  if (authState) {
    lotteryTicket = props.totalBalance;
    weeklyTicket = props.weeklyBalance;
    
    // Calculate distributionTicket based on day of week
    if (isMonday) {
      distributionTicket = props.totalBalance + props.weeklyBalance;
    } else {
      distributionTicket = props.totalBalance;
    }
  } else {
    lotteryTicket = 0;
    weeklyTicket = 0;
    distributionTicket = 0;
  }

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
    if (user_id && wallet.adapter?.accounts) {
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
  }, [user_id, wallet.adapter?.accounts, days]);

  useEffect(() => {
    const today = moment();
    const generatedDays: Day[] = Array.from({ length: 14 }, (_, i) => {
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
    <div className="bg-[#1D1B20] px-3.5 py-5 text-white">
      <p className="text-[15px] font-normal leading-[15.73px]">
        {t('TodayGift')}
      </p>
      <div className="mt-[0.9rem] flex items-center justify-between">
        <div className="relative w-3/5 rounded-l-lg bg-black p-2 text-center">
          <p className="text-center text-[11px] text-white">
            {t('Hold DISCO Tokens → Get 1 Ticket')}
          </p>
          <p className="10000 inline-flex items-center justify-center gap-x-2 text-center">
            <span className="text-[20px] font-semibold text-[#00FFCC]">
              {tokenBalance.toLocaleString()}
            </span>
            <span className="text-[15px] heading-[18px] text-white mb-[-4px]">DISCO</span>
            <span className="text-[15px] heading-[18px]">
              <Image
                className="mb-[-4px] rounded-full"
                src={`/images/logo/sui-logo.png`}
                alt="icon"
                height={12}
                width={12}
              />
            </span>
          </p>
          <div className="absolute right-[-30px] top-0 h-0 w-0 border-b-[37px] border-l-[30px] border-t-[33px] border-y-transparent border-l-black"></div>
        </div>
        <div className="w-[90px] rounded-lg border-[0.5px] border-[#333333] bg-black px-[10px] py-[8px]">
          <p className="10000 text-center text-[11px] text-white">
            {t('Next Tickets')}
          </p>
          <div className="flex items-center justify-between gap-x-2">
            <Heart width={16} height={16} />
            {/* <p className="text-sm text-[#FFFF33]">{lotteryTicket}</p> */}
            <p className="text-[1.1rem] text-[#FFFF33]">
              {authState
                ? Math.floor(distributionTicket / Number(tokenBalance))
                : "--"}
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-row justify-between gap-x-1.5 pt-3">
        {newDays.length > 0 ? (
          <>
            <div className="flex w-2/4 flex-col gap-y-1.5">
              {newDays.slice(0, 7).map((day, index) => (
                <DayList
                  key={index}
                  receivedDate={day.date}
                  dayOfWeek={day.dayOfWeek}
                  tickets={day.value}
                />
              ))}
            </div>
            <div className="flex w-2/4 flex-col gap-y-1.5">
              {newDays.slice(7, newDays.length).map((day, index) => (
                <DayList
                  key={index}
                  receivedDate={day.date}
                  dayOfWeek={day.dayOfWeek}
                  tickets={day.value}
                />
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="flex w-2/4 flex-col gap-y-1.5">
              {days.slice(0, 7).map((day, index) => (
                <DayList
                  key={index}
                  receivedDate={day.date}
                  dayOfWeek={day.dayOfWeek}
                  tickets={day.value}
                />
              ))}
            </div>
            <div className="flex w-2/4 flex-col gap-y-1.5">
              {days.slice(7, days.length).map((day, index) => (
                <DayList
                  key={index}
                  receivedDate={day.date}
                  dayOfWeek={day.dayOfWeek}
                  tickets={day.value}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LotteryTicketCalendar;
