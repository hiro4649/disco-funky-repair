import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { resetUser, setAuthstate, setUserId, setWalletAddress } from '@/store/slices/userSlice';
import apiClient from '../../utils/apiClient';
import { useRouter } from 'next/navigation';

interface UserData {
  user_id: number;
  address: string;
}

interface UserResponse {
  success: boolean;
  user: UserData;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserData | null;
  loading: boolean;
  error: string | null;
  login: (wallet_address: string) => Promise<boolean>;
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
  const router = useRouter();

  // Fetch user data from /user/verify endpoint
  const fetchUserData = async () => {
    try {
      const response = await apiClient.get<UserResponse>('/user/verify');
      if (response.status === 200 && response.data.success) {
        const userData = response.data.user;
        setUserData(userData);
        dispatch(setUserId(userData.user_id));
        dispatch(setWalletAddress(userData.address));
        dispatch(setAuthstate(true));
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
  const login = async (wallet_address: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.post('/user/signup', { wallet_address });
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
  };

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