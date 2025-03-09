"use client";
import { useState } from "react";
import Image from "next/image";
import { FC } from "react";

export const ImageCarousel: FC<{
  images: {
    url: string;
    url_size_large: string;
    width: number;
    height: number;
  }[];
}> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (images.length === 0) return null;

  return (
    <div className="relative w-[180px] h-[180px] rounded-lg overflow-hidden">
      <Image
        src={images[currentIndex].url || images[currentIndex].url_size_large}
        alt="Note image"
        fill
        className="object-cover"
      />
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-black/70"
          >
            <div className="w-2 h-2 border-l border-t border-white -rotate-45 translate-x-[2px]"></div>
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-black/70"
          >
            <div className="w-2 h-2 border-r border-t border-white rotate-45 translate-x-[-2px]"></div>
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, idx) => (
              <div
                key={idx}
                className={`w-1.5 h-1.5 rounded-full ${
                  idx === currentIndex ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
