"use client";

import { useRef, useState } from "react";

const VIDEOS = ["/background/1.mp4", "/background/2.mp4", "/background/3.mp4", "/background/4.mp4", "/background/5.mp4"];

export default function VideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [index, setIndex] = useState(0);

  function handleEnded() {
    const next = (index + 1) % VIDEOS.length;
    setIndex(next);
  }

  return (
    <video
      ref={videoRef}
      key={index}
      autoPlay
      muted
      playsInline
      preload="auto"
      onEnded={handleEnded}
    >
      <source src={VIDEOS[index]} type="video/mp4" />
    </video>
  );
}