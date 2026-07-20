"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type SceneSlide = {
  id: string;
  type: "scene";
  glowPosition: string;
  ridgeBack: string;
  ridgeFront: string;
};

type PhotoSlide = {
  id: string;
  type: "photo";
  src: string;
  alt: string;
};

type Slide = SceneSlide | PhotoSlide;

// "scene" = segnaposto CSS (silhouette + luce), "photo" = foto temporanee fornite da Manuel,
// in attesa delle foto vere dei Journey che sostituiranno tutte le slide.
const SLIDES: Slide[] = [
  {
    id: "sunrise-ridge",
    type: "scene",
    glowPosition: "bottom-[8%] left-[38%] h-[55%] w-[55%] -translate-x-1/2",
    ridgeBack:
      "polygon(0 42%, 14% 30%, 30% 46%, 48% 18%, 66% 40%, 83% 14%, 100% 34%, 100% 100%, 0 100%)",
    ridgeFront:
      "polygon(0 58%, 19% 34%, 37% 60%, 57% 22%, 75% 52%, 100% 18%, 100% 100%, 0 100%)",
  },
  {
    id: "hero-photo-1",
    type: "photo",
    src: "/images/hero-1.jpg",
    alt: "Creator in cima a una montagna al tramonto",
  },
  {
    id: "city-skyline",
    type: "scene",
    glowPosition: "bottom-[15%] left-[18%] h-[40%] w-[40%] -translate-x-1/2",
    ridgeBack:
      "polygon(0 30%, 10% 55%, 22% 20%, 34% 50%, 46% 15%, 58% 48%, 70% 22%, 82% 52%, 94% 18%, 100% 40%, 100% 100%, 0 100%)",
    ridgeFront:
      "polygon(0 50%, 20% 65%, 40% 40%, 60% 62%, 80% 38%, 100% 58%, 100% 100%, 0 100%)",
  },
  {
    id: "hero-photo-2",
    type: "photo",
    src: "/images/hero-2.jpg",
    alt: "Creator che osserva l'alba dalla cima di una montagna",
  },
];

const SLIDE_DURATION_MS = 7000;

export function HeroBackgroundSlideshow() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % SLIDES.length);
    }, SLIDE_DURATION_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden bg-gradient-to-b from-surface via-black to-black">
      {SLIDES.map((slide, index) => (
        <div
          key={slide.id}
          aria-hidden={index !== activeIndex}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === activeIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="absolute inset-0 origin-center animate-[hero-drift_48s_ease-in-out_infinite_alternate]">
            {slide.type === "photo" ? (
              <Image
                src={slide.src}
                alt={slide.alt}
                fill
                sizes="100vw"
                className="object-cover"
              />
            ) : (
              <>
                <div
                  className={`absolute rounded-full bg-ember/40 blur-[110px] ${slide.glowPosition}`}
                />
                <div
                  className="absolute inset-x-0 bottom-0 h-[50%] bg-surface-2"
                  style={{ clipPath: slide.ridgeBack }}
                />
                <div
                  className="absolute inset-x-0 bottom-0 h-[30%] bg-[#0a0a0a]"
                  style={{ clipPath: slide.ridgeFront }}
                />
              </>
            )}
          </div>
        </div>
      ))}

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/50" />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-black/10" />
    </div>
  );
}
