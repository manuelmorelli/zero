"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { getGsapScrollTrigger, prefersLightMotion } from "@/lib/gsapClient";

type Slide = {
  id: string;
  src: string;
  alt: string;
};

// Foto placeholder gratuite da Unsplash (natura / crescita personale / viaggio),
// in attesa delle foto reali dei Journey pubblicati che le sostituiranno.
const SLIDES: Slide[] = [
  {
    id: "mountain-sunrise",
    src: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=1920&q=80",
    alt: "Hiker reaching a mountain summit at sunrise",
  },
  {
    id: "forest-path",
    src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1920&q=80",
    alt: "Sunlight through a forest path",
  },
  {
    id: "mountain-lake",
    src: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1920&q=80",
    alt: "Person standing on a cliff above a mountain lake",
  },
  {
    id: "open-road",
    src: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1920&q=80",
    alt: "Open road toward misty mountains, a journey ahead",
  },
];

const SLIDE_DURATION_MS = 5500;

export function HeroBackgroundSlideshow() {
  const [activeIndex, setActiveIndex] = useState(0);
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % SLIDES.length);
    }, SLIDE_DURATION_MS);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const node = parallaxRef.current;
    if (!node || prefersLightMotion()) return;

    const { gsap, ScrollTrigger } = getGsapScrollTrigger();
    const section = node.closest("section");
    if (!section) return;

    const tween = gsap.to(node, {
      yPercent: 12,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      ScrollTrigger.refresh();
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden bg-gradient-to-b from-surface via-black to-black">
      <div ref={parallaxRef} className="absolute inset-0 -top-[10%] h-[120%]">
        {SLIDES.map((slide, index) => (
          <div
            key={slide.id}
            aria-hidden={index !== activeIndex}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === activeIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              sizes="100vw"
              preload={index === 0}
              className="object-cover"
            />
          </div>
        ))}
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/50" />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-black/10" />

      <div className="absolute bottom-6 right-6 flex gap-2 sm:bottom-10 sm:right-10">
        {SLIDES.map((slide, index) => (
          <span
            key={slide.id}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              index === activeIndex ? "w-6 bg-white" : "w-1.5 bg-white/35"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
