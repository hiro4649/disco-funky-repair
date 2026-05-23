'use client';
import React from 'react';
import Image from 'next/image';
import { useAppSelector } from '@/store/store';
import { useTranslations } from 'next-intl';

interface IllustrationDisplayProps {
  className?: string;
}

const IllustrationDisplay: React.FC<IllustrationDisplayProps> = ({ className = '' }) => {
  const illustration = useAppSelector(state => state.illustration);
  const t = useTranslations('PrizeHistory');

  if (!illustration.name || !illustration.image_url) {
    return null;
  }

  return (
    <div className={`illustration-container p-4 rounded-lg bg-black/20 backdrop-blur-sm ${className}`}>
      <h3 className="text-xl font-bold text-[#00FFCC] mb-2">{illustration.name}</h3>
      
      <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-4">
        <Image 
          src={illustration.image_url} 
          alt={illustration.name}
          fill
          className="object-cover"
        />
      </div>
      
      <div className="text-white">
        <p className="mb-2">{illustration.description}</p>
        
        <div className="flex justify-between items-center mt-4 text-sm">
          <div>
            <span className="text-gray-300">{t('Earned Points')}: </span>
            <span className="text-[#00FFCC] font-bold">{illustration.earned_pts}</span>
          </div>
          
          {illustration.jumpStatus !== null && (
            <div className="px-3 py-1 rounded-full bg-opacity-20 text-xs font-medium">
              {illustration.jumpStatus ? (
                <span className="text-green-400">Rarity Increased!</span>
              ) : (
                <span className="text-yellow-400">Rarity Reset</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IllustrationDisplay; 