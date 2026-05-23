"Use client";

import { useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, Keyboard } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import ImageModal from "./ImageModal";

const imageArr = Array.from({ length: 10 }, (_, index) => index + 1);

export default function AutoScrollCarousel({ imageURL }: { imageURL: string }) {
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
      <div className="w-full overflow-hidden">
        <Swiper
          spaceBetween={"20px"}
          modules={[Autoplay]}
          breakpoints={{
            640: { slidesPerView: 4 }, // Show 4 images on tablets & larger screens
            0: { slidesPerView: 3 }, // Show 3 images on mobile
          }}
          loop={true}
          speed={3000}
          autoplay={{ delay: 0 }}
          freeMode={true}
        >
          {imageArr.map((_, index) => (
            <SwiperSlide key={index} className="w-[auto]">
              <Image
                width={100}
                height={100}
                src={`${imageURL}${index + 1}.png`}
                alt={`NFT ${index}`}
                className="rounded-lg shadow-md cursor-pointer"
                onClick={() => openModal(`${imageURL}${index + 1}.png`)}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      {/* Image Modal */}
      <ImageModal isOpen={isOpen} onClose={() => { setIsOpen(false) }} imageURL={modalImage}/>
    </>
  );
}
