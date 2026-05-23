"Use client";

import { useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, Keyboard } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import ImageModal from "./ImageModal";

const imageArr = Array.from({ length: 14 }, (_, index) => index + 1);

export default function DisconnectNFTs({ imageURL }: { imageURL: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [modalImage, setModalImage] = useState('');

  const openModal = (url: string) => {
    setModalImage(url);
    setIsOpen(true);
  };

  return (
    <>
      {/* Image Carousel */}
      <div className="bg-block flex sm:w-[130px] sm:h-[130px] h-[110px] w-[110px] cursor-pointer items-center justify-center rounded-lg border border-dashed border-[#666666] text-center shadow-md">
        <Swiper
          spaceBetween={"20px"}
          modules={[Autoplay]}
          breakpoints={{
            640: { slidesPerView: 1 }, // Show 4 images on tablets & larger screens
            0: { slidesPerView: 1 }, // Show 3 images on mobile
          }}
          loop={true}
          speed={5500}
          autoplay={{ delay: 0 }}
          freeMode={true}
        >
          {imageArr.map((_, index) => (
            <SwiperSlide key={index} className="w-[auto]">
              <Image
                width={130}
                height={130}
                src={`${imageURL}nft_sample${index + 1}.png`}
                alt={`NFT ${index}`}
                className="rounded-lg shadow-md cursor-pointer"
                onClick={() => openModal(`${imageURL}nft_sample${index + 1}.png`)}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      {/* Image Modal */}
      <ImageModal isOpen={isOpen} onClose={() => { setIsOpen(false) }} imageURL={modalImage} title=""/>
    </>
  );
}
