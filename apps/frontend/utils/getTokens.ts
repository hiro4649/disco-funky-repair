import { ethers, formatUnits } from 'ethers';

const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)'
];

async function getTokenBalance(walletAddress?: string, tokenAddress?: string) {
  if (!walletAddress) throw new Error('Wallet address is required');
  if (!tokenAddress) throw new Error('Token address is required');

  try {
    const rpcUrl = process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL || process.env.NEXT_PUBLIC_RPC_URL;
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    const balance: bigint = await contract.balanceOf(walletAddress);
    const decimals = await contract.decimals();
    const uiBalance = formatUnits(balance, decimals);
    return uiBalance;
  } catch (error) {
    console.error('Error fetching ERC-20 token balance:', error);
    return null;
  }
}

export default getTokenBalance;
