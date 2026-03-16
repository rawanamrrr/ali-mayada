"use client"

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'

interface ScratchCardProps {
  width: number
  height: number
  finishPercent?: number
  onComplete?: () => void
  children: React.ReactNode
  shimmerColor?: string
  brushSize?: number
}

const ScratchCard: React.FC<ScratchCardProps> = ({
  width,
  height,
  finishPercent = 30,
  onComplete,
  children,
  shimmerColor = "#dedad2",
  brushSize = 50
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isRevealed, setIsRevealed] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const centerX = width / 2
    const centerY = height / 2

    // Create the base refined gold radial gradient to match the image exactly
    const radialGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, width / 2)
    radialGradient.addColorStop(0, '#fef1ca')   // Soft creamy center highlight
    radialGradient.addColorStop(0.3, '#f2dca3') // Light sand gold
    radialGradient.addColorStop(0.6, '#e2c38a') // Rich gold tone
    radialGradient.addColorStop(1, '#d4b170')   // Muted gold edge
    
    ctx.fillStyle = radialGradient
    ctx.fillRect(0, 0, width, height)

    // High-end Anisotropic/Conical Shimmer (Simulated)
    const segments = 240
    for (let i = 0; i < segments; i++) {
      const startAngle = (i * 2 * Math.PI) / segments
      const endAngle = ((i + 1) * 2 * Math.PI) / segments
      
      const opacity = 0.03 + Math.random() * 0.08
      const isHighLight = i % 40 < 4
      const isShadow = i % 40 > 32
      
      if (isHighLight) {
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 1.8})`
      } else if (isShadow) {
        ctx.fillStyle = `rgba(139, 101, 8, ${opacity})`
      } else {
        // Balanced gold midtones
        ctx.fillStyle = `rgba(242, 220, 163, ${opacity})`
      }
      
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, width, startAngle, endAngle)
      ctx.closePath()
      ctx.fill()
    }

    // Add ultra-fine concentric "lathe" marks
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.03)'
    ctx.lineWidth = 0.3
    for (let i = 0; i < 60; i++) {
      ctx.beginPath()
      ctx.arc(centerX, centerY, (width / 60) * i, 0, Math.PI * 2)
      ctx.stroke()
    }

    // Add circular "brushed" texture lines
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)'
    ctx.lineWidth = 0.5
    for (let i = 0; i < 20; i++) {
      ctx.beginPath()
      ctx.arc(centerX, centerY, (width / 20) * i, 0, Math.PI * 2)
      ctx.stroke()
    }

    // Add a final subtle highlight across the whole thing
    const highlight = ctx.createLinearGradient(0, 0, width, height)
    highlight.addColorStop(0, 'rgba(255, 255, 255, 0.1)')
    highlight.addColorStop(0.5, 'rgba(255, 255, 255, 0)')
    highlight.addColorStop(1, 'rgba(255, 255, 255, 0.1)')
    ctx.fillStyle = highlight
    ctx.fillRect(0, 0, width, height)

  }, [width, height])

  useEffect(() => {
    initCanvas()
  }, [initCanvas])

  const getFilledInPixels = (ctx: CanvasRenderingContext2D, stride: number = 32) => {
    const pixels = ctx.getImageData(0, 0, width, height)
    const pdata = pixels.data
    const l = pdata.length
    const total = l / stride
    let count = 0

    for (let i = 0; i < l; i += stride) {
      if (pdata[i + 3] === 0) {
        count++
      }
    }

    return (count / total) * 100
  }

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (isRevealed) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    let x, y

    if ('touches' in e) {
      if (e.cancelable) e.preventDefault()
      x = (e.touches[0].clientX - rect.left) * scaleX
      y = (e.touches[0].clientY - rect.top) * scaleY
      if (!isDrawing) setIsDrawing(true)
    } else {
      if (!isDrawing) return
      x = (e.clientX - rect.left) * scaleX
      y = (e.clientY - rect.top) * scaleY
    }

    ctx.globalCompositeOperation = 'destination-out'
    
    const scratchPattern = [
      [0, 0], [20, 0], [-20, 0], [0, 20], [0, -20],
      [15, 15], [-15, 15], [15, -15], [-15, -15],
      [30, 0], [-30, 0], [0, 30], [0, -30],
      [20, 20], [-20, 20], [20, -20], [-20, -20]
    ]
    
    scratchPattern.forEach(([ox, oy]) => {
      ctx.beginPath()
      ctx.arc(x + ox, y + oy, brushSize * 1.5, 0, Math.PI * 2)
      ctx.fill()
    })

    // Reveal immediately on ANY scratch movement
    if (!isRevealed) {
      setIsRevealed(true)
      // Call onComplete immediately
      if (onComplete) {
        onComplete()
      }
    }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isRevealed) return
    setIsDrawing(true)
    
    // Immediate reveal on touch start
    setIsRevealed(true)
    if (onComplete) {
      onComplete()
    }
    
    handleMove(e)
  }

  const handlePointerDown = () => {
    if (isRevealed) return
    setIsDrawing(true)
    
    // Immediate reveal on mouse/pointer down
    setIsRevealed(true)
    if (onComplete) {
      onComplete()
    }
  }

  return (
    <div 
      className="relative overflow-hidden rounded-full border-[6px] border-white shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] ring-1 ring-black/5"
      style={{ width: width + 12, height: height + 12 }}
    >
      <div 
        className="relative overflow-hidden rounded-full w-full h-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] bg-[#fcfaf7]"
      >
      {/* Luxury shimmer overlay */}
      {!isRevealed && (
        <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden rounded-full">
          <motion.div
            animate={{
              x: ['-100%', '200%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-1/2 -skew-x-12"
          />
        </div>
      )}
      {/* Revealed Content */}
      <div className="absolute inset-0 flex items-center justify-center bg-white">
        {children}
      </div>

      {/* Scratch Layer */}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={`absolute inset-0 w-full h-full cursor-pointer transition-opacity duration-700 ${isRevealed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        style={{ touchAction: 'none' }}
        onMouseDown={handlePointerDown}
        onMouseUp={() => setIsDrawing(false)}
        onMouseLeave={() => setIsDrawing(false)}
        onMouseMove={handleMove}
        onTouchStart={handleTouchStart}
        onTouchEnd={() => setIsDrawing(false)}
        onTouchMove={handleMove}
        onClick={() => {
          if (!isRevealed) {
            setIsRevealed(true);
            if (onComplete) onComplete();
          }
        }}
      />
      </div>
    </div>
  )
}

export default ScratchCard
