export type prizeHistory = {
    id: number,
    probability_time: string;
    status: string;
    prize: Prize;
    tx_hash: string;
    end_time: string;
    clickStatus: boolean
};

export enum PrizeStatus {
    ready,
    sending,
    received,
}

export type Prize = {
    id: number,
    token_name: string;
    symbol: string;
    icon: string;
    quantity: number;
    price: number
    probability: number;
    ca: string;
    telegram: string;
    twitter: string;
    default_image: string;
}
