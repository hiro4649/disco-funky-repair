export interface Illustration {
  id: number;
  image_url: string | null;
  earned_pts: number;
  rarity: number;
  probability: number;
  createdAt: string;
  updatedAt: string;
}

export interface IllustrationHistory {
  id: number;
  userId: number;
  illustrationId: number;
  createdAt: string;
  updatedAt: string;
  illustration: Illustration;
} 