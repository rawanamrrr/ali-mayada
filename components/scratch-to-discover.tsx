"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import ScratchCard from './scratch-card'
import { useTranslation } from '@/lib/translations'

const ScratchToDiscover = () => {
  const t = useTranslation()
  const [scratchedStates, setScratchedStates] = useState([false, false, false])
  const [allRevealed, setAllRevealed] = useState(false)

  const handleComplete = useCallback((index: number) => {
    setScratchedStates(prev => {
      if (prev[index]) return prev
      const newState = [...prev]
      newState[index] = true
      
      const completedCount = newState.filter(Boolean).length
      if (completedCount === 3) {
        setAllRevealed(true)
        // Trigger sparkles immediately
        const duration = 4 * 1000
        const animationEnd = Date.now() + duration
        
        // Custom shapes to match the image: dark red circles and rectangles
        const darkRed = '#661314'
        const shapes = ['circle', 'square']
        
        const interval: any = setInterval(function() {
          const timeLeft = animationEnd - Date.now()
          if (timeLeft <= 0) return clearInterval(interval)
          
          const particleCount = 20
          
          confetti({
            particleCount,
            startVelocity: 30,
            spread: 360,
            origin: { x: Math.random(), y: Math.random() * 0.5 },
            colors: [darkRed],
            shapes: shapes as any,
            scalar: 1.2, // Slightly larger particles
            drift: 0,
            gravity: 0.8,
            ticks: 150
          })
        }, 200)
      }
      return newState
    })
  }, [])

  return (
    <div className="bg-[#ebebeb] overflow-x-hidden pt-0 pb-4">
      {/* Ultra-luxury background elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#661314]/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#661314]/5 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
        <div className="mb-4 flex flex-col items-center opacity-100">
          
          <h2 className="font-handwritten text-7xl md:text-9xl text-[#661314] mb-4 tracking-tight">
            {t('revealTitle')}
          </h2>
          <p className="text-[#661314] font-serif tracking-[0.3em] text-[10px] md:text-xs uppercase font-medium">
            {t('revealInstruction')}
          </p>
        </div>

        <div className="flex flex-row items-center justify-center gap-6 md:gap-12">
          {/* Day */}
          <div className="flex flex-col items-center gap-2">
            <ScratchCard width={100} height={100} onComplete={() => handleComplete(0)} shimmerColor="#dedad2" brushSize={45}>
              <div className="text-center">
                <span className="text-2xl md:text-4xl font-bold text-[#661314]">06</span>
              </div>
            </ScratchCard>
          </div>

          {/* Month */}
          <div className="flex flex-col items-center gap-2">
            <ScratchCard width={100} height={100} onComplete={() => handleComplete(1)} shimmerColor="#dedad2" brushSize={45}>
              <div className="text-center">
                <span className="text-2xl md:text-4xl font-bold text-[#661314]">{t('revealMonthValue')}</span>
              </div>
            </ScratchCard>
          </div>

          {/* Year */}
          <div className="flex flex-col items-center gap-2">
            <ScratchCard width={100} height={100} onComplete={() => handleComplete(2)} shimmerColor="#dedad2" brushSize={45}>
              <div className="text-center">
                <span className="text-2xl md:text-4xl font-bold text-[#661314]">2026</span>
              </div>
            </ScratchCard>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {allRevealed && (
            <motion.div
              key="wedding-message"
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ 
                duration: 0.05,
                ease: "linear"
              }}
              className="mt-8 relative"
            >
              <h3 className="font-serif text-1xl md:text-5xl text-[#661314] drop-shadow-sm whitespace-nowrap py-4">
                {t('weAreGettingMarried')}
              </h3>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default ScratchToDiscover
