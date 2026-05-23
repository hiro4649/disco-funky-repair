import dotenv from 'dotenv';
dotenv.config();

export const jwt_secret = process.env.JWT_SECRET;

export const adminWalletAddress = process.env.ADMIN_WALLET_ADDRESS;
export const discoCoinType = process.env.DISCO_COIN_TYPE;
export const platformKeypair = process.env.PLAT_FORM_KEY_PAIR;
export const REGISTER_ALLTOKEN_ADMIN = process.env.REGISTER_ALLTOKEN_ADMIN;
export const SUIVERSION_API_URL = process.env.SUIVERSION_API_URL;
export const SUIVERSION_API_KEY = process.env.SUIVERSION_API_KEY;
export const BLOCKBERRY_API_URL = process.env.BLOCKBERRY_API_URL;
export const BLOCKBERRY_API_KEY = process.env.BLOCKBERRY_API_KEY;
