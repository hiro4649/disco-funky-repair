"use client";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
  useMemo,
  useRef,
} from "react";
import DiscoInfo from "./DiscoInfo";
import FreeTickets from "./FreeTickets";
import LotteryTicketIcon from "../common/icons/lottery";
import { useAppSelector, useAppDispatch, store } from "@/store/store";
import { setDrawLoading, setDrawSuccess, setFailedDraw, setShowBullAnimation, setOpenScreen, setShowIllustration, setShowPrizeImage, setDrawState } from "@/store/slices/homeSlice";
import { setLotteryTicket } from "@/store/slices/userSlice";
import Image from "next/image";
import apiClient from "../../../utils/apiClient";
import { jwtDecode } from "jwt-decode";
import { JwtPayload } from "jsonwebtoken";
import LotteryTicketCalendar from "./LotteryTicketCalendar";
import moment from "moment";
import NotEnoughTicketsModal from "./NotEnoughTicketsModal";
import ConnectWalletMessageModal from "./ConnectWalletMessageModal";
import { useRouter } from "next/navigation";
import { useTranslations } from 'next-intl';
import TokenSnapshot from "./TokenSnapshot";
import gsap from "gsap";
import confetti from "canvas-confetti";
import { refreshUserInfo } from "@/utils/refreshUserInfo";
import toast from "react-hot-toast";
import { useTicketBalanceUpdates } from '@/hooks/useTicketBalanceUpdates';

// export const socketIO = new WebSocket("ws://localhost:5001");


interface jwtToken extends JwtPayload {
  user_id: number;
}
// Utility function to calculate time remaining until a target Date
const calculateTimeRemaining = (
  targetDate: moment.Moment,
): {
  remaining: { hours: string; minutes: string; seconds: string };
  percentage: number;
} => {
  const now = moment.utc();

  // Total time from "now" to target date
  const totalMillis = targetDate.diff(now);

  // Calculate hours, minutes, and seconds remaining
  const hours = Math.floor((totalMillis / (1000 * 60 * 60)) % 24)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((totalMillis / (1000 * 60)) % 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor((totalMillis / 1000) % 60)
    .toString()
    .padStart(2, "0");

  const remaining = { hours: hours, minutes: minutes, seconds: seconds };

  // Get the total time span from when the event would have started (for progress)
  const startDate = moment.utc().startOf("day"); // This assumes the start is at midnight UTC

  // Calculate the total time from startDate to targetDate
  const fullDurationMillis = targetDate.diff(startDate);

  // Calculate percentage of elapsed time
  const elapsedMillis = fullDurationMillis - totalMillis; // Elapsed time
  const percentage = Math.floor((elapsedMillis / fullDurationMillis) * 100);

  // console.log("Remaining time:", remaining);
  // console.log("Percentage:", percentage);

  return { remaining, percentage };
};

// Function to calculate the percentage progress for the 6-hour token tally
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

  const remaining = { hours: hours, minutes: minutes, seconds: seconds };

  // Get the start of the current 6-hour interval
  const currentIntervalStartHour = Math.floor(now.hours() / 6) * 6;
  const intervalStart = moment.utc().set({
    hour: currentIntervalStartHour,
    minute: 0,
    second: 0,
    millisecond: 0,
  });

  // Calculate the elapsed time in the current 6-hour interval
  const elapsedMillis = now.diff(intervalStart);
  const totalMillis = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

  // Calculate the percentage based on the elapsed time
  const percentage = Math.floor((elapsedMillis / totalMillis) * 100);

  return { remaining, percentage };
};

// Function to get the next ticket distribution time (daily at 24:00 GMT)
const getNextTicketDistributionTime = (): moment.Moment => {
  const now = moment.utc();
  const nextDistribution = now.clone().add(1, "day").startOf("day"); // Next day at 00:00 UTC
  return nextDistribution;
};

// Function to get the next token tally time (every 6 hours: 00:00, 06:00, 12:00, 18:00 UTC)
const getNextTokenTallyTime = (): moment.Moment => {
  const now = moment.utc();
  const hours = now.hours();

  // Find the next 6-hour interval (00:00, 06:00, 12:00, 18:00)
  const nextTallyHour = (Math.floor((hours + 6) / 6) * 6) % 24;

  // Create the next tally date at that 6-hour interval
  const nextTally = now
    .clone()
    .set({ hour: nextTallyHour, minute: 0, second: 0, millisecond: 0 });

  // If the current time has already passed the tally time today, move to the next tally interval
  if (now.isSameOrAfter(nextTally)) {
    nextTally.add(1, "day");
  }

  return nextTally;
};

