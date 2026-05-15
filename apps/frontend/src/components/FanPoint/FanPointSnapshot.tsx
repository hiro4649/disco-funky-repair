import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { useTranslations } from 'next-intl';

// Function to get the next token tally time (every 12 hours: 00:00, 12:00 UTC)
const getNextTokenTallyTime = (): moment.Moment => {
  const now = moment.utc();
  const hours = now.hours();

  // Find the next 12-hour interval (00:00, 12:00)
  const nextTallyHour = (Math.floor((hours + 12) / 12) * 12) % 24;

  // Create the next tally date at that 12-hour interval
  const nextTally = now
    .clone()
    .set({ hour: nextTallyHour, minute: 0, second: 0, millisecond: 0 });

  // If the current time has already passed the tally time today, move to the next tally interval
  if (now.isSameOrAfter(nextTally)) {
    nextTally.add(1, "day");
  }

  return nextTally;
};

// Function to calculate the percentage progress for the 12-hour token tally
const calculateTokenTallyProgress = (
  targetDate: moment.Moment,
): {
  remaining: { hours: string; minutes: string; seconds: string };
  percentage: number;
} => {
  const now = moment.utc();
  const totalDiff = targetDate.diff(now);

  const hours = Math.floor((totalDiff / (1000 * 60 * 60)) % 24)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((totalDiff / (1000 * 60)) % 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor((totalDiff / 1000) % 60)
    .toString()
    .padStart(2, "0");

  const remaining = { hours, minutes, seconds };

  // Get the start of the current 12-hour interval
  const currentIntervalStartHour = Math.floor(now.hours() / 12) * 12;
  const intervalStart = moment.utc().set({
    hour: currentIntervalStartHour,
    minute: 0,
    second: 0,
    millisecond: 0,
  });

  // Calculate the elapsed time in the current 12-hour interval
  const elapsedMillis = now.diff(intervalStart);
  const totalMillis = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

  // Calculate the percentage based on the elapsed time
  const percentage = Math.floor((elapsedMillis / totalMillis) * 100);

  return { remaining, percentage };
};

interface FanPointSnapshotProps {
  onProgressComplete?: () => void;
}

const FanPointSnapshot: React.FC<FanPointSnapshotProps> = ({ onProgressComplete }) => {
  const [tallyTime, setTallyTime] = useState<{
    hours: string;
    minutes: string;
    seconds: string;
  }>({
    hours: "00",
    minutes: "00",
    seconds: "00",
  });
  const [tallyProgress, setTallyProgress] = useState<number>(0);
  const t = useTranslations('FanPoints');

  useEffect(() => {
    const updateTimer = () => {
      const nextTokenTally = getNextTokenTallyTime();
      const tallyData = calculateTokenTallyProgress(nextTokenTally);

      setTallyTime(tallyData.remaining);
      setTallyProgress(tallyData.percentage);

      // If progress reaches 100%, call the callback
      if (tallyData.remaining.hours === "00" && tallyData.remaining.minutes === "00" && tallyData.remaining.seconds === "00" && onProgressComplete) {
        onProgressComplete();
      }
    };

    // Update timer and progress every second
    const interval = setInterval(updateTimer, 1000);

    // Run initially to avoid 1-second delay
    updateTimer();

    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, [onProgressComplete]);

  useEffect(() => {
    // Animate progress bar when component mounts or progress changes
    const animateProgressBar = () => {
      // Animate skill bars
      const bars = document.querySelectorAll<HTMLElement>(".fanpoint-bar-info");
      bars.forEach((bar) => {
        const total = parseInt(bar.getAttribute("data-total") || "0", 0);
        if (bar) {
          bar.style.width = `${total}%`;
        }
      });

      // Animate percentage counters
      const percentElements =
        document.querySelectorAll<HTMLElement>(".fanpoint-percent");
      percentElements.forEach((percentEl) => {
        const count = parseInt(percentEl.textContent || "0", 0);
        let currentCount = 0;

        const interval = setInterval(() => {
          if (currentCount < count) {
            currentCount++;
            percentEl.textContent = `${currentCount}%`;
          } else {
            clearInterval(interval);
          }
        }, 30); // Adjust speed of counting
      });
    };

    const timeoutId = setTimeout(animateProgressBar, 500);
    return () => clearTimeout(timeoutId);
  }, [tallyProgress]);

  return (
    <div>
      <div className="mb-[7px] flex items-center justify-between">
        <div className='inline-flex items-center gap-x-2'>
          <div className="pulsing-dot flex"></div>
          <span className="text-[15px] text-white">{t('Next token snapshot')}</span>
        </div>
        <div className="flex items-center gap-x-1 font-semibold">
          <div className="flex justify-center items-center mr-1">
            <p className="text-[15px] leading-[1.2rem] font-normal text-main mr-[0.2rem]">
              {tallyTime.hours}
            </p>
            <p className="leading-[1.25px] text-[13px] text-white">h</p>
          </div>

          <div className="flex justify-center items-center mr-1">
            <p className="text-[15px] leading-[1.2rem] font-normal text-main mr-[0.2rem]">
              {tallyTime.minutes}
            </p>
            <p className="leading-[1.25px] text-[13px] text-white">m</p>
          </div>

          <div className="flex justify-center items-center mr-1">
            <p className="text-[15px] leading-[1.2rem] font-normal text-main mr-[0.2rem]">
              {tallyTime.seconds}
            </p>
            <p className="leading-[1.25px] text-[13px] text-white">s</p>
          </div>

          <p className="text-sm font-normal text-white">/ 12h</p>
        </div>
      </div>
      <div className="h-[16px] w-full rounded-[10px] bg-[#333333]">
        <div
          className="fanpoint-bar-info flex h-[16px] items-center justify-end rounded-[10px] border-[1px] border-white pr-[6px]"
          data-total={tallyProgress}
        >
          <span className="fanpoint-percent text-xs text-black">
            {Number(tallyProgress.toFixed(0)) > 4
              ? tallyProgress.toFixed(0) + "%"
              : "%"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default FanPointSnapshot; 