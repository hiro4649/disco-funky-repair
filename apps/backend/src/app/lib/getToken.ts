import { etherscanRateLimiter } from "../utils/rateLimiter";
import { ETHERSCAN_API_URL, ETHERSCAN_API_KEY } from "../config/env";
import { safeLogError } from "../utils/safeLogger";
import { fetchJsonWithTimeout } from "../utils/externalCallTimeout";

/**
 * Get ERC20 token balance using Etherscan API V2 (with chainid)
 */
async function getTokenBalance(
  walletAddress: string,
  tokenAddress?: string
): Promise<number> {
  if (!walletAddress) {
    throw new Error("Wallet address is required");
  }
  if (!ETHERSCAN_API_KEY) {
    throw new Error("Missing ETHERSCAN_API_KEY");
  }

  // Wait for rate limit before making request
  await etherscanRateLimiter.waitForRateLimit();
  const apiUrl = `${ETHERSCAN_API_URL}&module=account&action=tokenbalance&contractaddress=${tokenAddress}&address=${walletAddress}&tag=latest&apikey=${ETHERSCAN_API_KEY}`;
  try {
    const data = await fetchJsonWithTimeout<any>(
      apiUrl,
      {},
      undefined,
      "etherscan_token_balance"
    );
    if (data.status !== "1") {

        throw new Error(data.result || "Etherscan returned error");
    }

    // result is string (wei units)
    return Number(data.result);

  } catch (err) {
    safeLogError("get_token_balance", err, {
      walletAddressPrefix: walletAddress.slice(0, 10),
      tokenAddressPrefix: tokenAddress?.slice(0, 10)
    });
    throw new Error("Error fetching ERC20 token balance");
  }
}

export default getTokenBalance;
