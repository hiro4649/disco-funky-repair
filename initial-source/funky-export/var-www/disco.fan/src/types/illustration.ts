export interface Illustration {
  id: number;
  name: string;
  description: string;
  image_url: string | null;
  earned_pts: number;
  rarity: number;
  probability: number;
  jumpStatus: boolean;
  rarity_style?: string; // CSS string for styling the rarity label
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