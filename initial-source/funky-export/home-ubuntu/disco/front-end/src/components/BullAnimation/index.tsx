import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { useRouter } from 'next/navigation';
import '@/css/animations.css';
import apiClient from '../../../utils/apiClient';
import { setIllustrationData, setIllustrationError, resetIllustration } from '@/store/slices/illustrationSlice';
import { setIllustration1Data, setIllustration1Error, resetIllustration1, setIllustration2Data, setIllustration2Error, resetIllustration2 } from '@/store/slices/transitionSlice';
import styled, { keyframes, css } from 'styled-components';

// Vortex animation keyframes
const vortexIn = keyframes`
  0% {
    transform: translate(-50%, -50%) scale(0) rotate(0deg);
  }
  100% {
    transform: translate(-50%, -50%) scale(10) rotate(360deg);
  }
`;

// Vortex element
const VortexElement = styled.div`
  position: absolute;
  width: 180px;
  height: 180px;
  top: 50%;
  left: 50%;
  background: radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(180,180,180,0.3) 40%, rgba(0,0,0,0.85) 100%);
  border-radius: 50%;
  transform: translate(-50%, -50%) scale(0) rotate(0deg);
  z-index: 9998;
  pointer-events: none;
  opacity: 1;
  box-shadow: 0 0 80px rgba(255, 255, 255, 0.4);
  animation: none;
  
  &.active {
    animation: ${vortexIn} 1.8s ease-out forwards;
  }
`;

// Flash element
const FlashElement = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  background: white;
  top: 0;
  left: 0;
  opacity: 0;
  z-index: 9999;
  pointer-events: none;
  transition: opacity 0.2s ease;
  
  &.show {
    opacity: 1;
  }
`;

// Add pop/bounce keyframes for BB, arrow, BBB
const popIn = keyframes`
  0% { transform: scale(0); opacity: 0; }
  60% { transform: scale(1.2); opacity: 1; }
  80% { transform: scale(0.95); }
  100% { transform: scale(1); opacity: 1; }
`;

const bounceIn = keyframes`
  0% { transform: scale(0); opacity: 0; }
  60% { transform: scale(1.3); opacity: 1; }
  80% { transform: scale(0.85); }
  100% { transform: scale(1); opacity: 1; }
`;

// Add glow and pulse animations
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

const TransitionTextRow = styled.div`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: calc(40% + 140px); // Further increased spacing
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
  width: 100vw;
  max-width: 95vw;
  overflow: visible;
  padding: 0 20px 0.7em 20px; // Add extra bottom padding
`;

const BBText = styled.span<{ $show: boolean }>`
  font-size: 3.2rem;
  color: #FFFF33;
  font-weight: 700;
  margin-right: 16px;
  opacity: ${({ $show }) => ($show ? 1 : 0)};
  text-shadow:
    -0.5px -0.5px 0 #000,
     0.5px -0.5px 0 #000,
    -0.5px  0.5px 0 #000,
     0.5px  0.5px 0 #000,
     0 0 4px #FFFF33,
     0 0 8px #FFD700,
     0 0 12px #FFD700;
  ${({ $show }) => $show ? css`
    animation: ${popIn} 0.25s cubic-bezier(.68,-0.55,.27,1.55), ${glowPulse} 2s infinite ease-in-out, ${sizePulse} 2s infinite ease-in-out;
  ` : css`
    animation: none;
  `}
`;

const ArrowText = styled.span<{ $show: boolean }>`
  font-size: 3.2rem;
  color: #fff;
  font-weight: 700;
  margin: 0 16px;
  opacity: ${({ $show }) => ($show ? 1 : 0)};
  animation: ${({ $show }) => $show ? popIn : 'none'} 0.25s cubic-bezier(.68,-0.55,.27,1.55);
