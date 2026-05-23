"use client"; 
import Image from "next/image";
import { useState } from "react";

interface FallbackImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className: string;
  fallbackSrc?: string;
}

export default function FallbackImage({
  src,
  alt,
  width,
  height,
  className,
  fallbackSrc = "/images/no_exist_image.svg", // Default fallback image
}: FallbackImageProps) {
  const [imageSrc, setImageSrc] = useState(src);

  return (
    <Image
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={() => setImageSrc(fallbackSrc)}
    />
  );
}
