"use client"

import { useRef, useState } from "react"
import { motion } from "framer-motion"
import { useTranslation } from "@/lib/translations"

interface VideoIntroProps {
  onComplete: () => void
  onSkip: () => void
}

export default function VideoIntro({ onComplete, onSkip }: VideoIntroProps) {
  const t = useTranslation()
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleVideoClick = () => {
    const video = videoRef.current;
    if (video && video.paused) {
      video.play().then(() => {
        setIsPlaying(true);
      }).catch(error => {
        console.error("Video play failed:", error);
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-[9999]">
      <div 
        className="w-full h-full flex items-center justify-center bg-black relative cursor-pointer"
        onClick={handleVideoClick}
      >
        <video 
          ref={videoRef}
          className="h-auto max-h-full w-auto max-w-full object-contain"
          playsInline={true}
          muted={true}
          autoPlay={false}
          onEnded={onComplete}
          preload="auto"
          disablePictureInPicture
          loop={false}
        >
          <source src="/engagement-video.mp4#t=0.001" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Tap to Continue - Visual UI only, not clickable */}
      {!isPlaying && (
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center z-50 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <motion.img
            src="/letters.png"
            alt={t('tapToContinue')}
            className="w-45 max-w-[85vw] h-auto drop-shadow-[0_6px_18px_rgba(0,0,0,0.65)]"
            animate={{
              opacity: [0.85, 1, 0.85],
              scale: [1, 1.06, 1],
              y: [0, -10, 0],
            }}
            transition={{ duration: 2.0, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      )}
    </div>
  );
}
