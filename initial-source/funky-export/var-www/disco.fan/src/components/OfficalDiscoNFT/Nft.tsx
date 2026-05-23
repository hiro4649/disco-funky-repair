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
  return (
    <>
      <div className="bg-block flex h-[110px] w-[110px] cursor-pointer items-center justify-center rounded-lg border border-dashed border-[#666666] text-center shadow-md sm:h-[130px] sm:w-[130px]">
        <Image
          width={100}
          height={100}
          src={`${imageUrl}`}
          alt={title}
          className="cursor-pointer rounded-lg shadow-md"
          onClick={() => openModal(`${imageUrl}`)}
        />
        {/* <h2 className="nft-title">{title}</h2>
            <p className="nft-description">{description}</p> */}
      </div>
      <ImageModal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
        imageURL={modalImage}
      />
    </>
  );
};

export default Nft;
