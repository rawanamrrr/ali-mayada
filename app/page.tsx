"use client"

import { useState, useEffect, useCallback } from "react"
import dynamic from "next/dynamic"
import { motion, AnimatePresence } from "framer-motion"


// Dynamically import the VideoIntro component with no SSR to prevent hydration issues
const VideoIntro = dynamic(() => import("@/components/video-intro"), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-black flex items-center justify-center"><div className="text-white">Loading video...</div></div>,
})

// Dynamically import the main content to ensure it's loaded only when needed
const ProAnimatedEngagementPage = dynamic(
  () => import("@/components/pro-animated-engagement-page"),
  { 
    ssr: false,
    loading: () => <div className="min-h-screen bg-background flex items-center justify-center"><div className="text-foreground">Loading...</div></div>
  }
)

export default function Home() {
  const [introFinished, setIntroFinished] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleIntroFinish = useCallback(() => {
    setIntroFinished(true);
    // Scroll to top when intro finishes naturally
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'auto' });
      }
    }, 100);
  }, []);

  const handleIntroSkip = useCallback(() => {
    setIntroFinished(true);
    // Scroll to top when intro is skipped
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'auto' });
      }
    }, 100);
  }, []);

  const handleImageLoad = useCallback(() => {
    setIsImageLoaded(true)
  }, [])

  // Preload the main image for a smoother transition
  useEffect(() => {
    if (mounted) {
      const img = new Image()
      img.src = "/invitation-design.jpg"
      img.onload = handleImageLoad
    }
  }, [mounted, handleImageLoad])

  if (!mounted) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen relative overflow-hidden bg-black">
      {/* Main Content - Always present but underneath */}
      <div className={`w-full transition-opacity duration-700 ${introFinished ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <ProAnimatedEngagementPage onImageLoad={handleImageLoad} introFinished={introFinished} />
      </div>

      {/* Video Intro - Overlays everything until finished */}
      <AnimatePresence>
        {!introFinished && (
          <motion.div 
            key="video-intro"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="fixed inset-0 z-[9999] bg-black"
          >
            <VideoIntro 
              onComplete={handleIntroFinish} 
              onSkip={handleIntroSkip} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}