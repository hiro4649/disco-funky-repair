import { z } from "zod";
import { isAddress } from "ethers";

const WalletSchema = z.object({
    wallet_address: z.string().refine(
        (address) => isAddress(address),
        { message: "Invalid Ethereum address" }
    ),
});
export default WalletSchema;