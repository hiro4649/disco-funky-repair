"use client";
import React, { useEffect, useRef } from 'react';
import './CurtainAnimation.css';

interface CurtainAnimationProps {
  onAnimationComplete?: () => void;
  autoPlay?: boolean;
  children?: React.ReactNode;
}

const CurtainAnimation: React.FC<CurtainAnimationProps> = ({ 
  onAnimationComplete, 
  autoPlay = true,
  children
}) => {
  const leftCoverRef = useRef<HTMLDivElement>(null);
  const rightCoverRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);

  const playAnimation = () => {
    const leftCover = leftCoverRef.current;
    const rightCover = rightCoverRef.current;
    const content = contentRef.current;
    const bg = bgRef.current;

    if (!leftCover || !rightCover || !content || !bg) return;

    // 初期状態に戻す（すべて隠す）
    leftCover.style.transition = 'none';
    rightCover.style.transition = 'none';
    leftCover.style.transform = 'translateX(0%)';
    rightCover.style.transform = 'translateX(0%)';

    content.style.opacity = '0';
    content.style.visibility = 'hidden';
    bg.style.visibility = 'hidden';

    // 少し遅れてアニメーション開始
    setTimeout(() => {
      // 背景とテキストの準備（開いた後に表示する）
      bg.style.visibility = 'visible';

      leftCover.style.transition = 'transform 1s ease-in-out';
      rightCover.style.transition = 'transform 1s ease-in-out';

      leftCover.style.transform = 'translateX(-100%)';
      rightCover.style.transform = 'translateX(100%)';
    }, 50);

    // アニメ終了後にテキスト表示
    setTimeout(() => {
      content.style.visibility = 'visible';
      content.style.opacity = '1';
      
      // Call the completion callback
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    }, 1050); // Slightly after the curtain animation completes
  };

  useEffect(() => {
    if (autoPlay) {
      // Start animation after component mounts
      const timer = setTimeout(() => {
        playAnimation();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [autoPlay]);

  const handleClick = () => {
    if (!autoPlay) {
      playAnimation();
    }
  };

  return (
    <div 
      className="curtain-screen" 
      ref={screenRef}
      onClick={handleClick}
      style={{ cursor: autoPlay ? 'default' : 'pointer' }}
    >
      <div className="curtain-background" ref={bgRef}></div>
      <div className="curtain-cover curtain-left" ref={leftCoverRef}></div>
      <div className="curtain-cover curtain-right" ref={rightCoverRef}></div>
      <div className="curtain-content" ref={contentRef}>
        {children || <h1>Next Page</h1>}
      </div>
    </div>
  );
};

export default CurtainAnimation; 