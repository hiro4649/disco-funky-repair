import { Prize } from "./prizeHistory";

export type prizeTransactions = {
    id: number;
    userId: number;
    prizeId: number;
    probability_time: string;
    status: string,
    prize: Prize;
}

