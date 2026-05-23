"use client";
import React, { useCallback, useEffect, useState } from "react";
import {
  addressEllipsis,
  useWallet,
  useAccountBalance,
} from "@suiet/wallet-kit";
import getTokenBalance from "../../../../utils/getTokens";
import Image from "next/image";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

const Wallet = () => {
  const wallet = useWallet();
  const t = useTranslations('MyWallet')
  const ownedWalletAddress = wallet.account?.address;
  const [balance, setBalance] = useState<number | null>(null);
  const coinType =
    "0x1512fbf99602795c86a2a50bef34d1d6774bb1274cdc6cc21d2af0d6ea11aec9::disco::DISCO";
  const [isCopied, setIsCopied] = useState(false);
  const copyText = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast(t('CopyAddress'),
          {
            style: {
              borderRadius: '10px',
              background: '#333',
              color: '#fff',
            },
          }
        );

      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };
  const tokenBalance = useCallback(async () => {
    const discoToken = await getTokenBalance(ownedWalletAddress, coinType);
    console.log(discoToken);
    setBalance(parseInt(discoToken ?? "0"));
  }, [setBalance, ownedWalletAddress, coinType]);

  useEffect(() => {
    if (ownedWalletAddress) {
      tokenBalance();
    }
  }, [ownedWalletAddress, tokenBalance]);

  const shortenSuiAddress = (address: string) => {
    const start = address.substring(0, ((address.length / 2) - 12)); // Get the first characters
    const end = address.substring(address.length - ((address.length / 2) - 12)); // Get the last characters
    return `${start}.....${end}`;
  };

  const shortenSuiAddressForMobile = (address: string) => {
    const start = address.substring(0, 16); // Get first 6 characters
    const end = address.substring(address.length - 16); // Get last 6 characters
    return `${start}...${end}`;
  };

  const displaySuiBalance = (balanceInMist: number | null) => {
    const balanceNum = Number(balanceInMist);
    const balanceInSui = balanceNum / 1_000_000_000;
    return balanceInSui.toLocaleString(); // Display with 3 decimal places
  };

  return (
    <div className="mx-auto max-w-[480px]">
      <div className="px-3 pt-7">
        <div className="flex items-end justify-center">
          <p className="mb-2.5 text-[24px] leading-[28px] text-white normal">
            {t('My Wallet')}
          </p>
        </div>
        <div className="bg-[#1D1B20] px-3.5 py-5 mt-5 rounded-[8px]">
          <div className="">
            <p className="text-[15px] font-normal text-white">{t('My Address')}</p>
            <div className="relative mt-2 flex items-center rounded-lg justify-between bg-[#000000] px-5 py-2 text-sm text-[#00FFCC] h-[46px]">
              <p className="w-[90%] overflow-hidden">
                {wallet?.account ? (
                  <>
                    <span className="hidden sm:inline">{shortenSuiAddress(wallet.account.address)}</span>
                    <span className="inline sm:hidden">{shortenSuiAddressForMobile(wallet.account.address)}</span>
                  </>
                ) : (
                  "Loading..."
                )}
              </p>
              <Image
                width={18}
                height={18}
                src={"/images/icon/copy-b.png"}
                alt="icon"
                className="cursor-pointer"
                onClick={() => {
                  if (wallet?.account?.address)
                    copyText(wallet.account.address);
                }}
              />
            </div>
          </div>
          <div className="mt-6">
            <p className="text-[15px] font-normal text-white">{t('My DISCO Tokens')}</p>
            <div className="mt-2 flex justify-between rounded-lg bg-[#000000] px-5 py-3 text-[13px] text-white h-[46px]">
              <p>{t('Balance')}</p>
              <p className="text-[#FFFF33] text-base">{displaySuiBalance(balance)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

  );
};
export default Wallet;
