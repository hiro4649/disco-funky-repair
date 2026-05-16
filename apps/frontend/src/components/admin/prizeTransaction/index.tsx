"use client"
import React, { useCallback, useEffect, useState } from "react";
import { prizeTransactions } from "@/types/prizeTransactions";
import PrizeTransactionCell from '@/components/admin/prizeTransaction/prizeTransactionCell';
import apiClient from "../../../../utils/apiClient";

const PrizeTransaction = (props: { wallet_address: string }) => {
    const [transaction, setTransaction] = useState<prizeTransactions[]>([]);
  const getUserPrizeTransaction = useCallback(async () => {
    try {
      const transaction = await apiClient.get(
        `/admin/user/transaction/${props.wallet_address}`,
      );
      if (transaction.status == 200) {
        setTransaction(transaction.data.data);
      }
    } catch (err) {
      console.log(err);
    }
  }, [props.wallet_address]);

  useEffect(() => {
    getUserPrizeTransaction();
  }, [getUserPrizeTransaction])

  return (
    <div className="my-10">
        <div className="space-y-2">
            {transaction.length > 0 ? transaction.map((item, index) => (<PrizeTransactionCell item={item} index={index} key={index} />)) : 'No Date'}
        </div>
    </div>
  );
};
export default PrizeTransaction;
