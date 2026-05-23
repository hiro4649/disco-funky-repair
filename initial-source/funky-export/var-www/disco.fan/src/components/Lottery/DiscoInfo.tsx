"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import ButtonDefault from "../Buttons/ButtonDefault";
import axios from "axios";
import { useAppDispatch } from "@/store/store";
import { useTranslations } from 'next-intl';

const DiscoInfo: React.FC<any> = (data: {
  waitBalance: string | null;
  ticket: number;
  totalBalance: string | null;
  weeklyBalance: string | null;
  myWallet: Function;
}) => {
  const { waitBalance, ticket, totalBalance, weeklyBalance } = data;
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
    const now = new Date();

    const utcYear = now.getUTCFullYear();
    const utcMonth = now.getUTCMonth() + 1; // Months are zero-based
    const utcDate = now.getUTCDate();
    const utcHours = now.getUTCHours() - now.getUTCHours() % 6;
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

  let approvalBalance: string | null = waitBalance ?? "0";
  let savedDiscoBalance: string | null = totalBalance ?? "0";
  let weeklyDiscoBalance: string | null = weeklyBalance ?? "0";

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
        duration: 3,
        ease: "none",
        onUpdate: () => {
          countUpTarget.textContent = Math.floor(elementNum.count).toLocaleString();
        },
      });
    }
  }, [approvalBalance]); // Trigger only once on page load

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
        duration: 0.5,
        ease: "none",
        onUpdate: () => {
          countUpTarget.textContent = Math.floor(elementNum.count).toLocaleString();
        },
      });
    }
  }, [savedDiscoBalance]); // Trigger only once on page load

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
  }, [weeklyDiscoBalance]); // Trigger only once on page load

  return (
    <div className="bg-[#1D1B20] px-3.5 py-5 text-white">
      <p className="text-[15px] pb-[0.5rem] font-normal	">{t('My DISCO Tokens')}</p>
      <div className="flex text-[13px] leading-[9px] justify-start mt-[9px] mb-[10px]">
        <div className="flex pulsing-dot"></div>
        <div className="flex text-white font-serif">
          <p>&nbsp;&nbsp;{t('Latest Snapshot')}</p>
          <p className="text-[#00FFCC]">&nbsp;{time}&nbsp;</p>
          <p>(UTC)</p>
        </div>
      </div>
      <div className="text-right ">
        <div className="my-3 rounded-[8px] border-[0.5px] border-[#333333] bg-black px-[0.8rem] py-[0.65rem]">
          <div className="flex items-center justify-between">
            <span className="text-xs">{t('Pending 24h Hold')}</span>
            <div className="text-sm font-medium text-[#FFFF33]" ref={approvalTriggerRef}>
              {
                Number(approvalBalance) >= 0 ? <span ref={approvalTargetRef} data-from="0" data-to={`${approvalBalance}`}>0</span> : approvalBalance
              }
            </div>
          </div>
        </div>
        <div className="my-3 rounded-[8px] border-[0.5px] border-[#333333] bg-black px-[0.8rem] py-[0.65rem]">
          <div className="flex items-center justify-between">
            <span className="text-xs">{t('24h Held Tokens')} </span>
            <div className="text-sm font-medium text-[#FFFF33]" ref={SaveTriggerRef}>
              {
                Number(savedDiscoBalance) >= 0 ? <span ref={SaveTargetRef} data-from="0" data-to={`${savedDiscoBalance}`}>0</span> : savedDiscoBalance
              }
            </div>
          </div>
        </div>
      </div>
      <div className="flex text-[13px] leading-[9px] justify-start mt-[9px] mb-[10px]">
        <div className="flex text-white font-serif">
          <p className="text-[#00FFCC]"> {t('Weekly Holding Bonus')} </p>
        </div>
      </div>
      <div className="text-right ">
        <div className="my-3 rounded-[8px] border-[0.5px] border-[#333333] bg-black px-[0.8rem] py-[0.65rem]">
          <div className="flex items-center justify-between">
            <span className="text-xs"> {t('1w Held Tokens')} </span>
            <div className="text-sm font-medium text-[#FFFF33]" ref={weeklyTriggerRef}>
              {
                Number(weeklyDiscoBalance) >= 0 ? <span ref={weeklyTargetRef} data-from="0" data-to={`${weeklyDiscoBalance}`}>0</span> : weeklyDiscoBalance
              }
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-center">
        <ButtonDefault
          label={t("My Wallet")}
          onClick={data.myWallet}
          customClasses="inline-flex items-center justify-center text-center font-semibold hover:bg-opacity-90 bg-[#00FFCC13] text-[#00FFCC] py-2 w-3/6 rounded-full border-[0.5px] border-[#00FFCC] text-sm shadow "
        ></ButtonDefault>
      </div>
    </div>
  );
};

export default DiscoInfo;
