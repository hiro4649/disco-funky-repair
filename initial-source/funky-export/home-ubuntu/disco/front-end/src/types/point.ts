export type point = {
    reason: number; // 1: Daily Bonus, 2: Prize Bonus, 3: NFT Bonus
    id: number;
    userId: number;
    point: string;
    receivedDate: Date;
};
