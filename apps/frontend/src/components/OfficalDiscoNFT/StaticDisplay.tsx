"Use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import ImageModal from "./ImageModal";

export default function StaticDisplay({ imageURL }: { imageURL: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [modalImage, setModalImage] = useState('');
  const [randomImages, setRandomImages] = useState<number[]>([]);

  // Function to get random number from range
  const getRandomFromRange = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  // Generate random images on component mount and every 5 minutes
  useEffect(() => {
    const generateRandomImages = () => {
      const images = [
        getRandomFromRange(1, 5),    // A - 1-5
        getRandomFromRange(6, 10),   // B - 6-10
        getRandomFromRange(11, 15),  // C - 11-15
      ];
      
      // Add desktop image (D) if screen is large enough
      if (typeof window !== 'undefined' && window.innerWidth >= 640) {
        images.push(getRandomFromRange(16, 20)); // D - 16-20 (desktop only)
      }
      
      setRandomImages(images);
    };

    // Generate initial images
    generateRandomImages();
    
    // Set up 5-minute interval (5 * 60 * 1000 = 300000ms)
    const interval = setInterval(generateRandomImages, 5 * 60 * 1000);
    
    // Regenerate on window resize
    const handleResize = () => {
      generateRandomImages();
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const openModal = (url: string) => {
    setModalImage(url);
    setIsOpen(true);
  };

  return (
    <>
      {/* Image Grid */}
      <div className="w-full">
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-5">
          {randomImages.map((imageNumber, index) => (
            <div key={index} className="w-full">
              <Image
                width={100}
                height={100}
                src={`${imageURL}${imageNumber}.png`}
                alt={`NFT ${imageNumber}`}
                className="rounded-lg shadow-md cursor-pointer w-full h-auto"
                onClick={() => openModal(`${imageURL}${imageNumber}.png`)}
              />
            </div>
          ))}
        </div>
      </div>
      {/* Image Modal */}
      <ImageModal isOpen={isOpen} onClose={() => { setIsOpen(false) }} imageURL={modalImage} title=""/>
    </>
  );
}
