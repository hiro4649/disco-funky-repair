export type point = {
    reason: number; // 1: Daily Bonus, 2: Prize Bonus, 3: NFT Bonus, 4: Referral Bonus
    id: number;
    userId: number;
    point: string;
    receivedDate: Date;
};
