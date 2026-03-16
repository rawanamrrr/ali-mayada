"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { motion, useScroll, useTransform, Variants, AnimatePresence } from "framer-motion"
import CountdownTimer from "@/components/countdown-timer"
import ScratchToDiscover from "@/components/scratch-to-discover"
import VenueMap from "@/components/venue-map"
import Image from "next/image"
import HandwrittenMessage from "@/components/handwritten-message"
import { useTranslation } from "@/lib/translations"
import { useLanguage } from "@/contexts/LanguageContext"
import { Button } from "@/components/ui/button"
import PhotoUploadSection from "@/components/photo-upload-section"
import RSVPSection from "@/components/rsvp-section"
import { 
  Heart, 
  Music, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Clock, 
  MapPin, 
  Info, 
  MessageSquare, 
  Mail, 
  Camera, 
  Quote,
  Calendar
} from 'lucide-react'

// Format date in Arabic or English
const formatDate = (date: Date, locale: string) => {
  return date.toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Format time in Arabic or English
const formatTime = (date: Date, locale: string) => {
  return date.toLocaleTimeString(locale === 'ar' ? 'ar-EG' : 'en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

// Professional animation variants
const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { 
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1] as const
    }
  }
}

const slideUp: Variants = {
  hidden: { y: 40, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1] as const
    }
  }
}

const scaleIn: Variants = {
  hidden: { scale: 0.98, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1] as const
    }
  }
}

// Professional flying entrance variants
const slideFromLeft: Variants = {
  hidden: { x: -120, opacity: 0, scale: 0.9 },
  visible: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: { 
      duration: 1.2, 
      ease: [0.16, 1, 0.3, 1] as const,
      type: "spring",
      stiffness: 80,
      damping: 20
    }
  }
}

const slideFromRight: Variants = {
  hidden: { x: 120, opacity: 0, scale: 0.9 },
  visible: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: { 
      duration: 1.2, 
      ease: [0.16, 1, 0.3, 1] as const,
      type: "spring",
      stiffness: 80,
      damping: 20
    }
  }
}

// Dramatic fly-in from far left
const flyFromLeft: Variants = {
  hidden: { x: -200, opacity: 0, scale: 0.8, rotate: -5 },
  visible: {
    x: 0,
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { 
      duration: 1.4, 
      ease: [0.16, 1, 0.3, 1] as const,
      type: "spring",
      stiffness: 60,
      damping: 18
    }
  }
}

// Dramatic fly-in from far right
const flyFromRight: Variants = {
  hidden: { x: 200, opacity: 0, scale: 0.8, rotate: 5 },
  visible: {
    x: 0,
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { 
      duration: 1.4, 
      ease: [0.16, 1, 0.3, 1] as const,
      type: "spring",
      stiffness: 60,
      damping: 18
    }
  }
}

// Floating entrance from left with bounce
const floatFromLeft: Variants = {
  hidden: { x: -150, y: -30, opacity: 0, scale: 0.7 },
  visible: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: { 
      duration: 1.5, 
      ease: [0.16, 1, 0.3, 1] as const,
      type: "spring",
      stiffness: 70,
      damping: 15
    }
  }
}

// Floating entrance from right with bounce
const floatFromRight: Variants = {
  hidden: { x: 150, y: -30, opacity: 0, scale: 0.7 },
  visible: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: { 
      duration: 1.5, 
      ease: [0.16, 1, 0.3, 1] as const,
      type: "spring",
      stiffness: 70,
      damping: 15
    }
  }
}

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.1 }
  }
}

const fastStaggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.05 }
  }
}

type SectionDividerVariant = "reveal" | "countdown" | "venue" | "notes" | "guestbook" | "rsvp" | "photos" | "quote"

