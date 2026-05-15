"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import moment from "moment";
import ButtonDefault from "../Buttons/ButtonDefault";
import axios from "axios";
import { useAppDispatch } from "@/store/store";
import { useTranslations } from 'next-intl';

const DiscoInfo: React.FC<any> = (data: {
  waitBalance: number;
  ticket: number;
  totalBalance: number;
  weeklyBalance: number;
  loading?: boolean;
  myWallet: Function;
}) => {
  const { waitBalance, ticket, totalBalance, weeklyBalance, loading = false } = data;
  const t = useTranslations('LotteryTicket');
  const approvalTriggerRef = useRef<HTMLDivElement>(null);
  const approvalTargetRef = useRef<HTMLSpanElement>(null);
  const weeklyTriggerRef = useRef<HTMLDivElement>(null);
  const weeklyTargetRef = useRef<HTMLSpanElement>(null);
  const SaveTriggerRef = useRef<HTMLDivElement>(null);
  const SaveTargetRef = useRef<HTMLSpanElement>(null);
  const [time, setTime] = useState<string>('');
  const dispatch = useAppDispatch();
  const getLatestSnapShotTime = useCallback(async () => {
    const now = moment.utc();

    const utcYear = now.year();
    const utcMonth = now.month() + 1; // Months are zero-based
    const utcDate = now.date();
    const utcHours = now.hours() - now.hours() % 6;
    setTime(`${utcYear}-${utcMonth}-${utcDate} ${utcHours}:00`);
  }, [dispatch]);

  useEffect(() => {
    const interval = setInterval(getLatestSnapShotTime, 1000);
    return () => clearInterval(interval);
  }, [getLatestSnapShotTime]);

  const displaySuiBalance = (balanceInMist: string | null) => {
    const balanceNum = Number(balanceInMist);
    const balanceInSui = balanceNum / 1_000_000_000;
    return balanceInSui.toFixed(3); // Display with 3 decimal places
  };

  useEffect(() => {
    const countUpTrigger = approvalTriggerRef.current;
    const countUpTarget = approvalTargetRef.current;

    if (countUpTrigger && countUpTarget) {
      const fromValue = parseInt(countUpTarget.dataset.from || "0", 10);
      const toValue = parseInt(countUpTarget.dataset.to || "0", 10);

      // GSAP animation
      const elementNum = { count: fromValue };
      gsap.to(elementNum, {
        count: toValue,
        duration: 1,
        ease: "none",
        onUpdate: () => {
          countUpTarget.textContent = Math.floor(elementNum.count).toLocaleString();
        },
      });
    }
  }, [waitBalance]); // Trigger only once on page load

  useEffect(() => {
    const countUpTrigger = SaveTriggerRef.current;
    const countUpTarget = SaveTargetRef.current;

    if (countUpTrigger && countUpTarget) {
      const fromValue = parseInt(countUpTarget.dataset.from || "0", 10);
      const toValue = parseInt(countUpTarget.dataset.to || "0", 10);

      // GSAP animation
      const elementNum = { count: fromValue };
      gsap.to(elementNum, {
        count: toValue,
        duration: 1,
        ease: "none",
        onUpdate: () => {
          countUpTarget.textContent = Math.floor(elementNum.count).toLocaleString();
        },
      });
    }
  }, [totalBalance]); // Trigger only once on page load

  useEffect(() => {
    const countUpTrigger = weeklyTriggerRef.current;
    const countUpTarget = weeklyTargetRef.current;

    if (countUpTrigger && countUpTarget) {
      const fromValue = parseInt(countUpTarget.dataset.from || "0", 10);
      const toValue = parseInt(countUpTarget.dataset.to || "0", 10);

      // GSAP animation
      const elementNum = { count: fromValue };
      gsap.to(elementNum, {
        count: toValue,
        duration: 0.5,
        ease: "none",
        onUpdate: () => {
          countUpTarget.textContent = Math.floor(elementNum.count).toLocaleString();
        },
      });
    }
  }, [weeklyBalance]); // Trigger only once on page load

  return (
    <div className="bg-secondary px-3.5 py-5 text-white">
      <p className="text-[15px] pb-[0.5rem] font-normal	">{t(`My ${process.env.NEXT_PUBLIC_APP_NAME} Tokens`)}</p>
      <div className="flex text-[13px] leading-[9px] justify-start mt-[9px] mb-[10px]">
        <div className="flex pulsing-dot"></div>
        <div className="flex text-white font-serif">
          <p>&nbsp;&nbsp;{t('Latest Snapshot')}</p>
          <p className="text-main">&nbsp;{time}&nbsp;</p>
          <p>(UTC)</p>
        </div>
      </div>
      <div className="text-right ">
        <div className="my-3 rounded-[8px] border-[0.5px] border-[#333333] bg-black px-[0.8rem] py-[0.65rem]">
          <div className="flex items-center justify-between">
            <span className="text-xs">{t('Pending 24h Hold')}</span>
            <div className="text-[15px] font-normal text-[#FFFF33]" ref={approvalTriggerRef}>
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#FFFF33] mr-2"></div>
                  <span>Loading...</span>
                </div>
              ) : (
                waitBalance >= 0 ? <span ref={approvalTargetRef} data-from="0" data-to={`${waitBalance}`}>0</span> : waitBalance
              )}
            </div>
          </div>
        </div>
        <div className="my-3 rounded-[8px] border-[0.5px] border-[#333333] bg-black px-[0.8rem] py-[0.65rem]">
          <div className="flex items-center justify-between">
            <span className="text-xs">{t('24h Held Tokens')} </span>
            <div className="text-[15px] font-normal text-[#FFFF33]" ref={SaveTriggerRef}>
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#FFFF33] mr-2"></div>
                  <span>Loading...</span>
                </div>
              ) : (
                totalBalance >= 0 ? <span ref={SaveTargetRef} data-from="0" data-to={`${totalBalance}`}>0</span> : totalBalance
              )}
            </div>
          </div>
        </div>
      </div>
      {/* <div className="text-right ">
        <div className="my-3 rounded-[8px] border-[0.5px] border-[#333333] bg-black px-[0.8rem] py-[0.65rem]">
          <div className="flex items-center justify-between">
            <span className="text-xs"> {t('1w Held Tokens')} </span>
            <div className="text-sm font-medium text-[#FFFF33]" ref={weeklyTriggerRef}>
              {
                weeklyBalance >= 0 ? <span ref={weeklyTargetRef} data-from="0" data-to={`${weeklyBalance}`}>0</span> : weeklyBalance
              }
            </div>
          </div>
        </div>
      </div> */}
      <div className="flex justify-center pt-[.65rem]">
        <ButtonDefault
          label={t("My Wallet")}
          onClick={data.myWallet}
          customClasses="inline-flex items-center justify-center text-center hover:bg-opacity-90 bg-main-100 text-main py-2 w-3/6 rounded-full border-[0.5px] border-main text-sm shadow "
        ></ButtonDefault>
      </div>
    </div>
  );
};

export default DiscoInfo;
