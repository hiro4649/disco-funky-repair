import confetti from 'canvas-confetti';

// iOS-specific confetti configuration to prevent disappearing on scroll
export const createIOSConfetti = () => {
  // Check if it's iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  
  if (isIOS) {
    // For iOS, use a more stable approach
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    canvas.style.transform = 'translateZ(0)';
    canvas.style.backfaceVisibility = 'hidden';
    canvas.style.webkitBackfaceVisibility = 'hidden';
    
    // Add to body
    document.body.appendChild(canvas);
    
    // Create confetti with the custom canvas
    const myConfetti = confetti.create(canvas, {
      resize: true,
      useWorker: true,
    });
    
    // Multiple bursts for better effect
    myConfetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#3181A8', '#FCEE3D', '#D4297E', '#D94724', '#93CBCE', '#3D9148', '#E79549', '#E397AD', '#93CBCE', '#D2B155', '#AC7DB1', '#F5C532']
    });
    
    // Second burst
    setTimeout(() => {
      myConfetti({
        particleCount: 80,
        spread: 50,
        origin: { y: 0.4 },
        colors: ['#3181A8', '#FCEE3D', '#D4297E', '#D94724', '#93CBCE', '#3D9148', '#E79549', '#E397AD', '#93CBCE', '#D2B155', '#AC7DB1', '#F5C532']
      });
    }, 300);
    
    // Third burst
    setTimeout(() => {
      myConfetti({
        particleCount: 60,
        spread: 30,
        origin: { y: 0.8 },
        colors: ['#3181A8', '#FCEE3D', '#D4297E', '#D94724', '#93CBCE', '#3D9148', '#E79549', '#E397AD', '#93CBCE', '#D2B155', '#AC7DB1', '#F5C532']
      });
    }, 600);
    
    // Clean up after animation
    setTimeout(() => {
      if (canvas && canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    }, 5000);
    
  } else {
    // For non-iOS devices, use standard confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#3181A8', '#FCEE3D', '#D4297E', '#D94724', '#93CBCE', '#3D9148', '#E79549', '#E397AD', '#93CBCE', '#D2B155', '#AC7DB1', '#F5C532']
    });
  }
};

// Alternative: Use the custom Confetti component instead of canvas-confetti
export const useCustomConfetti = () => {
  // This will use the existing Confetti component which is more stable
  return true;
};
