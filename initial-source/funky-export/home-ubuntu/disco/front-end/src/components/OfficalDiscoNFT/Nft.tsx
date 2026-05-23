import React, { useState } from "react";
import Image from "next/image";
import ImageModal from "../OfficalDiscoNFT/ImageModal";

interface NftProps {
  imageUrl: string;
  title: string;
  description: string;
}

const Nft: React.FC<NftProps> = ({ imageUrl, title, description }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalImage, setModalImage] = useState("");
  
  const openModal = (url: string) => {
    setModalImage(url);
    setIsOpen(true);
  };

  // Check if URL is external (starts with http) or local
  const isExternalUrl = imageUrl?.startsWith('http');

  return (
    <>
      <div className="bg-block flex h-[110px] w-[110px] cursor-pointer items-center justify-center rounded-lg border border-dashed border-[#666666] text-center shadow-md sm:h-[130px] sm:w-[130px]">
        {isExternalUrl ? (
          <img
            width={100}
            height={100}
            src={imageUrl}
            alt={title}
            className="cursor-pointer rounded-lg shadow-md w-[100px] h-[100px] object-cover"
            onClick={() => openModal(imageUrl)}
            onError={(e) => {
              console.error('NFT image load error:', imageUrl);
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <Image
            width={100}
            height={100}
            src={imageUrl || '/images/placeholder-nft.png'}
            alt={title}
            className="cursor-pointer rounded-lg shadow-md"
            onClick={() => openModal(imageUrl)}
          />
        )}
      </div>
      <ImageModal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
        title={title}
        imageURL={modalImage}
      />
    </>
  );
};

export default Nft;
