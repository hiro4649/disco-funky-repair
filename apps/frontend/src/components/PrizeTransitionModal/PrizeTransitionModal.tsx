import { useAppDispatch } from '@/store/store';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { setShowPrizeImage, setShowIllustration } from '@/store/slices/homeSlice';
import { useAppSelector } from '@/store/store';
import apiClient from '../../../utils/apiClient';
import { setPrizeId, setPrizeName, setPrizeSymbol, setPrizeImage, setPrizeAmount, setPrizeExpAmount, setEarnedPts } from "@/store/slices/prizeSlice";
import { useAppKitAccount } from '@reown/appkit/react';

interface PrizeTransitionModalProps {
  onTransitionComplete: () => void;
  startAnimation?: boolean; // Whether to start the door animation
}

interface StyledProps {
  isVisible: boolean;
}

interface DoorProps {
  isOpen: boolean;
  side: 'left' | 'right';
}

interface RarityLabelProps {
  rarityStyle: string;
}

const outerGlow = keyframes`
  0%, 100% {
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.1),
                0 0 20px rgba(0, 255, 255, 0.2),
                0 0 40px rgba(255, 0, 255, 0.1);
  }
  50% {
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.4),
                0 0 40px rgba(0, 255, 255, 0.5),
                0 0 60px rgba(255, 0, 255, 0.4);
  }
`;

const rotateGlow = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const shineMove = keyframes`
  0% {
    transform: translate(-100%, -100%) rotate(25deg);
  }
  100% {
    transform: translate(100%, 100%) rotate(25deg);
  }
`;

const glowPulse = keyframes`
  0%, 100% {
    text-shadow:
      0 0 7px rgba(255, 255, 255, 0.4),
      0 0 14px rgba(255, 255, 255, 0.8);
  }
  50% {
    text-shadow:
      0 0 8px rgba(255, 255, 255, 0.2),
      0 0 14px rgba(255, 255, 255, 0.2);
  }
`;

const sizePulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
`;

// Flash animation keyframes (matching CodePen)
const flash = keyframes`
  0%   { opacity: 0; }
  30%  { opacity: 1; }
  100% { opacity: 0; }
`;

// Sparkle animation keyframes (matching CodePen)
const sparkleAnim = keyframes`
  0% {
    transform: scale(0.5);
    opacity: 1;
  }
  100% {
    transform: scale(1.5) translateY(-20px);
    opacity: 0;
  }
`;

const Card = styled.div`
  position: relative;
  width: 320px;
  height: auto;
  overflow: hidden;
  border-radius: 12px;
  border: 2px solid rgba(255, 255, 255, 0.5);
  cursor: pointer;
  animation: ${outerGlow} 2s infinite ease-in-out;
  z-index: 1000;
  transition: transform 0.4s ease, filter 0.4s ease;
  
  &.upgrading {
    transform: scale(1.15) rotateY(15deg);
    filter: brightness(2.2) blur(2px);
  }
  
  &:hover {
    transform: scale(1.02);
  }
`;

const CardImage = styled.img`
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  z-index: 1;
  position: relative;
`;

const HoloGlow = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 12px;
  pointer-events: none;
  background: conic-gradient(
    from 0deg,
    #ff00cc,
    #3333ff,
    var(--color-main),
    #ffcc00,
    #ff00cc
  );
  mix-blend-mode: overlay;
  opacity: 0.4;
  animation: ${rotateGlow} 8s linear infinite;
  z-index: 2;
`;

const Shine = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 12px;
  pointer-events: none;
  background: linear-gradient(
    120deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.5) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  animation: ${shineMove} 4s infinite ease-in-out;
  z-index: 3;
`;

// Flash element (matching CodePen)
const FlashElement = styled.div`
  position: absolute;
  inset: 0;
  background: white;
  opacity: 0;
  pointer-events: none;
  z-index: 3;
  
  &.show {
    animation: ${flash} 0.4s forwards;
  }
`;

// Sparkle container (matching CodePen)
const SparkleContainer = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 4;
`;

// Sparkle element (matching CodePen)
const Sparkle = styled.div`
  position: absolute;
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 50%;
  opacity: 0;
  animation: ${sparkleAnim} 0.6s ease-out forwards;
  box-shadow: 0 0 8px 2px white;
`;

const Flash = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'isVisible',
}) <StyledProps>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: white;
  opacity: ${(props: StyledProps) => props.isVisible ? 1 : 0};
  pointer-events: none;
  z-index: 9998;
  transition: opacity 0.1s ease;
`;

const Whiteout = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'isVisible',
}) <StyledProps>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: white;
  opacity: ${(props: StyledProps) => props.isVisible ? 1 : 0};
  pointer-events: none;
  transition: opacity 0.5s ease;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100dvh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(17, 17, 17);
  z-index: 1000;
  overflow: hidden;
  padding: 80px 20px;
  box-sizing: border-box;
`;

// Add RarityLabel styled component
const RarityLabel = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'rarityStyle',
}) <RarityLabelProps>`
  font-size: 58px;
  font-weight: bold;
  text-align: center;
  
  animation: ${glowPulse} 2s infinite ease-in-out, ${sizePulse} 2s infinite ease-in-out;
  pointer-events: none;
  margin-top: 30px;
  z-index: 1000;
  color: white;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
  ${props => props.rarityStyle}
`;

