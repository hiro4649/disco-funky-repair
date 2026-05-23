import apiClient from '../../utils/apiClient';
import { setLotteryTicket, setClaimTickets, setFanPoints, setSixHourTokenBalance, setTallyTokenBalance } from '@/store/slices/userSlice';
import { AppDispatch } from '@/store/store';

/**
 * Helper function to retry failed API calls with exponential backoff
 */
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
        console.warn(`📊 Retry refreshUserInfo attempt ${attempt + 1}/${maxRetries} after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
};

/**
 * Refresh user info from backend and update Redux store
 * Call this function after any API request that modifies user data
 * @param userId - The user ID to fetch info for
 * @param dispatch - Redux dispatch function
 */
export const refreshUserInfo = async (userId: number | null, dispatch: AppDispatch): Promise<void> => {
  if (!userId) {
    console.warn('⚠️ Cannot refresh user info: userId is null');
    return;
  }

  try {
    console.log('📊 Refreshing user balance data...');

    const response = await retryWithBackoff(
      () => apiClient.post('/user/info', { user_id: userId }),
      3, // Max 3 retries
      1000 // Start with 1 second delay
    );

    if (response.status === 200 && response.data.success) {
      const { data } = response.data;

      // Dispatch all user info to Redux store
      dispatch(setLotteryTicket(data.tickets || 0));
      dispatch(setClaimTickets(data.claimTickets || 0));
      dispatch(setFanPoints(data.fan_points || 0));
      dispatch(setSixHourTokenBalance(data.sixHourTokenBalance || 0));
      dispatch(setTallyTokenBalance(data.tallyTokenBalance || 0));

      console.log('✅ User balance data refreshed successfully:', {
        tickets: data.tickets || 0,
        claimTickets: data.claimTickets || 0,
        fan_points: data.fan_points || 0
      });
    } else {
      console.error('❌ User info API returned unsuccessful response:', response.data);
    }
  } catch (error: any) {
    console.error('❌ Error refreshing user info after retries:', error);
    console.error('   Response:', error.response?.data);
    // Don't throw error - silent fail to avoid breaking UI
    // But log enough detail for debugging
  }
};
