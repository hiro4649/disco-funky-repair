import { etherscanRateLimiter } from "../utils/rateLimiter";
import { ETHERSCAN_API_URL, ETHERSCAN_API_KEY } from "../config/env";

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
    const resp = await fetch(apiUrl);
    const data = await resp.json();
    if (data.status !== "1") {
        console.log("Error", data.result)
        throw new Error(data.result || "Etherscan returned error");
    }

    // result is string (wei units)
    return Number(data.result);
    
  } catch (err) {
    console.error("Error fetching ERC20 balance via Etherscan:", err);
    throw new Error("Error fetching ERC20 token balance");
  }
}

export default getTokenBalance;
