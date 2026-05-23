"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import ButtonDefault from "../Buttons/ButtonDefault";
import { SendHorizontal } from "lucide-react";
import {
  useAccountBalance,
  useSuiClient,
  useSuiProvider,
  useWallet,
} from "@suiet/wallet-kit";
import { Transaction } from "@mysten/sui/transactions";
import { NFT_MINT_PACKAGE_ID, NFT_PACKAGE_CONFIG_ID } from "../../config";
import AutoScrollCarousel from "./AutoScrollCarousel";
import ConnectWalletMessageModal from "../Lottery/ConnectWalletMessageModal";
import { useAppSelector } from "@/store/store";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslations } from "next-intl";

const OfficalDiscoNft = () => {
  const { authState, user_id } = useAppSelector((state) => state.user);
  const [connectWalletModal, setConnectWalletModal] = useState(false);
  const [nftCount, setNftCount] = useState<String>("0");
  const imageArr = Array.from({ length: 8 }, (_, index) => index + 1);
  const wallet = useWallet();
  const [mintFee, setMintFee] = useState(0);
  const [mintStatus, setMintStatus] = useState(false);
  const { error, loading, balance } = useAccountBalance();
  const provider = useSuiProvider(wallet.chain!.rpcUrl);
  const { getObject } = useSuiClient();
  const t = useTranslations('MembershipNFT');
  const decrement = () => {
    setNftCount((prev) => {
      if (Number(prev) > 0) {
        const updatedCount = Number(prev) - 1;
        // conditionMintStatus();
        return String(updatedCount); // Convert back to string
      }
      return prev; // Return the previous value if condition isn't met
    });
  };
  const getFeeAmount = async () => {
    const { data } = await provider.getObject({
      id: NFT_PACKAGE_CONFIG_ID,
      options: { showContent: true },
    });
    let fee = 1 * 1e9; // Default to 10000000000 if not found in package config
    setMintFee(Number(fee) / 1e9);
  };
  useEffect(() => {
    getFeeAmount();
  }, [provider, getFeeAmount]);

  useEffect(() => {
    const requiredAmount = mintFee * Number(nftCount) * 1e9;
    if (requiredAmount < Number(balance)) {
      setMintStatus(true);
    } else {
      setMintStatus(false);
    }
  }, [nftCount, setMintStatus, mintFee, balance]);

  // const conditionMintStatus = () => {
  //   const requiredAmount = mintFee * Number(nftCount) * 1e9;
  //   if (requiredAmount < Number(balance)) {
  //     setMintStatus(true);
  //   } else {
  //     setMintStatus(false);
  //   }
  //   console.log("mintStatus", mintStatus);
  // }

  const increment = () => {
    setNftCount((prev) => {
      const updatedCount = Number(prev) + 1;
      // conditionMintStatus();
      return String(updatedCount);
    });
  };

  const handleNftMint = async () => {
    if (!authState) {
      setConnectWalletModal(true);
      return;
    } else if (mintStatus === false) {
      alert("Insufficient balance");
      return;
    } else if (Number(nftCount) === 0) {
      alert("Please enter the number of NFTs you want to mint");
      return;
    }
    try {
      const tx = new Transaction();
      const payAmount = 1e9;

      const requiredAmount = mintFee * Number(nftCount) * 1e9;
      if (Number(balance) < requiredAmount) {
        alert("Insufficient balance");
        return;
      }
      tx.setGasBudget(requiredAmount);
      for (let i = 0; i < Number(nftCount); i++) {
        const [sui] = tx.splitCoins(tx.gas, [payAmount]);
        tx.moveCall({
          target: `${NFT_MINT_PACKAGE_ID}::sui_nft::mint`,
          arguments: [
            tx.object(NFT_PACKAGE_CONFIG_ID),
            tx.pure.string("test nft" + i),
            tx.pure.string("this field is for description" + i),
            tx.pure.string("https://ipfs.io/ipfs/QmeMh6arMC7n5Y9SSpvJw9P9ZRokoWAoHbh9VKgCDjMKaV"),
            sui,
          ]
        })
      }
      
      const result = await wallet.signAndExecuteTransaction({
        transaction: tx,
      });
      
      if (result) {
        console.log("result", result);
        alert("NFT minted successfully!");
        // Reset count after successful mint
        setNftCount("0");
      }
    } catch (error: any) {
      if (error.message?.includes("User rejected")) {
        alert("Transaction was rejected by user");
      } else {
        console.error("Minting error:", error);
        alert("Failed to mint NFT. Please try again.");
      }
    }
  };

  //start animation nft image fade in
  const mintStages = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (mintStages.current) {
      gsap.registerPlugin(ScrollTrigger);

      gsap.fromTo(
        mintStages.current,
        { opacity: 0, y: 50 }, // Start position
        {
          opacity: 1,
          y: 0, // End position
          duration: 1.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: mintStages.current,
            start: "top 80%", // Adjust trigger point
            end: "top 20%",
            scrub: 1, // Smooth animation on scroll
            toggleActions: "play none none reverse",
            // once: true
          },
        },
      );
    }
  }, []);

  const chicken = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (chicken.current) {
      gsap.registerPlugin(ScrollTrigger);

      gsap.fromTo(
        chicken.current,
        { opacity: 0, y: 50 }, // Start position
        {
          opacity: 1,
          y: 0, // End position
          duration: 2,
          delay: 2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: chicken.current,
            start: "top 80%", // Adjust trigger point
            end: "top 20%",
            scrub: 1,
            toggleActions: "play none none reverse",
            // once: true
          },
        },
      );
    }
  }, []);
  //end animation nft image fade in

  return (
    <div className="background overflow-hidden">
      <div className="mx-auto max-w-[480px]">
        <div className="z-10 px-3">
          <div className="space-y-[20px] pt-7">
            <div className="flex items-center justify-center">
              <p className="mb-2.5 text-[24px] leading-[28px] text-white normal">
                {/* Offical DISCO <span className="text-[#00FFCC]">N</span>FT */}
                {t('Membership NFT')}
              </p>
            </div>
            {/* <p className="text-[15px] font-normal leading-[22px] text-white/80">
              Our project team is committed to expanding the possibilities of
              blockchain and building a{" "}
              <span className="font-semibold leading-[22px] text-white">
                sustainable ecosystem
              </span>{" "}
              together with you. As part of this vision, we have created the{" "}
              <span className="font-semibold leading-[22px] text-white">
                DISCO Genesis NFT
              </span>
              , an asset of unique value.
            </p> */}
            <p className="text-[15px] font-normal leading-[22px] text-white/80">
              {t('Description')}
            </p>
            {/* <p className="mt-2 text-[15px] font-normal leading-[22px] text-white/80">
              This NFT is more than just a collectible—it serves as a{" "}
              <span className="font-semibold leading-[22px] text-white">
                digital membership
              </span>{" "}
              for our early investors, providing an enriched service experience.
            </p> */}
            <p className="mt-2 text-[15px] font-normal leading-[22px] text-white/80">
              {t('NFT Description')}
            </p>
            <AutoScrollCarousel imageURL="/images/new_nfts/disco_nft_0212_test_01/" />
            <div className="text-[15px] leading-[22px] text-white">
              <p className="mb-2 font-semibold text-[#00FFCC]">
                {t('A One-of-a-Kind Original NFT')}
              </p>
              <p className="font-normal text-white/80">
                {t('NFT Uniqueness')}
              </p>
            </div>
            <AutoScrollCarousel imageURL="/images/new_nfts/disco_nft_0212_test_02/" />
            <AutoScrollCarousel imageURL="/images/new_nfts/disco_nft_0212_test_03/" />
            <div className="mt-4 flex flex-col p-0" ref={mintStages}>
              <div className="mt-7 h-auto w-full  rounded-t-[8px] bg-[#00FFCC] py-[0.5rem]">
                <p className="text-center text-[18px] font-semibold text-[#1D1B20]">
                  {t('MintStages')}
                </p>
              </div>
              <div
                className="h-auto w-full rounded-b-[8px] border-[0.5px] border-[#00FFCC] bg-cover bg-center bg-no-repeat px-4 py-8 text-[16px] leading-[28px] text-white"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('/images/new_nfts/nft_background.png')",
                }}
              >
                <div className="m-0 p-0 heading-[28px]" ref={chicken}>
                  <p className="mb-4 text-center text-[26px] font-semibold text-white">
                    {t('Chicken')}
                  </p>
                  <p className="text-[16px] font-semibold heading-[28px] text-white">
                    {t('Chicken Description')}
                  </p>
                  <p className="text-[16px] font-semibold heading-[28px] text-white">
                    {t('Limited Edition')}
                  </p>
                  <p className="text-[16px] font-semibold heading-[28px] text-white">
                    {t('Invitation')}
                  </p>
                </div>
              </div>
            </div>
            <div className="m-0 h-[0.3rem] w-full p-0"></div>
            <div
              className="rounded-[8px] border-[0.5px] border-[#666666] bg-[#1D1B20] px-4.5 pb-6 pt-5"
              style={{ marginBottom: 50 }}
            >
              <div>
                <div className="flex items-center gap-x-2 text-white">
                  <div className="pulsing-dot flex"></div>
                  <p>{t('TotalMinted')}</p>
                  <p className="text-[#00FFCC]">45%</p>
                  <p className="text-[#838584]">( 468 / 1000 )</p>
                </div>
                <div className="mt-2.5 rounded-[10px] bg-[#333333]">
                  <div className="relative h-[16px] w-[45%] rounded-[10px] border-y-[0.5px] border-white bg-[#00FFCC]">
                    <p className="absolute right-1.5 text-[10px] leading-[12.1px] text-black">
                      45%
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5">
                <p className="text-[15px] font-semibold text-white">
                  {t('MINT PRICE')}
                </p>
                <p className="text-2xl font-semibold leading-[29.36px] text-[#00FFCC]">
                  {mintFee}{" "}
                  <span className="text-[16px] leading-[20px] text-[#ffffff]">SUI</span>
                </p>
                <div className="my-4.5 flex items-center justify-between rounded-[8px] border-[0.5px] border-[#666666] bg-black px-3 py-2.5">
                  <div className="broder-[0.5px] flex items-center gap-x-3 rounded-[8px] border-[#666666] bg-[#7878803D] px-[15px] py-[5px]">
                    <div
                      className="flex h-[22px] items-center"
                      onClick={() => {
                        decrement();
                      }}
                    >
                      <Image
                        width={18}
                        height={22}
                        src={"/images/icon/Decrement.svg"}
                        alt="icon"
                      />
                    </div>
                    <div className="h-[18px] w-[1px] bg-[#EBEBF54D]"></div>
                    <div
                      onClick={() => {
                        increment();
                      }}
                    >
                      <Image
                        width={18}
                        height={22}
                        src={"/images/icon/Increment.svg"}
                        alt="icon"
                      />
                    </div>
                  </div>
                  <p className="text-2xl leading-[22px] text-[#FFFF33]">
                    {nftCount}
                  </p>
                </div>
                <ButtonDefault
                  label={t("MINT NOW")}
                  onClick={handleNftMint}
                  // customClasses={`text-black w-full py-2 rounded-full text-sm font-medium shadow-2 relative ${mintStatus ? 'bg-[#00FFCC]' : 'bg-[#666666]'}`}
                  customClasses={`text-black w-full py-2 rounded-full text-mm font-semibold shadow-2 relative bg-[#00FFCC]`}
                // disabled={!mintStatus}
                >
                  <SendHorizontal
                    width={20}
                    height={20}
                    className="absolute right-5"
                  />
                </ButtonDefault>
              </div>
            </div>
            <AutoScrollCarousel imageURL="/images/new_nfts/disco_nft_0212_test_04/" />
            <div className="text-[15px] leading-[22px] text-white">
              <p className="mb-2 font-semibold text-[#00FFCC]">
                {t('Exclusive Benefits')}
              </p>
              <p className="mb-2 font-semibold text-white">
                {t('Airdrop Lottery Tickets')}
              </p>
              <p className="font-normal text-white/80">
                {t('Airdrop Description')}
              </p>
            </div>
            <div className="text-[15px] leading-[22px] text-white">
              <p className="mb-2 font-semibold text-white">
                {t('Fan Points Increase')}
              </p>
              <p className="font-normal text-white/80">
                {t('Fan Points Description')}
              </p>
            </div>
            <div className="text-[15px] leading-[22px] text-white">
              <p className="mb-2 font-semibold text-white">
                {t('Governance Voting Rights')}
              </p>
              <p className="font-normal text-white/80">
                {t('Governance Description')}
              </p>
            </div>
            <div className="text-[15px] leading-[22px] text-white">
              <p className="mb-2 font-semibold text-white">
                {t('Priority Access')}
              </p>
              <p className="font-normal text-white/80">
                {t('Priority Description')}
              </p>
            </div>
            <AutoScrollCarousel imageURL="/images/new_nfts/disco_nft_0212_test_05/" />
            <AutoScrollCarousel imageURL="/images/new_nfts/disco_nft_0212_test_06/" />
            <div className="text-[15px] leading-[22px] text-white">
              <p className="mb-2 font-semibold text-[#00FFCC]">
                {t('Revenue Utilization')}
              </p>
              <p className="font-normal text-white/80">
                {t('Revenue Description')}
              </p>
            </div>
            <div className="text-[15px] leading-[22px] text-white">
              <p className="mb-2 font-semibold text-[#00FFCC]">
                {t('Limited Supply')}
              </p>
              <p className="font-normal text-white/80">
                {t('Supply Description')}
              </p>
            </div>
            <AutoScrollCarousel imageURL="/images/new_nfts/disco_nft_0212_test_07/" />
            <div className="text-[15px] leading-[22px] text-white">
              <p className="font-normal text-white/80">
                {t('Closing Statement')}
              </p>
            </div>
          </div>
        </div>
      </div>
      <ConnectWalletMessageModal
        isOpen={connectWalletModal}
        isDismissable={true}
        onClose={() => {
          setConnectWalletModal(false);
        }}
      />
    </div>
  );
};
export default OfficalDiscoNft;
