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

const shimmer = keyframes`
  0% { left: -80%; }
  100% { left: 130%; }
`;

const prizeGlow = keyframes`
  0% {
    box-shadow:
      0 0 10px rgba(255, 255, 180, 0.4),
      0 0 20px rgba(255, 255, 255, 0.2);
    transform: scale(1);
  }
  100% {
    box-shadow:
      0 0 26px rgba(255, 255, 255, 0.8),
      0 0 42px rgba(255, 255, 200, 0.7);
    transform: scale(1.03);
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
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0);
  z-index: 9997;
`;

const PrizeItem = styled.div<{ isClosing: boolean }>`
  position: relative;
  width: 200px;
  padding: 16px;
  border-radius: 10px;
  background: #111;
  text-align: center;
  cursor: pointer;
  overflow: hidden;
  color: #fff;
  ${props => props.isClosing 
    ? css`animation: ${shrinkPop} 1.5s ease-in-out forwards;`
    : css`animation: ${prizeGlow} 2s infinite alternate;`
  }
  box-shadow:
    0 0 16px rgba(255, 255, 200, 0.4),
    0 0 32px rgba(255, 255, 255, 0.3);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    box-shadow:
      0 0 36px rgba(255, 255, 255, 1),
      0 0 60px rgba(255, 255, 200, 0.9);
    transform: ${props => props.isClosing ? 'none' : 'scale(1.05)'};
  }
`;

const PrizeGlow = styled.div`
  position: absolute;
  top: 0;
  left: -80%;
  width: 50%;
  height: 100%;
  background: linear-gradient(120deg, transparent, rgba(255,255,255,0.5), transparent);
  transform: skewX(-20deg);
  animation: ${shimmer} 2.5s infinite;
  pointer-events: none;
`;

const PrizeIconWrapper = styled.div`
  padding: 0 10px;
  margin: 8px 0 10px;
`;

const PrizeIcon = styled.img`
  border-radius: 100%;
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
`;

const TokenInfo = styled.div`
  margin-bottom: 8px;
  line-height: 1.2;
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
  margin: 6px 0 4px;
  line-height: 1.1;
`;

const PrizeExp = styled.p`
  font-size: 24px;
  color: #00ffcc;
  margin: 4px 0;
  line-height: 1.1;
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
    
    const handleClose = () => {
        setIsClosing(true);
        
        // Wait for animation to complete before dispatching actions and calling onClose
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
        }, 1500); // Match the animation duration
    };

    return (
        <ModalContainer >
            <PrizeItem isClosing={isClosing} onClick={handleClose}>
                <PrizeGlow />
                <PrizeIconWrapper>
                    <PrizeIcon src={iconUrl} alt="Prize Icon" />
                </PrizeIconWrapper>
                <TokenInfo>
                    <TokenSymbol>{tokenSymbol}</TokenSymbol>
                    <TokenName>{tokenName}</TokenName>
                </TokenInfo>
                <PrizeAmount>{expAmount}</PrizeAmount>
                <PrizeExp>
                  {/* <span >+{earnedPts}</span>  */}
                  <span className='text-white'>  + <span>{earned_pts}</span></span>
                </PrizeExp>
            </PrizeItem>
        </ModalContainer>
    );
};

export default PrizeItemModal; 