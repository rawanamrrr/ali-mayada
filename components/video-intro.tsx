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
  const [isVideoReady, setIsVideoReady] = useState(false)
  const [isLettersReady, setIsLettersReady] = useState(false)

  const assetsReady = isVideoReady && isLettersReady

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
          className="absolute inset-0 w-full h-full object-cover md:object-contain"
          playsInline={true}
          muted={true}
          autoPlay={false}
          onEnded={onComplete}
          onLoadedData={() => setIsVideoReady(true)}
          onCanPlay={() => setIsVideoReady(true)}
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
          animate={{ opacity: assetsReady ? 1 : 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.img
            src="/letters.png"
            alt={t('tapToContinue')}
            className="w-70 md:w-68 max-w-[80vw] h-auto drop-shadow-[0_8px_24px_rgba(0,0,0,0.7)] mix-blend-multiply mr-3 md:mr-12"
            onLoad={() => setIsLettersReady(true)}
            animate={{
              opacity: [0.85, 1, 0.85],
              scale: [1, 1.06, 1],
              y: [0, -10, 0],
            }}
            transition={{ duration: 2.0, repeat: Infinity, ease: "easeInOut" }}
          />

          <button
            type="button"
            className="pointer-events-auto absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-[150px] md:translate-y-[108px] text-[#efc848] text-4xl md:text-4xl leading-none drop-shadow-[0_6px_18px_rgba(0,0,0,0.65)] mr-7 md:mr-18"
            style={{ fontFamily: "var(--font-great-vibes)" }}
            onClick={(e) => {
              e.stopPropagation()
              handleVideoClick()
            }}
          >
            Click on me
          </button>
        </motion.div>
      )}
    </div>
  );
}
