import React, { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { resetUser, setAuthstate, setConnectBonus, setUserId, setWalletAddress, setLotteryTicket, setClaimTickets, setFanPoints, setSixHourTokenBalance, setTallyTokenBalance } from '@/store/slices/userSlice';
import apiClient from '../../utils/apiClient';
import { BrowserProvider, Contract, Eip1193Provider, formatUnits, JsonRpcProvider } from "ethers";
import { NFT_ABI } from "@/utils/constant";
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react';
import { usePathname, useRouter } from 'next/navigation';

interface UserData {
  user_id: number;
  address: string;
}

interface UserResponse {
  success: boolean;
  user: UserData;
}

interface AuthContextType {
  ethPrice: number;
  isAuthenticated: boolean;
  user: UserData | null;
  loading: boolean;
  error: string | null;
  login: (wallet_address: string, referralCode?: string | null) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const dispatch = useAppDispatch();
  const { authState } = useAppSelector((state) => state.user);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [ethPrice, setEthPrice] = useState<number>(0);
  const { isConnected, status } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider("eip155");
  const router = useRouter();
  const pathname = usePathname();
  const protectedRoutes = ['/ticket-code', '/my-wallet', '/referral-link'];

  const getETHPrice = async (retries = 0) => {
    try {
      const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;
      const nftAddress = process.env.NEXT_PUBLIC_NFT_ADDRESS;
      if (!rpcUrl || !nftAddress) {
        setEthPrice(0);
        return;
      }

      const ethersProvider = new JsonRpcProvider(rpcUrl);
      const contract = new Contract(nftAddress, NFT_ABI, ethersProvider);
      const price: bigint = await contract.getPrice();
      setEthPrice(Number(formatUnits(price, 8)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch ETH price');
      if (retries < 3) {
        console.log('Backend is updating, waiting 5 seconds before retry...');
        setTimeout(() => getETHPrice(retries + 1), 3000);
      } else {
        setEthPrice(1000);
      }
    }
  }

  useEffect(() => {
    getETHPrice();
  }, []);

  useEffect(() => {
    if (!isConnected && protectedRoutes.includes(pathname) && status !== 'reconnecting' && status !== 'connecting') {
      router.push('/');
    }
  }, [isConnected, pathname]);

  useEffect(() => {
    if (!isConnected && status !== 'reconnecting' && status !== 'connecting') {
      dispatch(setConnectBonus(true));
    }
  }, [isConnected, status]);

  // Helper function to retry failed API calls with exponential backoff
  const retryWithBackoff = async <T,>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> => {
    let lastError: any;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        if (attempt < maxRetries - 1) {
          const delay = baseDelay * Math.pow(2, attempt); // Exponential backoff: 1s, 2s, 4s
          console.warn(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    throw lastError;
  };

  // Fetch user data from /user/verify endpoint
  const fetchUserData = async () => {
    try {
      const response = await apiClient.get<UserResponse>('/user/verify');
      if (response.status !== 400 && response.data.success) {
        const userData = response.data.user;
        setUserData(userData);
        dispatch(setUserId(userData.user_id));
        dispatch(setWalletAddress(userData.address));
        dispatch(setAuthstate(true));

        // Fetch additional user info after successful verification with retry logic
        try {
          console.log('📊 Fetching user balance data...');

          const userInfoResponse = await retryWithBackoff(
            () => apiClient.post('/user/info', { user_id: userData.user_id }),
            3, // Max 3 retries
            1000 // Start with 1 second delay
          );

          if (userInfoResponse.status === 200 && userInfoResponse.data.success) {
            const { data } = userInfoResponse.data;

            // Dispatch all user info to Redux store
            dispatch(setLotteryTicket(data.tickets || 0));
            dispatch(setClaimTickets(data.claimTickets || 0));
            dispatch(setFanPoints(data.fan_points || 0));
            dispatch(setSixHourTokenBalance(data.sixHourTokenBalance || 0));
            dispatch(setTallyTokenBalance(data.tallyTokenBalance || 0));

            console.log('✅ User balance data loaded successfully:', {
              tickets: data.tickets || 0,
              claimTickets: data.claimTickets || 0,
              fan_points: data.fan_points || 0
            });
          } else {
            console.error('❌ User info API returned unsuccessful response:', userInfoResponse.data);
          }
        } catch (userInfoError: any) {
          console.error('❌ Error fetching user info after retries:', userInfoError);
          console.error('   User will appear logged in but balance data may be incomplete');
          console.error('   Response:', userInfoError.response?.data);

          // Still set default values so Redux is in consistent state
          dispatch(setLotteryTicket(0));
          dispatch(setClaimTickets(0));
          dispatch(setFanPoints(0));
          dispatch(setSixHourTokenBalance(0));
          dispatch(setTallyTokenBalance(0));
        }

        return true;
      } else {
        dispatch(setAuthstate(false));
        setUserData(null);
        return false;
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      dispatch(setAuthstate(false));
      setUserData(null);
      return false;
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        await fetchUserData();
      } catch (err) {
        console.error('Auth initialization error:', err);
        dispatch(setAuthstate(false));
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [dispatch]);

  // Login function
  const login = useCallback(async (wallet_address: string, referralCode?: string | null): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      if (!walletProvider) {
        throw new Error('Wallet provider is not available');
      }

      const ethersProvider = new BrowserProvider(walletProvider as Eip1193Provider);
      const network = await ethersProvider.getNetwork();
      const signer = await ethersProvider.getSigner();
      const signerAddress = (await signer.getAddress()).toLowerCase();
      const walletAddress = wallet_address.toLowerCase();

      if (signerAddress !== walletAddress) {
        throw new Error('Connected wallet does not match login wallet');
      }

      const nonceResponse = await apiClient.post('/user/auth/nonce', {
        wallet_address: walletAddress,
        domain: typeof window !== 'undefined' ? window.location.host : undefined,
        chainId: network.chainId.toString()
      });

      const message = nonceResponse.data.message;
      const signature = await signer.signMessage(message);
      const res = await apiClient.post('/user/signup', {
        wallet_address: walletAddress,
        message,
        signature,
        ...(referralCode ? { referralCode } : {})
      });
      if (res.data.success) {
        // After successful signup, fetch user data
        const success = await fetchUserData();
        setLoading(false);
        return success;
      }
      setLoading(false);
      return false;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Authentication failed';
      setError(errorMessage);
      setLoading(false);
      return false;
    }
  }, [walletProvider]);

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      await apiClient.get('/user/logout');
      dispatch(resetUser());
      setUserData(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Token refresh function
  const refreshToken = async (): Promise<boolean> => {
    try {
      return await fetchUserData();
    } catch (err) {
      console.error('Failed to refresh token:', err);
      return false;
    }
  };

  const value = {
    ethPrice,
    isAuthenticated: authState,
    user: userData,
    loading,
    error,
    login,
    logout,
    refreshToken
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
