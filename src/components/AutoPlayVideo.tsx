"use client";

import { useRef, useEffect } from "react";

interface AutoPlayVideoProps {
  src: string;
  className?: string;
  poster?: string;
}

export default function AutoPlayVideo({ src, className, poster }: AutoPlayVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Force muted attribute on the DOM element (React SSR bug workaround)
    video.muted = true;
    video.setAttribute("muted", "");

    // Attempt to play
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Retry after a short delay if blocked
        setTimeout(() => {
          video.play().catch(() => {});
        }, 500);
      });
    }
  }, []);

  return (
    <video
      ref={videoRef}
      src={src}
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      poster={poster}
      className={className}
    />
  );
}