const LotteryTicket: React.FC<any> = () => {
  const dispatch = useAppDispatch();
  const { authState, ticket, user_id, claimTickets } = useAppSelector((state) => state.user);
  const { drawLoading, failedDraw } = useAppSelector((state) => state.home);
  const [waitBalance, setWaitBalance] = useState<number>(0);
  const [totalBalance, setTotalBalance] = useState<number>(0);
  const [weeklyBalance, setWeeklyBalance] = useState<number>(0);
  const [loadingTicket, setLoadingTicket] = useState(false);
  const characterRef = useRef<HTMLImageElement>(null);
  const [ticketTime, setTicketTime] = useState<{
    hours: string;
    minutes: string;
    seconds: string;
  }>({
    hours: "00",
    minutes: "00",
    seconds: "00",
  });
  const [ticketProgress, setTicketProgress] = useState<number>(0);
  const [animatedTicketProgress, setAnimatedTicketProgress] = useState(0);
  const [animatedTallyProgress, setAnimatedTallyProgress] = useState(0);
  const [modalReady, setModalReady] = useState(false);
  const t = useTranslations('LotteryTicket');

  // Random jumping image selection
  const jumpingImages = [
    "/images/jump_gacha/1_jump_03.png",
    "/images/jump_gacha/2_jump_03.png",
    "/images/jump_gacha/3_jump_03.png",
    "/images/jump_gacha/4_jump_03.png",
    "/images/jump_gacha/5_jump_03.png",
    "/images/jump_gacha/6_jump_03.png"
  ];

  // Function to get random jumping image
  const getRandomJumpingImage = () => {
    const randomIndex = Math.floor(Math.random() * jumpingImages.length);
    return jumpingImages[randomIndex];
  };

  const [randomJumpingImage, setRandomJumpingImage] = useState(getRandomJumpingImage());

  useEffect(() => {
    const updateTimers = () => {
      const nextTicketDistribution = getNextTicketDistributionTime();
      const ticketData = calculateTimeRemaining(nextTicketDistribution);

      setTicketTime(ticketData.remaining);
      setTicketProgress(ticketData.percentage);

      if (ticketData.percentage === 0) {
        getBalanceAndTickets();
      }
    };

    // Update timers and progress every second
    const interval = setInterval(updateTimers, 1000);

    // Run initially to avoid 1-second delay
    updateTimers();

    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    dispatch(setOpenScreen(true));
    const timeoutId = setTimeout(() => {
      dispatch(setOpenScreen(false));
      dispatch(setDrawLoading(false));
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [dispatch]);

  useEffect(() => {
    getBalanceAndTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketProgress]);

  const getBalanceAndTickets = () => {
    if (
      (Math.round(ticketProgress) >= 0 && Math.round(ticketProgress) <= 100)
    ) {
      const timeProgress = () => {
        // Animate skill bars
        const bars = document.querySelectorAll<HTMLElement>(".bar-info");
        bars.forEach((bar) => {
          const total = parseInt(bar.getAttribute("data-total") || "0", 0);
          if (bar) {
            bar.style.width = `${total}%`;
          }
        });

        // Animate percentage counters
        const percentElements =
          document.querySelectorAll<HTMLElement>(".percent");
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
          }, 30);
        });
      };

      const timeoutId = setTimeout(timeProgress, 1000);
      return () => clearTimeout(timeoutId);
    }
  };

  const fetchTicketAndBalance = useCallback(async () => {
    if (!user_id) return;

    setLoadingTicket(true);

    try {
      const response = await apiClient.get(`/lottery/ticket/${user_id}`);
      const { data } = response;

      if (data.success) {
        dispatch(setLotteryTicket(data.ticket));
        setTotalBalance(data.totalBalance);
        setWeeklyBalance(data.weeklyBalance);
        setWaitBalance(data.waitToken);
      }
    } catch (error) {
      console.error("Error fetching ticket and balance:", error);
    } finally {
      setLoadingTicket(false);
    }
  }, [user_id, dispatch]);

  const fetchTicketAndBalanceWithDelay = useCallback(async () => {
    setLoadingTicket(true);
    setWaitBalance(0);
    setTotalBalance(0);
    setWeeklyBalance(0);
    // Check if backend is updating, if so, wait and retry
    const checkAndFetch = async (retries = 0) => {
      try {
        const statusResponse = await apiClient.get('/lottery/update-status');
        if (statusResponse.data.success && (statusResponse.data.isUpdating === 'processing' || statusResponse.data.isUpdating === 'inited')) {
          if (retries < 10) { // Max 10 retries (50 seconds total)
            console.log('Backend is updating, waiting 5 seconds before retry...');
            setTimeout(() => checkAndFetch(retries + 1), 5000);
            return;
          }
        }
        // Backend is not updating or max retries reached, fetch data
        await fetchTicketAndBalance();
        setLoadingTicket(false);
      } catch (error) {
        console.error('Error checking update status:', error);
        // Fallback: just fetch the data
        await fetchTicketAndBalance();
        setLoadingTicket(false);
      }
    };

    checkAndFetch();
  }, [fetchTicketAndBalance]);

  useEffect(() => {
    fetchTicketAndBalance();
  }, [fetchTicketAndBalance]);

  // ============================================================
  // WebSocket Auto-Refresh: Automatically updates lottery data
  // when backend completes 6-hour token balance update (0, 6, 12, 18 UTC)
  // Updates: claimTickets, sixHourTokenBalance, tallyTokenBalance, fan_points
  // ============================================================
  const { isConnected: wsConnected, lastUpdate } = useTicketBalanceUpdates({
    onUpdate: fetchTicketAndBalance  // Re-fetch ticket and balance after backend update
  });

  // Show toast notification when tickets are updated via WebSocket
  useEffect(() => {
    if (lastUpdate) {
      console.log('✅ Lottery tickets updated at:', lastUpdate);
      // toast.success(t('Your lottery tickets have been updated!'), {
      //   duration: 4000,
      //   icon: '🎫',
      // });
    }
  }, [lastUpdate, t]);

  const days = [
    { "date": "11/05", "dayOfWeek": "TUE", "value": "--" },
    { "date": "11/04", "dayOfWeek": "MON", "value": "--" },
    { "date": "11/03", "dayOfWeek": "SUN", "value": "--" },
    { "date": "11/02", "dayOfWeek": "SAT", "value": "--" },
    { "date": "11/01", "dayOfWeek": "FRI", "value": "--" },
    { "date": "10/31", "dayOfWeek": "THU", "value": "--" },
    { "date": "10/30", "dayOfWeek": "WED", "value": "--" },
    { "date": "10/29", "dayOfWeek": "TUE", "value": "--" },
    { "date": "10/28", "dayOfWeek": "MON", "value": "--" },
    { "date": "10/27", "dayOfWeek": "SUN", "value": "--" },
    { "date": "10/26", "dayOfWeek": "SAT", "value": "--" },
    { "date": "10/25", "dayOfWeek": "FRI", "value": "--" },
    { "date": "10/24", "dayOfWeek": "THU", "value": "--" },
    { "date": "10/23", "dayOfWeek": "WED", "value": "--" }
  ];

  const data = [
    { "id": 6, "userId": 1, "ticket": 0, "receivedDate": "2024-11-05T00:30:00.593Z" },
    { "id": 5, "userId": 1, "ticket": 4, "receivedDate": "2024-11-04T15:32:48.481Z" },
    { "id": 3, "userId": 1, "ticket": 0, "receivedDate": "2024-11-03T00:30:00.689Z" }
  ];

  // Function to format the date from receivedDate to MM/DD
  function formatDate(dateStr: string) {
    const date = moment.utc(dateStr);
    const month = (date.month() + 1).toString().padStart(2, '0'); // Months are 0-based
    const day = date.date().toString().padStart(2, '0');
    return `${month}/${day}`;
  }

  // Assign tickets to corresponding days
  days.forEach(day => {
    const matchingEntry = data.find(entry => formatDate(entry.receivedDate) === day.date);
    if (matchingEntry) {
      day.value = matchingEntry.ticket.toString();
    }
  });

  const reSetAllAirdropState = () => {
    dispatch(setFailedDraw(false));
    dispatch(setOpenScreen(false));
    dispatch(setDrawLoading(false));
    dispatch(setDrawSuccess(false));
    dispatch(setShowIllustration(false));
    dispatch(setShowPrizeImage(false));
    dispatch(setShowBullAnimation(false));
    dispatch(setOpenScreen(false));
    dispatch(setDrawState(false));
  }

  const [showNotEnoughModal, setShowNotEnoughModal] = useState(false);
  const closeNotEnoughModal = () => {
    setShowNotEnoughModal(false);
    reSetAllAirdropState();
  };
  const [connectWalletModal, setConnectWalletModal] = useState(false);
  const closeConnectWalletModal = () => {
    setConnectWalletModal(false);
    reSetAllAirdropState();
  };

  useEffect(() => {
    setConnectWalletModal(!authState && failedDraw);
    if (authState) {
      setShowNotEnoughModal(failedDraw);
    }

    // Set modal ready after 2 seconds when modal is shown
    if (failedDraw) {
      setModalReady(false);
      const timer = setTimeout(() => {
        setModalReady(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setModalReady(false);
    }
  }, [authState, failedDraw]);

  const router = useRouter();

  const startJumpingAnimation = () => {
    const character = characterRef.current;
    setRandomJumpingImage(getRandomJumpingImage());

    async function animateCharacter() {
      if (!character) return;

      character.style.display = 'block';

      // Wait for image to load before starting animation
      const startAnimation = () => {
        const startX = -280; // Use fixed width since image might not be loaded yet
        const endX = window.innerWidth + 200;
        const baseY = window.innerHeight - 140; // Adjust for image height
        const peakY = window.innerHeight * 0.05;
        const duration = 2000;

        let startTime: number | null = null;

        function jump(time: number) {
          if (!startTime) startTime = time;
          const t = (time - startTime) / duration;

          if (t > 1) {
            character!.style.display = 'none';
            return;
          }

          const x = startX + (endX - startX) * t;
          const jumpProgress = t;
          const y = baseY - (4 * (baseY - peakY)) * jumpProgress * (1 - jumpProgress);

          let scale;
          if (jumpProgress < 0.5) {
            scale = 1 + jumpProgress * 2;
          } else {
            scale = 2 - (jumpProgress - 0.5) * 2;
          }

          const rotate = 40 * jumpProgress;

          character!.style.left = `${x}px`;
          character!.style.top = `${y}px`;
          character!.style.transform = `scale(${scale}) rotate(${rotate}deg)`;

          requestAnimationFrame(jump);
        }

        requestAnimationFrame(jump);
      };

      // Check if image is already loaded
      if (character.complete && character.naturalHeight !== 0) {
        startAnimation();
      } else {
        // Wait for image to load
        character.onload = startAnimation;
      }
    }

    setTimeout(() => {
      animateCharacter();
    }, 100);
  };

  const claimClaimTickets = async () => {
    if (!authState) {
      setConnectWalletModal(true);
      return;
    }

    if (!user_id) {
      return;
    }

    if (claimTickets <= 0) {
      toast("There are no tickets to claim.", {
        icon: '⚠️',
        style: {
          borderRadius: '10px',
          background: 'var(--color-secondary)',
          color: '#fff',
        },
      });
      return;
    }

    try {
      const claimedAmount = claimTickets; // Store the amount before it's reset
      const response = await apiClient.post('/lottery/claim/ticket/to/user', {
        userId: user_id
      });

      if (response.status === 200 && response.data.success) {
        // Show success toast
        toast.success(`Claim ${claimedAmount} tickets success!`, {
          style: {
            borderRadius: '10px',
            background: 'var(--color-secondary)',
            color: '#fff',
          },
        });

        // Refresh user info to get updated ticket count
        await refreshUserInfo(user_id, dispatch);

        // Display confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });

        // Start jumping animation
        startJumpingAnimation();
      }
    } catch (error) {
      console.error('Error claiming tickets:', error);
    }
  };

  return (
    <div className="mx-auto max-w-[480px]">
      <div className="space-y-5 px-3 pt-7">
        <div className="flex items-end justify-center">
          <p className="mb-2.5 text-[24px] leading-[28px] text-white normal">
            {/* Lottery <span className="text-main">T</span>icket */}
            {t('Lottery Ticket')}
          </p>
        </div>
        <div className="rounded-lg border-[2px] border-secondary">
          <div className="px-3.5 py-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[15px] text-white"> {t('Next ticket distribution')} </p>
              {ticketTime && (
                <div className="flex items-center gap-x-1 font-semibold">
                  <div className="flex justify-center items-center mr-1">
                    <p className="text-[15px] font-normal leading-[1.2rem] text-main mr-[0.2rem]">
                      {ticketTime.hours}
                    </p>
                    <p className="leading-[1.25px] text-[13px] text-white">h</p>
                  </div>
                  <div className="flex justify-center items-center mr-1">
                    <p className="text-[15px] font-normal leading-[1.2rem] text-main mr-[0.2rem]">
                      {ticketTime.minutes}
                    </p>
                    <p className="leading-[1.25px] text-[13px] text-white">m</p>
                  </div>
                  <div className="flex justify-center items-center mr-1">
                    <p className="text-[15px] font-normal leading-[1.2rem] text-main mr-[0.2rem]">
                      {ticketTime.seconds}
                    </p>
                    <p className="leading-[1.25px] text-[13px] text-white">s</p>
                  </div>
                  <p className="text-sm font-normal text-white">/ 24h</p>
                </div>
              )}
            </div>
            <div className="h-[16px] w-full rounded-[10px] bg-[#333333]">
              <div
                className="bar-info flex h-[16px] items-center justify-end rounded-[10px] border-y-[1px] border-white pr-[6px]"
                data-total={ticketProgress}
              >
                <span className="percent text-xs text-black">
                  {Number(ticketProgress.toFixed(0)) > 4
                    ? ticketProgress.toFixed(0) + "%"
                    : "%"}
                </span>
              </div>
            </div>
          </div>
          <div className="bg-secondary px-3.5 py-5 text-white">
            <div
              onClick={claimClaimTickets}
              className="relative flex bg-mainbg-600 items-center justify-center gap-2 px-6 py-2 border-2 border-main rounded-full text-white text-lg font-normal hover:bg-main hover:text-black transition-all duration-300"
            >
              {t('Claim Tickets')}
              {claimTickets > 0 && (
              <span className="absolute right-3 z-1 bg-red-500 text-white rounded-full text-xs min-w-5 h-5 px-1.5 flex items-center justify-center font-semibold">
                {claimTickets >= 1000000000
                  ? `${(claimTickets / 1000000000).toFixed(1)}B`
                  : claimTickets >= 1000000
                  ? `${(claimTickets / 1000000).toFixed(1)}M`
                  : claimTickets >= 1000
                  ? `${(claimTickets / 1000).toFixed(1)}K`
                  : claimTickets}
              </span>
              )}
            </div>
          </div>
          <LotteryTicketCalendar
            waitBalance={Number(waitBalance)}
            totalBalance={Number(totalBalance)}
            weeklyBalance={Number(weeklyBalance)}
            loading={loadingTicket}
          />
        </div>
        <div className="rounded-lg border-[2px] border-secondary">
          <div className="px-3.5 py-5">
            <TokenSnapshot onProgressComplete={fetchTicketAndBalanceWithDelay} />
          </div>
          
          <div className="">
            <DiscoInfo
              waitBalance={waitBalance}
              totalBalance={totalBalance}
              weeklyBalance={weeklyBalance}
              ticket={ticket}
              loading={loadingTicket}
              myWallet={() => {
                if (authState) {
                  router.push("/my-wallet");

                } else {
                  setConnectWalletModal(true);
                }
              }}
            />
          </div>
        </div>
        

        {/* <FreeTickets /> */}
        <NotEnoughTicketsModal
          isOpen={showNotEnoughModal}
          isDismissable={modalReady ? true : false}
          onClose={closeNotEnoughModal}
        />
        <ConnectWalletMessageModal
          isOpen={connectWalletModal}
          isDismissable={true}
          onClose={closeConnectWalletModal}
        />
      </div>

      {/* WebSocket Connection Status Indicator (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-gray-900/90 px-3 py-2 text-xs text-white shadow-lg">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span>{wsConnected ? 'WS Connected' : 'WS Disconnected'}</span>
            {lastUpdate && (
              <span className="ml-2 text-gray-400">
                | {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
      )}

      <img
        ref={characterRef}
        src={randomJumpingImage}
        alt="Bull character"
        style={{
          position: 'fixed',
          top: '60%',
          left: '50%',
          zIndex: '9999',
          width: '420px',
          height: 'auto',
          transformOrigin: 'center center',
          display: 'none'
        }}
      />
    </div>
  );
};

export default LotteryTicket;
