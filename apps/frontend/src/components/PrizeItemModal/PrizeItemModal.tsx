import { setDrawSuccess } from '@/store/slices/homeSlice';
import { setOpenScreen } from '@/store/slices/homeSlice';
import React, { useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useAppDispatch } from '@/store/store';
import { resetPrize } from '@/store/slices/prizeSlice';
import { useAppSelector } from '@/store/store';
interface PrizeItemModalProps {
  iconUrl: string;
  tokenSymbol: string;
  tokenName: string;
  // amount: string | number;
  expAmount: string | number;
  earnedPts: string | number;
  onClose?: () => void;
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

const shrinkPop = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(0.8);
    opacity: 0.8;
  }
  80% {
    transform: scale(1.2);
    opacity: 0.6;
  }
  100% {
    transform: scale(0);
    opacity: 0;
  }
`;

const ModalContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100dvh;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #111;
  z-index: 9997;
`;

const PrizeItem = styled.div<{ isClosing: boolean }>`
  position: relative;
  width: 220px;
  height: 380px;
  overflow: hidden;
  border-radius: 14px;
  border: 0px solid rgba(255, 255, 255, 0.5);
  cursor: pointer;
  ${props => !props.isClosing && css`
    animation: ${outerGlow} 2s infinite ease-in-out;
  `}
  ${props => props.isClosing && css`
    animation: ${shrinkPop} 1.5s ease-in-out forwards;
  `}
`;

const PrizeFrame = styled.img`
  width: 100%;
  height: 100%;
  display: block;
  border-radius: 12px;
  object-fit: cover;
  transform: scale(1.15);
  position: relative;
  z-index: 1;
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
    #00ffcc,
    #ffcc00,
    #ff00cc
  );
  mix-blend-mode: overlay;
  opacity: 0.4;
  animation: ${rotateGlow} 8s linear infinite;
  z-index: 1;
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
  z-index: 2;
`;

const ContentWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 16px;
  text-align: center;
  z-index: 10;
`;

const PaddingDiv = styled.div`
  visibility: hidden;
`;

const PrizeIconWrapper = styled.div`
  padding: 0 10px;
  margin: 9px 0;
  position: relative;
  width: 100%;
  max-width: 135px;
`;

const PrizeIcon = styled.img`
  border-radius: 100%;
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
`;

const TokenInfo = styled.div`
  margin: 8px 0;
  line-height: 1.2;
  position: relative;
`;

const TokenSymbol = styled.div`
  font-size: 30px;
  font-weight: 600;
  color: #ffffff;
  line-height: 1.2;
`;

const TokenName = styled.div`
  font-size: 22px;
  color: #999999;
  line-height: 1.2;
`;

const PrizeAmount = styled.p`
  font-size: 24px;
  font-weight: bold;
  color: #ffff33;
  margin: 5px 0;
  line-height: 1.1;
  position: relative;
`;

const PrizeExp = styled.p`
  font-size: 24px;
  color: var(--color-main);
  margin: 4px 0;
  line-height: 1.1;
`;

const Flash = styled.div<{ opacity: number }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: white;
  opacity: ${props => props.opacity};
  pointer-events: none;
  z-index: 9998;
  transition: opacity 0.1s ease;
`;

const Whiteout = styled.div<{ opacity: number }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: white;
  opacity: ${props => props.opacity};
  pointer-events: none;
  transition: opacity 0.5s ease;
  z-index: 9999;
`;

const PrizeItemModal: React.FC<PrizeItemModalProps> = ({
  iconUrl,
  tokenSymbol,
  tokenName,
  expAmount,
  earnedPts,
  onClose
}) => {
  const dispatch = useAppDispatch();
  const { earned_pts } = useAppSelector((state) => state.illustration);
  const [isClosing, setIsClosing] = useState(false);
  const [flashOpacity, setFlashOpacity] = useState(0);
  const [whiteoutOpacity, setWhiteoutOpacity] = useState(0);
  const [hideEffects, setHideEffects] = useState(false);

  // Calculate frame number from earned_pts (clamp between 1-9)
  const frameNumber = Math.min(Math.max(Number(earned_pts) || 1, 1), 9);
  const frameSrc = `/images/gacha_token_card_frame_20251112_s/gacha_token_card_frame_${frameNumber}.png`;

  const handleClose = () => {
    setIsClosing(true);
    setHideEffects(true); // Hide rainbow effects immediately

    const flashTimings = [
      [200, 200],  // onTime, offTime
      [120, 150],
      [60, 100]
    ];

    let currentFlash = 0;

    const flashSequence = () => {
      const [onTime, offTime] = flashTimings[currentFlash];

      setFlashOpacity(1);

      setTimeout(() => {
        setFlashOpacity(0);
        currentFlash++;

        if (currentFlash < flashTimings.length) {
          setTimeout(flashSequence, offTime);
        } else {
          setTimeout(() => {
            setWhiteoutOpacity(1);
            setTimeout(() => {
              dispatch(setOpenScreen(true));

              setTimeout(() => {
                dispatch(setDrawSuccess(true));
                dispatch(setOpenScreen(false));
              }, 1000);
              dispatch(resetPrize());

              // Call the onClose prop if provided
              if (onClose) {
                onClose();
              }
            }, 800);
          }, 1600);
        }
      }, onTime);
    };

    flashSequence();
  };

  return (
    <ModalContainer>
      <PrizeItem isClosing={isClosing} onClick={handleClose}>
        <PrizeFrame src={frameSrc} alt="Prize Frame" />
        {!hideEffects && <HoloGlow />}
        {!hideEffects && <Shine />}
        <ContentWrapper>
          <PrizeIconWrapper>
            <PrizeIcon src={iconUrl} alt="Prize Icon" />
          </PrizeIconWrapper>
          <TokenInfo>
            <TokenSymbol>{tokenSymbol}</TokenSymbol>
            <TokenName>{tokenName}</TokenName>
          </TokenInfo>
          <PrizeAmount>{expAmount}</PrizeAmount>
          <PaddingDiv>It's for padding.</PaddingDiv>
        </ContentWrapper>
      </PrizeItem>
      <Flash opacity={flashOpacity} />
      <Whiteout opacity={whiteoutOpacity} />
    </ModalContainer>
  );
};

export default PrizeItemModal; 