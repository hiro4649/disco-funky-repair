import { prizeTransactions } from "./prizeTransactions";

export type userData = {
    id: number;
    wallet_address: string;
    createdAt: string;
    updatedAt: string;
    tickets: number;
    experience: number;
    PrizeTransactions: prizeTransactions[];
    ownedToken: ownedToken[];
};
  
export type ownedToken = {
    id: number;
    userId: number;
    sixHourTokenBalance: number;
    tallyTokenBalance: number;
}