const PrizeTransitionModal: React.FC<PrizeTransitionModalProps> = ({ onTransitionComplete }) => {
  const [isFlashVisible, setIsFlashVisible] = React.useState(false);
  const [isWhiteoutVisible, setIsWhiteoutVisible] = React.useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [sparkles, setSparkles] = useState<Array<{ id: number; left: string; top: string }>>([]);
  const dispatch = useAppDispatch();
  const { user_id } = useAppSelector((state) => state.user);
  const { isConnected } = useAppKitAccount();

  // Get data from illustration slice
  const { image_url, transition_status } = useAppSelector((state) => state.illustration);

  // Track previous illustration data to detect actual changes
  const prevIllustrationData = useRef<{
    image_url: string | null;
    transition_status: boolean | null;
  }>({
    image_url: null,
    transition_status: null
  });

  // Disable scrolling when modal is mounted
  useEffect(() => {
    // Save current overflow style
    const originalOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;

    // Disable scrolling
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    // Cleanup function to restore original overflow
    return () => {
      document.body.style.overflow = originalOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
    };
  }, []);

  // Handle image load
  const handleImageLoad = () => {
    setIsImageLoaded(true);
    setImageError(false);
  };

  // Handle image error
  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('Failed to load image:', image_url);
    setImageError(true);
    setIsImageLoaded(false);
  };

  // Show sparkles function (matching CodePen)
  const createSparkles = (count = 15) => {
    const newSparkles = Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`
    }));
    setSparkles(newSparkles);
    
    // Remove sparkles after animation
    setTimeout(() => {
      setSparkles([]);
    }, 600);
  };

  // Trigger sparkle animation only when illustration data actually changes
  useEffect(() => {
    const currentData = { name, image_url, transition_status };
    const prevData = prevIllustrationData.current;
    
    // Check if this is a new illustration (data has changed)
    const isNewIllustration = (
      transition_status && 
      image_url && 
      isImageLoaded &&
      (prevData.image_url !== image_url)
    );

    if (isNewIllustration) {
      // Add upgrading effect
      setIsUpgrading(true);
      setShowFlash(true);
      createSparkles(15);

      // Remove upgrading effect after animation
      setTimeout(() => {
        setIsUpgrading(false);
        setShowFlash(false);
      }, 600);
    }

    // Update previous data
    prevIllustrationData.current = currentData;
  }, [transition_status, image_url, name, isImageLoaded]);

  const startTransition = () => {
    const flashTimings = [
      [200, 200],  // First flash: slow
      [120, 150],  // Second flash: medium
      [60, 100]    // Third flash: fast
    ];

    let currentFlash = 0;

    const flashSequence = () => {
      const [onTime, offTime] = flashTimings[currentFlash];
      setIsFlashVisible(true);

      setTimeout(() => {
        setIsFlashVisible(false);
        currentFlash++;

        if (currentFlash < flashTimings.length) {
          setTimeout(flashSequence, offTime);
        } else {
          setTimeout(() => {
            setIsWhiteoutVisible(true);
            setTimeout(() => {
              onTransitionComplete();
            }, 1500);
          }, 200);
        }
      }, onTime);
    };

    flashSequence();
  };

  const truncateTo = (value: number, decimals: number): number => {
    const factor = Math.pow(10, decimals);
    return Math.floor(value * factor) / factor;
}

  const getTransaction = useCallback(async () => {
    try {
      const res = await apiClient.get(`/airdrop/prize/transactions/${user_id}`);
      const { data, success } = res.data;
      if (success) {
        type Prize = {
          id: number;
          token_name: string;
          symbol: string;
          icon: string;
          quantity: number;
          price: number;
          earned_pts: number;
        }
        const prize: Prize = data[0].prize;
        const prize_amount = truncateTo(prize.price, 5);
        const prize_exp_amount = truncateTo(prize.quantity / prize.price, 4);
        dispatch(setPrizeId(prize.id));
        dispatch(setPrizeName(prize.token_name));
        dispatch(setPrizeSymbol(prize.symbol));
        dispatch(setPrizeImage(prize.icon));
        dispatch(setPrizeAmount(prize_amount));
        dispatch(setPrizeExpAmount(prize_exp_amount)); //token amount to airdrop
        dispatch(setEarnedPts(prize.earned_pts));
      } else {
        console.error(data.message);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
    }
}, [user_id, isConnected, dispatch]);

const nextPage = () => {
  startTransition();
};

useEffect(() => {
  getTransaction();
}, [getTransaction]);

return (
  <ModalContainer>
    <div className='flex flex-col items-center justify-center relative'>

      <Card onClick={nextPage} className={isUpgrading ? 'upgrading' : ''}>
        {image_url && !imageError && (
          <CardImage
            src={image_url}
            alt="Prize Card"
            onLoad={handleImageLoad}
            onError={handleImageError}
            style={{ opacity: isImageLoaded ? 1 : 0 }}
          />
        )}
        {imageError && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: 'white',
            fontSize: '18px'
          }}>
            Failed to load image
          </div>
        )}
        <HoloGlow style={{ zIndex: 2 }}/>
        <Shine style={{ zIndex: 2 }}/>
        <FlashElement className={showFlash ? 'show' : ''} />
        <SparkleContainer>
          {sparkles.map((sparkle) => (
            <Sparkle
              key={sparkle.id}
              style={{
                left: sparkle.left,
                top: sparkle.top,
              }}
            />
          ))}
        </SparkleContainer>
      </Card>
      {/* </div> */}
    </div>
    <Flash isVisible={isFlashVisible} />
    <Whiteout isVisible={isWhiteoutVisible} />
  </ModalContainer>
);
};

export default PrizeTransitionModal; 