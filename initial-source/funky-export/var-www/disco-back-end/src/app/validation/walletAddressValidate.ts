import { z } from "zod";
import { isValidSuiAddress } from "./isValidSuiAddess";

const WalletSchema = z.object({
    wallet_address: z.string().refine(
        (address) => isValidSuiAddress(address),
        { message: "Invalid Sui wallet address" }
    ),
});
export default WalletSchema;