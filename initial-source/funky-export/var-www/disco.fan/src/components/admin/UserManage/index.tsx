"use client";
import React, { useCallback, useEffect, useState, useLayoutEffect } from "react";
import UserSearch from "./UserSearch";
import UserList from "./UserList";
import axios from "axios";
import { userData } from "@/types/userData";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/store";

const UserManage = () => {
  const router = useRouter();
  const { adminAuthState } = useAppSelector((state) => state.admin);

  const [userData, setUserData] = useState<userData[]>([]);
  const [filteredData, setFilteredData] = useState<userData[]>([]);

  const getUserInfoData = useCallback(async () => {
    try {
      const response = await axios.get("/api/admin/user/all");
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
        const response = await axios.post("/api/admin/user/lottery/ticket", {
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

    const fromCreated = fromCreatedDate ? new Date(fromCreatedDate) : null;
    const toCreated = toCreatedDate ? new Date(toCreatedDate) : null;
    const fromLogined = fromLoginedDate ? new Date(fromLoginedDate) : null;
    const toLogined = toLoginedDate ? new Date(toLoginedDate) : null;
    const fromReceived = fromReceivedDate ? new Date(fromReceivedDate) : null;
    const toReceived = toReceivedDate ? new Date(toReceivedDate) : null;

    const filtered = userData.filter((user) => {
      const createdDate = new Date(user.createdAt);
      const loginedDate = new Date(user.updatedAt);
      const receivedDate = user.PrizeTransactions?.[0]?.probability_time
        ? new Date(user.PrizeTransactions[0].probability_time)
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
        (!fromCount || user.experience >= Number(fromCount)) &&
        (!toCount || user.experience <= Number(toCount)) &&
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
      <h1 className="mb-2 text-2xl font-medium">User Management</h1>
      <UserSearch onSearch={handleSearch} />
      <UserList userData={filteredData} addLotteryTicket={addLotteryTicket} />
    </div>
  );
};

export default UserManage;