const SectionDivider = ({ variant, compact = false }: { variant: SectionDividerVariant, compact?: boolean }) => {
  const Icon =
    variant === "reveal" ? Sparkles :
    variant === "countdown" ? Clock :
    variant === "venue" ? MapPin :
    variant === "notes" ? Info :
    variant === "guestbook" ? MessageSquare :
    variant === "rsvp" ? Mail :
    variant === "photos" ? Camera :
    Quote

  return (
    <div className="bg-[#ebebeb]">
      <div className={`max-w-5xl mx-auto px-4 ${compact ? 'py-5 md:py-7' : 'py-12 md:py-16'}`}>
        <div className="flex items-center justify-center gap-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#661314]/25 to-transparent" />
          <div className="relative w-7 h-7 flex items-center justify-center">
            <div className="absolute inset-0 rotate-45 border border-[#661314]/35 bg-[#ebebeb] rounded-[2px]" />
            <div className="absolute inset-0 rotate-45 bg-[#661314]/10 blur-[2px] rounded-[2px]" />
            <Icon className="relative z-10 w-3.5 h-3.5 text-[#661314]/70" />
          </div>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[#661314]/25 to-transparent" />
        </div>
      </div>
    </div>
  )
}

interface ProAnimatedEngagementPageProps {
  onImageLoad?: () => void;
  introFinished?: boolean;
}

export default function ProAnimatedEngagementPage({ onImageLoad, introFinished }: ProAnimatedEngagementPageProps) {
  const t = useTranslation()
  const { language } = useLanguage()
  const [mounted, setMounted] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [gifHasPlayed, setGifHasPlayed] = useState(false)
  const [gifPreloaded, setGifPreloaded] = useState(false)
  const gifRef = useRef<HTMLImageElement>(null)
  const gifTimerRef = useRef<NodeJS.Timeout | null>(null)
  const { scrollYProgress } = useScroll()
  const pathY1 = useTransform(scrollYProgress, [0, 0.5], [0, 20])
  const pathY2 = useTransform(scrollYProgress, [0, 0.5], [0, 40])

  const eventDate = new Date("2026-06-06T18:00:00");
  const formattedDate = formatDate(eventDate, language);
  const formattedTime = formatTime(eventDate, language);

  useEffect(() => {
    setMounted(true);

    if (typeof window !== 'undefined') {
      const staticImg = new window.Image();
      staticImg.src = "/invitation-design.PNG";
      staticImg.onload = () => {
        console.log('✅ Image preloaded and cached');
        setGifPreloaded(true);
      };
      staticImg.onerror = () => {
        console.log('⚠️ Image preload failed');
      };
    }

    // Cleanup timer on unmount
    return () => {
      if (gifTimerRef.current) {
        clearTimeout(gifTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (introFinished) {
      console.log('🎬 Intro finished, showing image');
      setGifHasPlayed(true);
    }
  }, [introFinished]);

  const handleImageLoad = () => {
    setImageLoaded(true)
    onImageLoad?.()
  }

  const handleGifError = () => {
    console.log('❌ Image error');
    setGifHasPlayed(true);
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#ebebeb] flex items-center justify-center">
        <div className="text-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#ebebeb] overflow-x-hidden pt-0">
      {/* Hero Section - Redesigned for exact match with VideoIntro container */}
      <motion.section 
        className="relative w-full h-[100dvh] overflow-hidden bg-black flex items-center justify-center pt-0"
        initial="hidden"
        animate="visible"
        variants={fastStaggerContainer}
      >
        <div className={`absolute inset-0 flex items-center justify-center pt-0 transition-opacity duration-500 ${introFinished ? 'opacity-100' : 'opacity-0'}`}>
          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              key="static-image"
              src="/invitation-design.PNG"
              alt="Amr & Alaa Wedding Invitation"
              fill
              className="object-contain"
              priority
              loading="eager"
              quality={100}
              onLoad={handleImageLoad}
              sizes="100vw"
            />
          </div>
          
          {/* Minimal loading state */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-black flex items-center justify-center z-10">
              <div className="flex flex-col items-center gap-2">
                <div className="w-6 h-6 border-2 border-[#661314] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-white/70">{t('loading')}</span>
              </div>
            </div>
          )}

          {/* Scroll Down Indicator */}
          <motion.div 
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20 cursor-pointer"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: introFinished ? 1 : 0, y: 0 }}
            transition={{ delay: 1.5, duration: 1 }}
            onClick={() => {
              const nextSection = document.querySelector('.bg-[#ebebeb]');
              nextSection?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <span className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-[#661314]/80 font-medium">
              {t('scrollDown')}
            </span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="w-[1px] h-12 bg-gradient-to-b from-[#661314]/60 to-transparent" />
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      <SectionDivider variant="reveal" />

      {/* Scratch to Discover Section */}
      <div className="bg-[#ebebeb]">
        <ScratchToDiscover />
      </div>

      <SectionDivider variant="countdown" compact />

      {/* Countdown Section - Exact match to reference image */}
      <section 
        className="relative py-12 px-4 md:py-16 overflow-hidden bg-[#ebebeb]"
      >
        <div className="relative max-w-6xl mx-auto text-center flex flex-col items-center">
          <h2 className="font-handwritten text-7xl md:text-9xl text-[#661314] mb-12 tracking-tight">
            {t('countdownTitle')}
          </h2>

          <div className="mb-12">
            <CountdownTimer targetDate={new Date("2026-06-06T18:00:00")} />
          </div>

          <p className="font-serif text-lg md:text-xl text-[#661314]/80 italic mt-4">
            {t('countdownSubtitle')}
          </p>
        </div>
      </section>

      <SectionDivider variant="venue" />

      {/* Venue & RSVP Section - Redesigned to match reference */}
      <motion.section 
        className="relative py-20 px-4 md:py-32 bg-[#ebebeb] overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fastStaggerContainer}
      >
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center relative z-10">
          <motion.div 
            className="mb-12 flex flex-col items-center"
            variants={fadeIn}
          >
            <h2 className="font-handwritten text-7xl md:text-9xl text-[#661314] mb-12 tracking-tight">
              {t('venueTitle')}
            </h2>
            <p className="font-serif text-lg md:text-xl text-[#661314]/80 italic mt-4 uppercase tracking-[0.3em]">
              {t('venueSubtitle')}
            </p>
          </motion.div>

          {/* Venue Details Box */}
          <motion.div 
            className="w-full max-w-2xl bg-transparent border border-[#661314]/20 rounded-lg p-8 md:p-12 shadow-sm mb-12"
            variants={scaleIn}
          >
            {/* Venue Illustration/Image Inside the Box */}
            <motion.div 
              className="relative w-full mb-12"
              variants={fadeIn}
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg">
                <Image
                  src="/map-pic.png"
                  alt="Venue Illustration"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </motion.div>

            <motion.h2 
              className="font-serif text-4xl md:text-6xl text-[#661314] mb-6 tracking-tight"
              variants={slideUp}
            >
              Helnan Palestine Hotel
            </motion.h2>

            <motion.div 
              className="flex flex-col items-center gap-1 mb-10"
              variants={fadeIn}
            >
              <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-[#661314]/70 font-medium">
                {t('venueCity')}
              </p>
              <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-[#661314]/70 font-medium">
                {t('venueCountry')}
              </p>
            </motion.div>

            <motion.div 
              className="flex flex-col items-center gap-4 mb-8"
              variants={slideUp}
            >
              <div className="flex items-center gap-3 text-[#661314]">
                <Calendar className="w-5 h-5 md:w-6 md:h-6 opacity-70" />
                <span className="font-serif text-2xl md:text-3xl italic">
                  {formattedDate}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[#661314]">
                <Clock className="w-5 h-5 md:w-6 md:h-6 opacity-70" />
                <span className="font-serif text-2xl md:text-3xl italic">
                  {formattedTime}
                </span>
              </div>
            </motion.div>

            <motion.div
              className="w-full rounded-xl overflow-hidden shadow-sm border border-[#661314]/10"
              variants={fadeIn}
            >
              <VenueMap />
            </motion.div>
          </motion.div>
        </div>
      </motion.section>
      <SectionDivider variant="guestbook" />

      {/* Message Section */}
      <div className="bg-[#ebebeb]">
        <HandwrittenMessage />
      </div>

      <SectionDivider variant="rsvp" />

      {/* RSVP Section */}
      <div className="bg-[#ebebeb]">
        <RSVPSection />
      </div>

      <SectionDivider variant="photos" />

      {/* Photo Upload Section */}
      <div className="bg-[#ebebeb]">
        <PhotoUploadSection />
      </div>

      {t('finalQuote').trim().length > 0 && (
        <>
          <SectionDivider variant="quote" />
          
          {/* Final Quote Section */}
          <motion.section 
            className="relative py-24 text-center overflow-hidden bg-[#ebebeb]"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fastStaggerContainer}
          >
            <div className="max-w-4xl mx-auto px-4">
              <motion.div 
                className="flex items-center justify-center gap-4 mb-12"
                variants={fadeIn}
              >
                <div className="w-16 h-px bg-gradient-to-r from-transparent to-[#661314]" />
                <motion.span 
                  className="text-2xl text-[#661314]"
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  
                </motion.span>
                <div className="w-16 h-px bg-gradient-to-l from-transparent to-[#661314]" />
              </motion.div>
              
              <motion.p 
                className="font-luxury text-3xl md:text-4xl lg:text-5xl text-[#661314] leading-relaxed italic"
                variants={scaleIn}
              >
                "{t('finalQuote')}"
              </motion.p>

              <motion.div 
                className="mt-12 flex justify-center gap-2"
                variants={fadeIn}
              >
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-[#661314]/40"
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                  />
                ))}
              </motion.div>
            </div>
          </motion.section>
        </>
      )}

      <SectionDivider variant="notes" />

      <motion.section
        className="relative py-20 px-4 md:py-32 bg-[#ebebeb] overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fastStaggerContainer}
      >
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center relative z-10">
          <motion.div
            className="mb-12 flex flex-col items-center"
            variants={fadeIn}
          >
            <div className="h-px w-40 bg-gradient-to-r from-transparent via-[#661314]/25 to-transparent" />
          </motion.div>

          <motion.div
            className="relative w-full max-w-[520px]"
            variants={scaleIn}
          >
            <div className="relative w-full aspect-[3/4] md:aspect-[3/4]">
              <Image
                src="/notes-pic.png"
                alt="Notes Frame"
                fill
                className="object-contain"
              />

              <div className="absolute inset-0 flex flex-col px-10 md:px-16 py-12 md:py-16">
                <div className="text-center mt-6 md:mt-5">
                  <p className="text-[14px] md:text-xs uppercase tracking-[0.55em] text-[#661314]/75 font-large">
                    {t('importantNotesTitle')}
                  </p>
                  <div className="mt-5 w-24 h-px bg-gradient-to-r from-transparent via-[#661314]/30 to-transparent mx-auto" />
                </div>

                <div className="mt-8 flex-1 flex flex-col justify-center gap-8 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-4 h-4 relative mb-4">
                      <div className="absolute inset-0 rotate-45 border border-[#661314]/35 bg-[#ebebeb] rounded-[2px]" />
                      <div className="absolute inset-0 rotate-45 bg-[#661314]/10 blur-[2px] rounded-[2px]" />
                    </div>
                    <p className="font-serif text-[13px] md:text-base text-[#661314]/85 italic leading-relaxed max-w-[32ch]">
                      {t('kidsNotAllowed')}
                    </p>
                  </div>

                  <div className="w-28 h-px bg-gradient-to-r from-transparent via-[#661314]/15 to-transparent mx-auto" />

                  <div className="flex flex-col items-center">
                    <div className="w-4 h-4 relative mb-4">
                      <div className="absolute inset-0 rotate-45 border border-[#661314]/35 bg-[#ebebeb] rounded-[2px]" />
                      <div className="absolute inset-0 rotate-45 bg-[#661314]/10 blur-[2px] rounded-[2px]" />
                    </div>
                    <p className="font-serif text-[12px] md:text-sm text-[#661314]/85 leading-snug max-w-[46ch]">
                      {t('parkGarageNote')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>
      
      {/* Footer */}
      <motion.footer 
        className="relative py-24 text-center bg-[#ebebeb]"
        variants={fadeIn}
      >
        <div className="max-w-3xl mx-auto px-4">
          <motion.p 
            className="font-luxury text-3xl md:text-4xl text-[#661314] mb-8 italic leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {t('footerMessage')}
          </motion.p>
          <div className="flex items-center justify-center gap-6 mb-8">
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-[#661314] to-[#661314]" />
            <motion.span 
              className="text-3xl text-[#661314] drop-shadow-lg"
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              style={{ fontFamily: 'Arial, sans-serif' }}
            >
              ♥
            </motion.span>
            <div className="w-24 h-px bg-gradient-to-l from-transparent via-[#661314] to-[#661314]" />
          </div>
          <div className="flex items-center justify-center gap-3 opacity-60">
            <svg className="w-5 h-5 text-[#661314]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
            <svg className="w-4 h-4 text-[#661314]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
            <svg className="w-5 h-5 text-[#661314]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          </div>
        </div>
      </motion.footer>
    </div>
  )
}