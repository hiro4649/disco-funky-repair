"use client";
import React, { useCallback, useEffect, useState, useLayoutEffect } from "react";
import moment from "moment";
import UserSearch from "./UserSearch";
import UserList from "./UserList";
import { userData } from "@/types/userData";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/store";
import apiClient from "../../../../utils/apiClient";
import { useTranslations } from 'next-intl';

const UserManage = () => {
  const t = useTranslations('Admin');
  const router = useRouter();
  const { adminAuthState } = useAppSelector((state) => state.admin);

  const [userData, setUserData] = useState<userData[]>([]);
  const [filteredData, setFilteredData] = useState<userData[]>([]);

  const getUserInfoData = useCallback(async () => {
    try {
      const response = await apiClient.get("/admin/user/all");
      if (response.status === 200) {
        setUserData(response.data.data);
        setFilteredData(response.data.data);
      }
    } catch (e) {
      console.error("Error fetching user data:", e);
    }
  }, []);

  const addLotteryTicket = useCallback(
    async (id: number, ticketCount: number) => {
      try {
        const response = await apiClient.post("/admin/user/lottery/ticket", {
          id,
          ticketCount,
        });

        if (response.status === 200) {
          getUserInfoData();
        }
      } catch (e) {
        console.error("Error adding lottery ticket:", e);
      }
    },
    [getUserInfoData]
  );

  useEffect(() => {
    if (adminAuthState) {
      getUserInfoData();
    }
  }, [getUserInfoData, adminAuthState]);

  const handleSearch = (searchParams: any) => {
    const {
      fromCreatedDate,
      toCreatedDate,
      fromLoginedDate,
      toLoginedDate,
      fromReceivedDate,
      toReceivedDate,
      fromTicketCount,
      toTicketCount,
      fromTokenCount,
      toTokenCount,
      fromTotalTokenCount,
      toTotalTokenCount,
      fromCount,
      toCount,
      walletAddress,
    } = searchParams;

    const fromCreated = fromCreatedDate ? moment.utc(fromCreatedDate) : null;
    const toCreated = toCreatedDate ? moment.utc(toCreatedDate) : null;
    const fromLogined = fromLoginedDate ? moment.utc(fromLoginedDate) : null;
    const toLogined = toLoginedDate ? moment.utc(toLoginedDate) : null;
    const fromReceived = fromReceivedDate ? moment.utc(fromReceivedDate) : null;
    const toReceived = toReceivedDate ? moment.utc(toReceivedDate) : null;

    const filtered = userData.filter((user) => {
      const createdDate = moment.utc(user.createdAt);
      const loginedDate = moment.utc(user.updatedAt);
      const receivedDate = user.PrizeTransactions?.[0]?.probability_time
        ? moment.utc(user.PrizeTransactions[0].probability_time)
        : null;

      return (
        // Filter by Created Date
        (!fromCreated || createdDate >= fromCreated) &&
        (!toCreated || createdDate <= toCreated) &&
        // Filter by Logined Date
        (!fromLogined || loginedDate >= fromLogined) &&
        (!toLogined || loginedDate <= toLogined) &&
        // Filter by Lottery Ticket Received Date
        (!fromReceived || (receivedDate && receivedDate >= fromReceived)) &&
        (!toReceived || (receivedDate && receivedDate <= toReceived)) &&
        // Filter by Lottery Ticket Count
        (!fromTicketCount || user.tickets >= Number(fromTicketCount)) &&
        (!toTicketCount || user.tickets <= Number(toTicketCount)) &&
        // Filter by Experience Count
        (!fromCount || user.fan_points >= Number(fromCount)) &&
        (!toCount || user.fan_points <= Number(toCount)) &&
        // Filter by Token Count (Ensure ownedToken exists before accessing properties)
        (!fromTokenCount ||
          (user.ownedToken?.[0]?.sixHourTokenBalance !== undefined &&
            user.ownedToken[0].sixHourTokenBalance >= Number(fromTokenCount))) &&
        (!toTokenCount ||
          (user.ownedToken?.[0]?.sixHourTokenBalance !== undefined &&
            user.ownedToken[0].sixHourTokenBalance <= Number(toTokenCount))) &&
        // Filter by Total Token Count
        (!fromTotalTokenCount ||
          (user.ownedToken?.[0]?.tallyTokenBalance !== undefined &&
            user.ownedToken[0].tallyTokenBalance >= Number(fromTotalTokenCount))) &&
        (!toTotalTokenCount ||
          (user.ownedToken?.[0]?.tallyTokenBalance !== undefined &&
            user.ownedToken[0].tallyTokenBalance <= Number(toTotalTokenCount))) &&
        // Filter by Wallet Address (Ensure wallet_address is not null before checking includes)
        (!walletAddress || (user.wallet_address && user.wallet_address.includes(walletAddress)))
      );
    });

    setFilteredData(filtered);
  };

  return (
    <div>
      <h1 className="mb-2 text-2xl font-medium">{t('User Management')}</h1>
      <UserSearch onSearch={handleSearch} />
      <UserList userData={filteredData} addLotteryTicket={addLotteryTicket} />
    </div>
  );
};

export default UserManage;
