"use client";
import React, { useState, useCallback, useEffect, useRef } from "react";
import { CircleAlert, SendHorizontal } from "lucide-react";
import AirdropPrizeCell from "./AirdropPrizeCell";
import UserLevelRewardModal from "./UserLevelRewardModal";
import { useDisclosure } from "@nextui-org/modal";
import AirdropIcon from "../common/icons/airdrop";
import ButtonDefault from "../Buttons/ButtonDefault";
import { useRouter } from "next/navigation";
import { prizelist } from "@/types/prizelist";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { setCreateLoading } from "@/store/slices/adminSlice";
import { setLoading, setItems } from "@/store/slices/airdropItemSlice";
import PrizeDescriptionModal from "./PrizeDescriptionModal";
import gsap from "gsap";
import { useTranslations } from 'next-intl';
import apiClient from "../../../utils/apiClient";
const AirdropPrize: React.FC<{ pageSize?: number }> = (data) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();
  const createdLoading = useAppSelector((state) => state.admin.createLoading);
  const { items: airdropItems } = useAppSelector((state) => state.airdropItem);
  const dispatch = useAppDispatch();
  const [addClass, setAddClass] = useState<string>('opacity-0 -translate-x-100');
  const [time, setTime] = useState<string>('');

  const [prizeList, setPrizeList] = useState<prizelist[]>([]);
  const [showId, setShowId] = useState<number>();
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const t = useTranslations('AirdropPrizes');

  const [showModal, setShowModal] = useState(false);

  const getAirdropData = useCallback(async () => {
    // Check if we already have data in the store
    if (airdropItems.length > 0) {
      // Use existing data from store
      let displayData = [...airdropItems];
      if (data.pageSize) {
        displayData = displayData.slice(0, data.pageSize);
      }
      setPrizeList(displayData);
      dispatch(setCreateLoading(false));
      setTime(getRoundedTime());
      return;
    }

    // Fetch new data if store is empty
    dispatch(setLoading(true));
    await apiClient
      .get(`/airdrop/prize`)
      .then((res) => {
        if (res.data.success == true) {
          let sortedValue: prizelist[] = res.data.data
            .sort((a: prizelist, b: prizelist) => {
              return Number(b.quantity) - Number(a.quantity);
            })
            .map((item: prizelist) => {
              return {
                ...item,
                fake_probability: (0.7 + Math.random() * 0.7) * Number(item.probability),
              };
            });
          const adjustedSum = sortedValue.reduce((sum, value) => sum + (value.fake_probability ?? 0), 0);

          // Scale the values to make the total sum equal to 100
          let scaled = sortedValue.map(value => {
            return {
              ...value,
              fake_probability: ((value.fake_probability ?? 0) / adjustedSum) * 100
            }
          });
          
          // Store the full dataset in Redux
          dispatch(setItems(scaled));
          
          // Set display data with pageSize limit
          let displayData = scaled;
          if (data.pageSize) {
            displayData = displayData.slice(0, data.pageSize);
          }
          setPrizeList(displayData);
          dispatch(setCreateLoading(false));
          dispatch(setLoading(false));
        }
        setTime(getRoundedTime());
      })
      .catch((err) => {
        console.log(err);
        dispatch(setLoading(false));
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, airdropItems.length, data.pageSize]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const getRoundedTime = (): string => {
    const now = new Date();
    const minutes = Math.floor(now.getUTCMinutes() / 5) * 5;
    now.setUTCMinutes(minutes);
    now.setUTCSeconds(0);
    now.setUTCMilliseconds(0);

    // Format the time as MM/DD HH:mm
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const day = String(now.getUTCDate()).padStart(2, '0');
    const hours = String(now.getUTCHours()).padStart(2, '0');
    const minutesStr = String(now.getUTCMinutes()).padStart(2, '0');

    return `${month}/${day} ${hours}:${minutesStr}`;
  }

  const openPrizeDescriptionsModal = (id: number) => {
    setShowId(id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  useEffect(() => {
    if (createdLoading) {
      getAirdropData();
    }
    getAirdropData();
  }, [getAirdropData, createdLoading]);

  useEffect(() => {
    const intervalId = setInterval(async () => {
      await getAirdropData();
    }, 300000); // 300,000 ms = 5 minutes

    return () => clearInterval(intervalId); // Clean up on unmount
  }, [getAirdropData, getRoundedTime]);



  useEffect(() => {
    const fadeInLeft = () => {
      const elements = document.querySelectorAll(".airdrop-fade-in-left");
      const tl = gsap.timeline();
      elements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        if (rect.top <= window.innerHeight - 100) {
          tl.fromTo(
            element,
            { opacity: 0, x: -100, duration: 0.1, ease: "power1.in" },
            {
              opacity: 1, x: 0, duration: 0.1, ease: "power1.out", onStart: () => {
                element.classList.remove("airdrop-fade-in-left"); // Prevent duplicate animations
              },
            },
            "+=0.2"
          );
        }
      });
    };


    // Add it as a scroll event listener
    const handleScroll = () => fadeInLeft();
    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [prizeList]);

  return (
    <div className="mx-auto max-w-[480px]">
      <div className="px-3">
        <div className="space-y-4 pt-7">
          <div className="flex items-center justify-center">
            <p className="mb-2.5 text-[24px] leading-[28px] text-white normal">
              {/* Airdrop <span className="text-[#00FFCC]">P</span>rizes */}
              {t('Airdrop Prizes')}
            </p>
          </div>
          <div className="flex text-[13px] leading-[9px] justify-end">
            <div className="flex pulsing-dot mt-[2px]"></div>
            <div className="flex text-white font-serif">
              <p>&nbsp;&nbsp;{t('Last updated')}</p>
              <p className="text-[#00FFCC]">&nbsp;{time}&nbsp;</p>
              <p>(UTC) </p>
            </div>
          </div>

          <div className="space-y-4">
            {prizeList.map((item, index) => (
              <div key={index} ref={(el) => { itemsRef.current[index] = el }}><AirdropPrizeCell
                item={item}
                key={index}
                index={index}
                onClick={() => console.log(prizeList)}
                openModal={() => openPrizeDescriptionsModal(index)}
                addClass={addClass}
              /></div>
            ))}
          </div>
        </div>
        {/* <ButtonDefault
          label="Get DISCO Tokens"
          onClick={() => {
            router.push("/prize-history");
          }}
          customClasses="bg-[#00FFCC] text-black font-medium px-6 py-2 w-full h-full rounded-full mt-9 relative"
        >
          <SendHorizontal className="absolute right-5 h-[20px] w-[20px]" />
        </ButtonDefault> */}
      </div>
      <PrizeDescriptionModal
        isOpen={showModal}
        onClose={closeModal}
        prizes={prizeList}
        showId={showId}
      />
      <UserLevelRewardModal isOpen={isOpen} onOpen={onOpen} onClose={onClose} />
    </div>
  );
};

export default AirdropPrize;
