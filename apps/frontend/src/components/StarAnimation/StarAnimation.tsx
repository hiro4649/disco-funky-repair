import React, { useEffect } from 'react';
import './StarAnimation.css';

const StarAnimation: React.FC = () => {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const starCount = 10;
      
      // Create ring effect
      const ring = document.createElement('div');
      ring.className = 'ring';
      ring.style.left = `${e.pageX}px`;
      ring.style.top = `${e.pageY}px`;
      document.body.appendChild(ring);
      
      setTimeout(() => {
        ring.remove();
      }, 600);
      
      // Create stars
      for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.innerText = '✧';

        const x = e.pageX;
        const y = e.pageY;
        star.style.left = `${x}px`;
        star.style.top = `${y}px`;

        const angle = Math.random() * 2 * Math.PI;
        const distance = 30 + Math.random() * 50;
        const dx = Math.cos(angle) * distance;
        const dy = Math.sin(angle) * distance;
        star.style.setProperty('--move', `translate(${dx}px, ${dy}px)`);

        document.body.appendChild(star);

        setTimeout(() => {
          star.remove();
        }, 500);
      }
    };

    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  return null;
};

export default StarAnimation; 