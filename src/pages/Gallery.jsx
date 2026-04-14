import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const images = import.meta.glob("../gallery/*.{jpg,jpeg,png}", {
  eager: true,
  import: "default",
});

const imageList = Object.values(images);

const Gallery = () => {
  const [index, setIndex] = useState(null);
  const [scale, setScale] = useState(1);
  const startX = useRef(0);

  const isOpen = index !== null;

  const close = () => {
    setIndex(null);
    setScale(1);
  };

  const next = () => {
    setIndex((prev) => (prev + 1) % imageList.length);
    setScale(1);
  };

  const prev = () => {
    setIndex((prev) =>
      prev === 0 ? imageList.length - 1 : prev - 1
    );
    setScale(1);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e) => {
      if (!isOpen) return;

      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen]);

  // Swipe detection (mobile inside modal)
  const handleTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const endX = e.changedTouches[0].clientX;
    const diff = startX.current - endX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) next();
      else prev();
    }
  };

  // Zoom via wheel
  const handleWheel = (e) => {
    if (!isOpen) return;

    e.preventDefault();
    setScale((prev) => {
      let newScale = prev + (e.deltaY < 0 ? 0.1 : -0.1);
      return Math.min(Math.max(newScale, 1), 3);
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 text-black">
        <div className="text-center pt-12 pb-6">
            <h1 className="text-5xl font-bold tracking-tight">
                Sweet Gallery
            </h1>
        <div className="mt-4 w-16 h-[2px] bg-black mx-auto opacity-20" />
    </div>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 px-6 py-10">
        {imageList.map((src, i) => (
          <div
            key={i}
            className="rounded-2xl overflow-hidden shadow-md bg-white cursor-pointer"
            onClick={() => setIndex(i)}
          >
            <img
              src={src}
              alt={`gallery-${i}`}
              loading="lazy"
              className="w-full h-64 object-cover hover:scale-105 transition"
            />
          </div>
        ))}
      </div>

      {/* LIGHTBOX */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
          onClick={close}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
        >
          {/* Image */}
          <img
            src={imageList[index]}
            alt="zoom"
            className="max-w-[90%] max-h-[85%] rounded-lg shadow-2xl transition-transform duration-200"
            style={{ transform: `scale(${scale})` }}
            onClick={(e) => e.stopPropagation()}
          />

          {/* Close button */}
          <button
            onClick={close}
            className="absolute top-5 right-5 text-white text-3xl"
          >
            ✕
          </button>

          {/* Prev */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className="absolute left-5 text-white text-4xl"
          >
            ‹
          </button>

          {/* Next */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="absolute right-5 text-white text-4xl"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
};

export default Gallery;