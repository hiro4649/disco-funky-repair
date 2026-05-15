// src/hooks/useUserBalance.ts
import { useState, useCallback } from 'react';
import axiosServices from '../../../../utils/apiClient';
import { useAppKitAccount } from "@reown/appkit/react";

export function useUserBalance() {
  const { isConnected, address } = useAppKitAccount();
  const [discoBalance, setDiscoBalance] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchBalance = useCallback(async () => {
    if (!address || !isConnected) return;
    setLoading(true);
    try {
      const res = await axiosServices.get(`/user-manage/balance/${address}`);
      if (res.data.success) {
        setDiscoBalance(res.data.data.balance || 0);
      }
    } catch (error) {
      console.error(`Error fetching ${process.env.NEXT_PUBLIC_APP_NAME} balance:`, error);
      setDiscoBalance(0);
    } finally {
      setLoading(false);
    }
  }, [address, isConnected]);

  return {
    discoBalance,
    loading,
    fetchBalance,
  };
}
