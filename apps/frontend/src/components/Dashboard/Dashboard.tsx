"use client";
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import Image from "next/image";
import ButtonDefault from "../Buttons/ButtonDefault";
import { Eye, SendHorizontal } from "lucide-react";
import AirdropPrize from "../Airdrop";
import LeaderBoard from "../FanPoint";
import { useRouter } from "next/navigation";
import apiClient from "../../../utils/apiClient";
import { useAppDispatch, useAppSelector } from "@/store/store";
import {
  setDrawLoading,
  setOpenScreen,
  setDrawState,
  setFailedDraw,
  setShowIllustration,
} from "@/store/slices/homeSlice";
import AirdropIcon from "../common/icons/airdrop";
import { setLotteryTicket } from "@/store/slices/userSlice";
import {
  setIllustrationLoading,
  setIllustrationData,
  setIllustrationError
} from "@/store/slices/illustrationSlice";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);
import Particleground from "../Particleground";
import "@/css/animations.css";
import { useTranslations } from 'next-intl';
import { setIllustration1Data, setIllustration1Error, resetIllustration1 } from '@/store/slices/transitionSlice';
import { refreshUserInfo } from "@/utils/refreshUserInfo";

const TICKET_TOKEN_THRESHOLD = 10000;

const Dashboard: React.FC = () => {
  const router = useRouter();
  const { authState, ticket, user_id } = useAppSelector((state) => state.user);
  const { drawLoading, failedDraw } = useAppSelector((state) => state.home);
  const [isButtonClicked, setIsButtonClicked] = useState(false);
  const tokenBalance = TICKET_TOKEN_THRESHOLD;
  const dispatch = useAppDispatch();
  const t = useTranslations('Home')
  const aprTargetRef = useRef<HTMLSpanElement>(null);
  const aprTriggerRef = useRef<HTMLDivElement>(null);
  
  const drawIllustration = useCallback(async () => {
    try {
      const res = await apiClient.post(`/airdrop/prize/draw/${user_id}`);
      if (res.status === 200) {
        if (res.data.success) {
          // Refresh user info after successful airdrop draw
          await refreshUserInfo(user_id, dispatch);

          dispatch(setDrawState(true));
          dispatch(setDrawLoading(true));
          router.push("/prize-transition");
        } else if (!res.data.ticket) {
          dispatch(setFailedDraw(true));
          router.push('/lottery-ticket');
        } else {
          console.error(res.data.msg);
          router.push("/");
        }
      }
    } catch (err) {
      console.error('Draw failed:', err);
      dispatch(setDrawState(false));
      dispatch(setDrawLoading(false));
    }
  }, [user_id, dispatch, router, authState]);

  const onDraw = async () => {
    if (isButtonClicked || drawLoading) return;
    dispatch(setDrawLoading(true));
    setIsButtonClicked(true);

    try {
      if (user_id && authState) {

        // Make request to draw an illustration
        try {
          dispatch(setIllustrationLoading(true));
          const response = await apiClient.post(`/user/${user_id}/draw-illustration`);
          if (response.status === 200 && response.data.success) {
            const illustrationData = response.data.data;

            // Refresh user info after drawing illustration (affects fan points)
            await refreshUserInfo(user_id, dispatch);

            dispatch(setIllustrationData({
              image_url: illustrationData.image_url,
              earned_pts: illustrationData.earned_pts,
              jumpStatus: illustrationData.jumpStatus,
              dance: illustrationData.dance
            }));
            if (illustrationData.jumpStatus) {
              dispatch(setIllustration1Data({
                image_url: illustrationData.image_url,
                earned_pts: illustrationData.earned_pts,
                jumpStatus: illustrationData.jumpStatus,
                dance: illustrationData.dance
              }));
            } else {
              dispatch(setIllustration1Error(response.data.message || 'Failed to draw illustration'));
            }
          } else {
            dispatch(setIllustrationError(response.data.message || 'Failed to draw illustration'));
          }
        } catch (error) {
          console.error('Error drawing illustration:', error);
          dispatch(setIllustrationError('Error drawing illustration'));
          setIsButtonClicked(false);
        }
        //drawing illustration
        setTimeout(() => {
          drawIllustration();
        }, 2000);

      } else {
        dispatch(setDrawLoading(true));
        setTimeout(() => {
          setIsButtonClicked(false);
          dispatch(setFailedDraw(true));
          router.push("/lottery-ticket");
        }, 3000);
      }
    } catch (err) {
      dispatch(setDrawLoading(false));
      setIsButtonClicked(false);
    }
  };

  const getLotteryTickets = useCallback(async () => {
    if (!user_id) return;

    try {
      const response = await apiClient.get(
        `/lottery/ticket/count/${user_id}`,
      );
      if (response.status === 200) {
        const data = response.data;
        dispatch(setLotteryTicket(data.ticket));
      }
    } catch (e) {
      console.log("Error fetching data:", e);
    }
  }, [user_id, dispatch]);

  useEffect(() => {
    if (!user_id) return;
    getLotteryTickets();
  }, [user_id, getLotteryTickets]);

  useEffect(() => {
    const countUpTrigger = aprTriggerRef.current;
    const countUpTarget = aprTargetRef.current;

    if (countUpTrigger && countUpTarget) {
      const fromValue = parseInt(countUpTarget.dataset.from || "0", 10);
      const toValue = parseInt(countUpTarget.dataset.to || "0", 10);

      console.log('Count-up animation starting:', { fromValue, toValue });

      // Set initial value
      countUpTarget.textContent = fromValue.toString();
      
      // Create the animation
      const elementNum = { count: fromValue };
      
      // Try ScrollTrigger first, fallback to regular animation
      try {
        gsap.to(elementNum, {
          count: toValue,
          delay: 2, // 1 second delay
          duration: 2.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: countUpTrigger,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none none",
            once: true,
          },
          onUpdate: () => {
            countUpTarget.textContent = Math.floor(elementNum.count).toLocaleString();
          },
          onComplete: () => {
            console.log('Count-up animation completed with ScrollTrigger');
          }
        });
      } catch (error) {
        console.log('ScrollTrigger failed, using fallback animation:', error);
        // Fallback: simple animation with delay
        gsap.to(elementNum, {
          count: toValue,
          duration: 2.5,
          ease: "power2.out",
          delay: 1, // 1 second delay
          onUpdate: () => {
            countUpTarget.textContent = Math.floor(elementNum.count).toLocaleString();
          },
          onComplete: () => {
            console.log('Count-up animation completed with fallback');
          }
        });
      }
    } else {
      console.log('Count-up refs not found:', { countUpTrigger, countUpTarget });
    }

    // Cleanup function
    return () => {
      try {
        ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      } catch (error) {
        console.log('Error cleaning up ScrollTrigger:', error);
      }
    };
  }, []);

  useEffect(() => {
    const fadeInUp = () => {
      const elements = document.querySelectorAll(".fadeInUpText");
      const tl = gsap.timeline();
      elements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        if (rect.top <= window.innerHeight - 100) {
          tl.fromTo(
            element,
            { opacity: 0, y: 100 },
            {
              opacity: 1,
              y: 0,
              duration: 0.5,
              ease: "power1.out",
              onStart: () => {
                element.classList.remove("fadeInUpText"); // Prevent duplicate animations
              },
            },
            "-=0.2",
          );
        }
      });
    };
    // Add it as a scroll event listener
    const handleScroll = () => fadeInUp();
    setTimeout(() => {
      handleScroll();
    }, 1000);
    // window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  let listImages = [
    "/images/rave/disco_top1.png",
    "/images/rave/disco_top2.png",
    "/images/rave/disco_top3.png",
    "/images/rave/disco_top4.png",
    "/images/rave/disco_top5.png",
    "/images/rave/disco_top6.png",
    "/images/rave/disco_top7.png",
    "/images/rave/disco_top8.png",
    "/images/rave/disco_top9.png",
    "/images/rave/disco_top10.png",
    "/images/rave/disco_top11.png",
    "/images/rave/disco_top12.png",
  ];
  const [selectedImage, setSelectedImage] = useState<number | null>(null); //(Math.floor(Math.random() * listImages.length));
  useEffect(() => {
    setSelectedImage(0);
    listImages = listImages.sort(() => Math.random() - 0.5);
    const interval = setInterval(() => {
      setSelectedImage(
        (prevIndex) => ((prevIndex ?? 0) + 1) % listImages.length,
      );
    }, 10000); // Change image every 10 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, [""]);

  const airdropRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (airdropRef.current) {
      gsap.fromTo(
        airdropRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1.5,
          delay: 1,
          ease: "power2.out",
          trigger: airdropRef.current,
          start: "top 80%",
          once: true,
        },
      );
    }
  }, []);

  const weekly = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (weekly.current) {
      gsap.fromTo(
        weekly.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          delay: 1.8,
          ease: "power2.out",
          trigger: weekly.current,
          start: "top 80%",
          once: true,
        },
      );
    }
  }, []);

  return (
    <div className="backface-hidden mx-auto max-w-[480px]">
      <div className="w-full">
        <div className="relative">
          <Particleground style="absolute" />

          <div className="img-frame">
            <div>
              {listImages.map((src, index) => (
                <Image
                  src={src}
                  key={index}
                  width={1000}
                  height={10000}
                  loading={index === 0 ? "eager" : "lazy"}
                  alt={`Slide ${index + 1}`}
                  className={`image-box image-s ${index == selectedImage ? "active" : ""}`}
                />
              ))}
            </div>
          </div>
          <div className="absolute top-4 flex w-full justify-center drop-shadow-[-25px_-10px_26px_rgba(0,0,0,80)]">
            <div className="w-11/12 text-[38px] font-black italic leading-[45.6px] text-white">
              <p className="fadeInUpText gradient-text">Daily Airdrop</p>
              <p className="fadeInUpText -mt-[4px] text-end gradient-text pr-2">Lucky Draw !!</p>
            </div>
          </div>
          <div className="fadeInUpText absolute bottom-13 mt-7 flex flex-col items-center justify-center text-center text-[15px] font-normal leading-[20px] text-white">
            <div ref={aprTriggerRef} className="w-11/12 flex justify-end py-[.2rem]">
              <span className="p-[.2rem_.4rem] text-[17px] text-center font-medium text-main border rounded-[8px] border-main bg-[rgba(0,0,0,0.4)]">
                Average APR — <span ref={aprTargetRef} data-from="0" data-to="82">0</span>% Rewards
              </span>
            </div>
            <p className="text-[15px] font-normal w-full p-[.2rem_1rem] bg-[#00000040] leading-[22px]">
              {t('RiseFlow')}
              {t('RiseFlow Description')}
            </p>
          </div>
        </div>
        <div className="relative mx-auto -mt-8.5 flex w-80 items-center rounded-full bg-white/35 px-2.5 py-2.5">
          <div className="mx-auto w-full rounded-full bg-white p-1">
            <ButtonDefault
              label={t('Airdrop')}
              onClick={() => onDraw()}
              customClasses="fadeInUpText airdrop-bg-custom text-white px-6 py-2 w-full h-full rounded-full relative text-[18px] button relative flex h-[80px] w-fullcursor-pointer items-center justify-center overflow-hidden"
              disabled={isButtonClicked}
            >
              <SendHorizontal className="absolute right-[5%] h-[20px] w-[20px]" />
              <div className="shiny absolute left-[-150%] top-[-200%] h-[500%] w-[70px] rotate-45 animate-[shine_3s_linear_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
            </ButtonDefault>
          </div>
        </div>
      </div>

      <div
        className="mt-4 flex items-stretch justify-between gap-1 px-4 text-[13px] leading-[15.73px] text-white h-full"
        ref={airdropRef}
      >
        <div className="mt-4 relative">
          <div className="grid grid-cols-3 gap-[.2rem] text-center text-white">
            <div className="flex flex-col items-center justify-center-safe">
              <Image
                width={40}
                height={40}
                src={"/images/icon/no-deposit-100.svg"}
                alt="icon"
              />
              <p className="text-[14px] font-normal text-main leading-[18px] mt-2">{t("No Deposit")}</p>
            </div>
            <div className="flex flex-col items-center justify-center-safe">
              <Image
                width={40}
                height={40}
                src={"/images/icon/transfer-crypto-100.svg"}
                alt="icon"
              />
              <p className="text-[14px] font-normal text-main leading-[18px] mt-2">{t("Transfer Money")}</p>
            </div>
            <div className="flex flex-col items-center justify-center-safe">
              <Image
                width={40}
                height={40}
                src={"/images/icon/all-free-100.svg"}
                alt="icon"
              />
              <p className="text-[14px] font-normal text-main leading-[18px] mt-2">{t("All Free")}</p>
            </div>
          </div>

          {/* Fixed horizontal line */}
          {/* <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#ff007f] mt-2"></div> */}

          <div className="grid grid-cols-3 gap-[.2rem] text-center text-white">
            <div className="flex flex-col items-center justify-center-safe">
              <p className="text-[12px] leading-[18px]">
                {t("No Crypto Required")}
              </p>
            </div>
            <div className="flex flex-col items-center justify-center-safe">
              <p className="text-[12px] leading-[18px]">
                {t("Airdrop Sent")}
              </p>
            </div>
            <div className="flex flex-col items-center justify-center-safe">
              <p className="text-[12px] leading-[18px]">
                {t("No Decrease")}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div
        className="m-4 rounded-lg border-[0.5px] border-[#666666]"
        ref={weekly}
        onClick={() => {
          router.push("/lottery-ticket");
        }}
      >
        <div className="p-2 text-center text-white">
          <p className="text-[13px] font-normal">
            {t(`Hold ${process.env.NEXT_PUBLIC_APP_NAME} Get Ticket`)}
          </p>
          <p className="inline-flex items-center justify-center gap-x-2">
            <Image
              className="mb-[-2px] rounded-full"
              src={`/images/logo/funky_trans_150_s.png`}
              alt="icon"
              height={18}
              width={18}
            />
            <span className="text-[20px] font-medium text-main mb-[-3px]">
              {tokenBalance.toLocaleString()}
            </span>
            <span className="mb-[-3px]">{process.env.NEXT_PUBLIC_APP_NAME}</span>
            <Image
              className="mb-[-2px] rounded-full"
              src={`/images/logo/chain-logo.svg`}
              alt="icon"
              height={16}
              width={16}
            />
          </p>
        </div>
      </div>
      <div className="m-6 text-center">
        <ButtonDefault
          label={t(`Explore ${process.env.NEXT_PUBLIC_APP_NAME} RAVE`)}
          leftIconFlag={true}
          onClick={() => {
            router.push("/funky-rave-learn");
          }}
          customClasses="bg-main-200 text-main py-2 w-3/6 rounded-full border-[0.5px] border-main text-sm shadow "
        ></ButtonDefault>
      </div>
      <AirdropPrize pageSize={20} />
      <div className="p-[1.5rem] flex justify-center text-center">
        <ButtonDefault
          label={t('Airdrop Prizes')}
          leftIconFlag={true}
          onClick={() => {
            router.push("/airdrop-prizes");
          }}
          customClasses="bg-main-200 text-main py-2 w-3/6 rounded-full border-[0.5px] border-main text-sm shadow "
        ></ButtonDefault>
      </div>
    </div>
  );
};

export default Dashboard;
