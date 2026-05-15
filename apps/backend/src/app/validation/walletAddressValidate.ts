import { z } from "zod";
import { isAddress } from "ethers";

const WalletSchema = z.object({
    wallet_address: z.string().refine(
        (address) => isAddress(address),
        { message: "Invalid Ethereum address" }
    ),
});

export const WalletNonceRequestSchema = WalletSchema.extend({
    domain: z.string().trim().min(1).max(255).optional(),
    chainId: z.union([z.string(), z.number()]).optional(),
});

export const WalletSignatureLoginSchema = WalletSchema.extend({
    message: z.string().min(1).max(2000),
    signature: z.string().regex(/^0x[0-9a-fA-F]{130}$/, "Invalid wallet signature"),
});

export default WalletSchema;
