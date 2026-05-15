import { Illustration } from './illustration';

export interface IllustrationHistoryItem {
  id: number;
  userId: number;
  illustrationId: number;
  createdAt: string;
  updatedAt: string;
  illustration: Illustration;
} 