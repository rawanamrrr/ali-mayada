"use client"

import { motion, Variants } from "framer-motion"
import { useTranslation } from "@/lib/translations"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Camera, Upload } from "lucide-react"

// Professional animation variants matching the main page
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

const fastStaggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.05 }
  }
}

export default function PhotoUploadSection() {
  const t = useTranslation()
  
  const driveLink = "https://drive.google.com/drive/folders/1YZzGFb1DvbcIvPTRpZVCOl84da59a91j"

  const handleUploadClick = () => {
    window.open(driveLink, "_blank")
  }

  return (
    <motion.section 
      className="relative py-8 px-4 md:py-12 bg-[#ebebeb] overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={fastStaggerContainer}
    >
      <div className="relative max-w-6xl mx-auto text-center flex flex-col items-center">
        <motion.div 
          className="mb-8 flex flex-col items-center"
          variants={fadeIn}
        >
          <h2 className="font-handwritten text-7xl md:text-9xl text-[#661314] mb-4 tracking-tight">
            {t('photosTitle')}
          </h2>
          <p className="font-serif text-lg md:text-xl text-[#661314]/80 italic mt-4">
            {t('sharePhotosDescription')}
          </p>
        </motion.div>

        <motion.div 
          className="w-full max-w-2xl bg-transparent border border-[#661314]/20 rounded-lg p-8 md:p-12 shadow-sm"
          variants={scaleIn}
        >
          <div className="relative z-10">
            {/* QR Code Section */}
            <motion.div 
              className="flex flex-col items-center mb-10"
              variants={fadeIn}
            >
              <div className="bg-white p-4 rounded-xl shadow-sm mb-6 border border-[#661314]/10">
                <Image 
                  src="/qr-code-img.png" 
                  alt="QR Code" 
                  width={180} 
                  height={180}
                  className="w-[180px] h-[180px]"
                />
              </div>
              <p className="font-serif text-lg text-[#661314] text-center mb-2 font-medium">
                {t('scanQRCode')}
              </p>
            </motion.div>

            {/* Divider */}
            <div className="flex items-center gap-4 my-8">
              <div className="flex-1 h-px bg-[#661314]/10" />
              <span className="text-[#661314]/40 font-serif text-sm uppercase tracking-widest italic">
                {t('or')}
              </span>
              <div className="flex-1 h-px bg-[#661314]/10" />
            </div>

            {/* Upload Button */}
            <motion.div
              className="flex justify-center"
              variants={fadeIn}
            >
              <Button
                onClick={handleUploadClick}
                className="group relative px-8 py-6 text-lg font-serif bg-[#661314] hover:opacity-90 text-white rounded-lg shadow-sm transition-all duration-300 hover:scale-[1.02]"
              >
                <Upload className="w-5 h-5 mr-3" />
                {t('uploadButton')}
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  )
}