`;

const BBBText = styled.span<{ $show: boolean }>`
  font-size: clamp(2.5rem, 8vw, 4.2rem);
  font-weight: 700;
  margin-left: 16px;
  opacity: ${({ $show }) => ($show ? 1 : 0)};
  background: ${({ $show }) => $show ? 'linear-gradient(135deg, #FF0000, #FF7F00, #FFFF00, #00FF00, #00FFFF, #0000FF, #8B00FF)' : 'transparent'};
  -webkit-background-clip: text;
  -webkit-text-fill-color: ${({ $show }) => $show ? 'transparent' : '#fff'};
  text-shadow: ${({ $show }) => $show ? '0 0 4px rgba(255, 255, 255, 0.15), 0 0 6px rgba(255, 255, 255, 0.15)' : 'none'};
  white-space: nowrap;
  overflow: visible;
  line-height: 1.35; // Make line height larger to prevent cutoff
  vertical-align: middle;
  ${({ $show }) => $show ? css`
    animation: ${bounceIn} 0.35s cubic-bezier(.68,-0.55,.27,1.55), ${glowPulse} 2s infinite ease-in-out, ${sizePulse} 2s infinite ease-in-out;
  ` : css`
    animation: none;
  `}
`;

const config1 = {
    frame1: "/images/jump_01_s/gacha_dance_1.png",
    frame2: "/images/jump_01_s/gacha_dance_2.png",
    frame3: "/images/jump_01_s/gacha_dance_3.png",
    frame4: "/images/jump_01_s/gacha_dance_4.png",
};

const config2 = {
    frame1: "/images/jump_02_s/gacha_dance_1.png",
    frame2: "/images/jump_02_s/gacha_dance_2.png",
    frame3: "/images/jump_02_s/gacha_dance_3.png",
    frame4: "/images/jump_02_s/gacha_dance_4.png",
};

const config3 = {
    frame1: "/images/jump_03_s/gacha_dance_1.png",
    frame2: "/images/jump_03_s/gacha_dance_2.png",
    frame3: "/images/jump_03_s/gacha_dance_3.png",
    frame4: "/images/jump_03_s/gacha_dance_4.png",
};

const config4 = {
    frame1: "/images/jump_04_s/gacha_dance_1.png",
    frame2: "/images/jump_04_s/gacha_dance_2.png",
    frame3: "/images/jump_04_s/gacha_dance_3.png",
    frame4: "/images/jump_04_s/gacha_dance_4.png",
};

const BullAnimation: React.FC = () => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const characterRef = useRef<HTMLDivElement>(null);
    const bullTextRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const { user_id } = useAppSelector((state) => state.user);
    const { image_url, earned_pts, jumpStatus } = useAppSelector((state) => state.illustration);

    // Animation states for transition
    const [showFlash, setShowFlash] = useState(false);
    const [showVortex, setShowVortex] = useState(false);

    // Randomly select between config1, config2, and config3
    const configs = [config1, config2, config3, config4];
    const selectedConfig = configs[Math.floor(Math.random() * configs.length)];
    const { frame1, frame2, frame3, frame4 } = selectedConfig;

    // Capture initial jumpStatus to prevent re-runs
    const initialJumpStatus = useRef(jumpStatus);

    const hasRequestedDraw = useRef(false);

    const checkingDrawState = useCallback(async () => {
        if (initialJumpStatus.current) {
            hasRequestedDraw.current = true;
            const response = await apiClient.post(`/user/${user_id}/draw-illustration`);
            if (response.status === 200 && response.data.success) {
                const illustrationData = response.data.data;
                dispatch(setIllustrationData({
                    image_url: illustrationData.image_url,
                    earned_pts: illustrationData.earned_pts,
                    jumpStatus: illustrationData.jumpStatus,
                    transition_status: true,
                    dance: illustrationData.dance
                }));
            } else if (response.status === 429) {
                dispatch(setIllustrationError(response.data.message || 'Failed to draw illustration'));
            } else {
                dispatch(setIllustrationError(response.data.message || 'Failed to draw illustration'));
            }
        }
    }, [user_id, dispatch]);

    // Trigger transition animation
    const triggerTransitionAnimation = () => {
        setShowVortex(true);

        // Show flash after 1.5s (matching your code)
        setTimeout(() => {
            setShowFlash(true);
        }, 1500);
    };

    // Callback for when all animations complete (for successful jumping)
    const onSuccessfulAnimationsComplete = useCallback(() => {
        console.log('All animations completed for successful jumping!');
        // Add your new feature here
        // For example: trigger special effects, play sounds, etc.

        triggerTransitionAnimation();
        if (initialJumpStatus.current) {
            // After 1s of full text, trigger vortex/transition
            setTimeout(() => {
                setTimeout(() => {
                    router.push('/prize-transition');
                }, 1000);
            }, 1000); // 600ms for BBB to appear + 1s
            return;
        }

        // Then trigger the transition animation
        setTimeout(() => {
            router.push('/prize-transition');
        }, 1650);
    }, [router]);

    const onAnimationComplete = useCallback(() => {
        if (initialJumpStatus.current) {
            // For successful jumping, call the new callback
            onSuccessfulAnimationsComplete();
        } else {
            // For failed jumping, show the animation screen and wait for click
            dispatch(setIllustrationData({
                image_url: image_url || '',
                earned_pts: earned_pts || 0,
                jumpStatus: jumpStatus || false,
                transition_status: false
            }));
            // Don't navigate automatically - wait for click
            handleFailedClick();
        }
    }, [onSuccessfulAnimationsComplete, router]);

    // Handle click to trigger animation and navigate
    const handleFailedClick = () => {
        triggerTransitionAnimation();
        console.log('Failed click triggered!'); // Debug log
        // Wait for animation to complete before navigating (1.65s total)
        setTimeout(() => {
            router.push('/prize-display');
        }, 1650);
    };

    // Add state for previous and new illustration names
    const [prevName, setPrevName] = useState<string | null>(null);
    const [newEarnedPts, setNewEarnedPts] = useState<string | null>(null);
    const [showBB, setShowBB] = useState(false);
    const [showArrow, setShowArrow] = useState(false);
    const [showBBB, setShowBBB] = useState(false);
    const [showTransitionText, setShowTransitionText] = useState(false);
    const [prevEarnedPts, setPrevEarnedPts] = useState<number | null>(null);

    // Prevent scroll events while animation is active
    useEffect(() => {
        const preventScroll = (e: WheelEvent) => {
            e.preventDefault();
            e.stopPropagation();
        };

        // Add wheel event listener with passive: false to allow preventDefault
        window.addEventListener('wheel', preventScroll, { passive: false });

        return () => {
            window.removeEventListener('wheel', preventScroll);
        };
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        const character = characterRef.current;
        const bullText = bullTextRef.current;

        if (!canvas || !ctx || !character) return;

        let width: number;
        let height: number;
        let candleData: Array<{ x: number, open: number, close: number, high: number, low: number }> = [];
        let currentIndex = 0;
        let animationFrame: number;
        let chartStartY: number;
        let chartAnimationComplete = false;
        let characterAnimationComplete = false;
        let textAnimationComplete = false;

        function resizeCanvas() {
            width = canvas!.width = window.innerWidth;
            height = canvas!.height = window.innerHeight;
            chartStartY = height * 0.7;
        }

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        function generateCandles() {
            candleData = [];
            let x = 0;
            let price = chartStartY;
            const step = 12;

            // if (initialJumpStatus.current) {
            // Bull chart pattern
            const spikePos = [0.6, 0.75, 0.8, 0.95].map(p => Math.floor((width * p) / step));

            for (let i = 0; i < width / step + 20; i++) {
                let open = price;
                let close;
                if (spikePos.includes(i)) {
                    close = open - height * (0.15 + Math.random() * 0.15);
                } else {
                    const change = (Math.random() * 60 - 30);
                    close = open - change;
                }
                let high = Math.min(open, close) - Math.random() * 20;
                let low = Math.max(open, close) + Math.random() * 20;
                price = close;

                candleData.push({ x: x, open, close, high, low });
                x += step;
            }
            // } else {
            //     // Normal chart pattern
            //     const spikePos = [Math.floor((width * 0.6) / step)]; // 60% position green candle
            //     const redPos = Math.floor((width * 0.8) / step); // 80% position red candle

            //     for (let i = 0; i < width / step + 20; i++) {
            //         let open = price;
            //         let close;
            //         if (spikePos.includes(i)) {
            //             close = open - height * (Math.random() * 0.15 + 0.15);
            //         } else if (i === redPos) {
            //             close = open + height * 0.2;
            //         } else {
            //             const change = (Math.random() * 60 - 30);
            //             close = open - change;
            //         }
            //         let high = Math.min(open, close) - Math.random() * 20;
            //         let low = Math.max(open, close) + Math.random() * 20;
            //         price = close;

            //         candleData.push({ x, open, close, high, low });
            //         x += step;
            //     }
            // }
        }

        function drawChart() {
            if (currentIndex >= candleData.length) {
                cancelAnimationFrame(animationFrame);
                chartAnimationComplete = true;

                if (initialJumpStatus.current) {
                    setTimeout(() => {
                        showBullText();
                    }, 0);
                } else {
                    textAnimationComplete = true;
                    checkAllAnimationsComplete();
                }
                return;
            }

            const { x, open, close, high, low } = candleData[currentIndex];
            const candleW = width < 500 ? 4 : 6;
            const color = close < open ? '#00FF00' : '#FF0000';

            ctx!.strokeStyle = color;
            ctx!.beginPath();
            ctx!.moveTo(x, high);
            ctx!.lineTo(x, low);
            ctx!.stroke();

            ctx!.fillStyle = color;
            ctx!.fillRect(x - candleW / 2, Math.min(open, close), candleW, Math.abs(open - close));

            currentIndex++;
            setTimeout(() => animationFrame = requestAnimationFrame(drawChart), 10);
        }

        function drawGrid() {
            ctx!.strokeStyle = 'rgba(255,255,255,0.4)';
            ctx!.lineWidth = 1;
            const gridSize = 50;

            for (let x = 0; x < width; x += gridSize) {
                ctx!.beginPath();
                ctx!.moveTo(x, 0);
                ctx!.lineTo(x, height);
                ctx!.stroke();
            }

            for (let y = 0; y < height; y += gridSize) {
                ctx!.beginPath();
                ctx!.moveTo(0, y);
                ctx!.lineTo(width, y);
                ctx!.stroke();
            }
        }

        function checkAllAnimationsComplete() {
            if (initialJumpStatus.current) {
                if (chartAnimationComplete && characterAnimationComplete && textAnimationComplete) {
                    setTimeout(() => {
                        onAnimationComplete();
                    }, 2000);
                }
            } else {
                if (characterAnimationComplete) {
                    onAnimationComplete();
                }
            }
        }

        async function animateCharacter() {
            if (!character) return;

            character.style.display = 'flex';

            if (initialJumpStatus.current && !hasRequestedDraw.current) {
                setTimeout(() => {
                    checkingDrawState();
                }, 3000);
            }

            // Start dancing animation
            const startDancingAnimation = () => {
                const SPEED = 400; // 1コマの表示時間（ミリ秒）
                const SEQ = [frame1, frame2, frame1, frame2, frame3, frame4, frame3, frame4];

                // プリロード
                SEQ.forEach(src => { const im = new Image(); im.src = src; });

                const imgA = character.querySelector('#dancerA') as HTMLImageElement;
                const imgB = character.querySelector('#dancerB') as HTMLImageElement;

                if (!imgA || !imgB) return;

                // 1ループ長をCSSへ反映（sway/hop/tilt と同期）
                const loopMs = SPEED * SEQ.length; // 8コマ
                document.documentElement.style.setProperty('--loopDur', `${loopMs}ms`);

                let i = 0, useA = true;
                function setFrame(el: HTMLImageElement, src: string) { el.src = src; }
                function tick() {
                    const src = SEQ[i];
                    const showEl = useA ? imgA : imgB;
                    const hideEl = useA ? imgB : imgA;

                    setFrame(showEl, src);
                    showEl.classList.remove('hide'); showEl.classList.add('show');
                    hideEl.classList.remove('show'); hideEl.classList.add('hide');

                    useA = !useA;
                    i = (i + 1) % SEQ.length;
                }

                // 初期化
                imgA.classList.add('show'); imgB.classList.add('hide');
                imgA.src = SEQ[0];
                tick();
                const intervalId = setInterval(tick, SPEED);

                // Position the character for movement
                const duration = 2500;

                let startTime: number | null = null;

                function jump(time: number) {
                    if (!startTime) startTime = time;
                    const t = (time - startTime) / duration;

                    if (t > 1) {
                        character!.style.display = 'none';
                        clearInterval(intervalId);
                        characterAnimationComplete = true;
                        checkAllAnimationsComplete();
                        return;
                    }

                    requestAnimationFrame(jump);
                }

                requestAnimationFrame(jump);
            };

            // Start the dancing animation immediately
            startDancingAnimation();
        }

        function showBullText() {
            if (!bullText) return;

            bullText.style.animation = 'none';
            void bullText.offsetWidth;
            bullText.style.animation = 'bullFlash 1.8s ease-out forwards';

            setShowTransitionText(true);
            setShowBB(false); setShowArrow(false); setShowBBB(false);
            setTimeout(() => setShowBB(true), 0);
            setTimeout(() => setShowArrow(true), 300);
            setTimeout(() => setShowBBB(true), 600);

            setTimeout(() => {
                setShowTransitionText(false);
            }, 6000)

            const handleAnimationEnd = () => {
                textAnimationComplete = true;
                bullText.removeEventListener('animationend', handleAnimationEnd);
                checkAllAnimationsComplete();
            };

            bullText.addEventListener('animationend', handleAnimationEnd);
        }

        function startAll() {
            // Change random image each time animation starts
            ctx!.clearRect(0, 0, width, height);
            drawGrid();
            generateCandles();
            currentIndex = 0;
            animationFrame = requestAnimationFrame(drawChart);

            // Start character animation immediately
            setTimeout(() => {
                animateCharacter();
            }, 600);

            if (initialJumpStatus.current) {
                setPrevEarnedPts(earned_pts || 0); // store previous name before API call
            }

            if (!initialJumpStatus.current) {
                textAnimationComplete = true;
            }
        }

        startAll();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrame);
        };
    }, []); // Remove onAnimationComplete from dependencies to prevent re-runs

    useEffect(() => {
        if (initialJumpStatus.current && earned_pts && earned_pts !== prevEarnedPts) {
            setNewEarnedPts(earned_pts.toString());
        }
    }, [earned_pts, prevEarnedPts]);

    return (
        <div
            ref={containerRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 9999,
                backgroundColor: 'black',
                overflow: 'visible', // Changed to visible to prevent text cutoff
                cursor: !initialJumpStatus.current ? 'pointer' : 'default' // Show pointer for failed jumping
            }}
        // onClick={!initialJumpStatus.current ? handleFailedClick : undefined} // Add click handler for failed jumping
        >
            <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, zIndex: 0 }} />
            <div ref={characterRef} className="stage" style={{ display: 'none' }}>
                <div className="sway">
                    <div className="hop">
                        <div className="tilt">
                            <img id="dancerA" alt="dancer frame" draggable="false" />
                            <img id="dancerB" alt="dancer frame" draggable="false" />
                        </div>
                    </div>
                </div>
            </div>
            <div
                ref={bullTextRef}
                style={{
                    position: 'absolute',
                    top: '40%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: 'clamp(54px, 18vw, 144px)',
                    fontWeight: 900,
                    color: '#ffff00',
                    whiteSpace: 'nowrap',
                    textShadow: '0 0 5px #fff000, 0 0 10px #ffcc00, 0 0 20px #ffcc00, 0 0 40px #ff9900',
                    opacity: 0,
                    pointerEvents: 'none',
                    zIndex: 10
                }}
            >
                Bull Up!!
            </div>
            {showTransitionText && (
                <TransitionTextRow>
                    <BBText $show={showBB}>{prevEarnedPts}<span style={{ fontSize: '2.2rem' }}>pt</span></BBText>
                    <ArrowText $show={showArrow}>→</ArrowText>
                    <BBBText $show={showBBB}>{newEarnedPts}<span style={{ fontSize: '3.2rem' }}>pt</span></BBBText>
                </TransitionTextRow>
            )}
            <VortexElement className={showVortex ? 'active' : ''} />
            <FlashElement className={showFlash ? 'show' : ''} />
        </div>
    );
};

export default BullAnimation; 