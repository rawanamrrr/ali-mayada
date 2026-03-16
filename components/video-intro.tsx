"use client"

import { useRef, useState } from "react"
import { Hand } from "lucide-react"
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
          <motion.div 
            className="w-14 h-14 rounded-full border-2 border-white/50 flex items-center justify-center mb-3 bg-black/20 backdrop-blur-sm"
            animate={{ 
              scale: [1, 1.1, 1],
              borderColor: ["rgba(255,255,255,0.5)", "rgba(255,255,255,0.8)", "rgba(255,255,255,0.5)"]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          >
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            >
              <Hand className="w-5 h-5 text-white" />
            </motion.div>
          </motion.div>
          <span className="text-white/80 text-xs font-medium tracking-wide">{t('tapToContinue')}</span>
        </motion.div>
      )}
    </div>
  );
}
