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
  const [lastPoint, setLastPoint] = useState<{ x: number, y: number } | null>(null)
  const scratchCounterRef = useRef(0)
  const hasCompletedRef = useRef(false)

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

  const getFilledInPixels = useCallback((ctx: CanvasRenderingContext2D, stride: number = 32) => {
    const pixels = ctx.getImageData(0, 0, width, height)
    const pdata = pixels.data
    const l = pdata.length
    const total = (width * height) / stride
    let count = 0

    // Check alpha channel for erased pixels
    for (let i = 0; i < l; i += stride * 4) {
      if (pdata[i + 3] < 150) { // More sensitive check for scratched area
        count++
      }
    }

    return (count / total) * 100
  }, [width, height])

  const completeReveal = useCallback(() => {
    if (hasCompletedRef.current) return
    hasCompletedRef.current = true
    setIsRevealed(true)
    setIsDrawing(false)
    if (onComplete) onComplete()
  }, [onComplete])

  const getEventPoint = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    
    // Calculate the scale between CSS pixels and Canvas pixels
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    let clientX, clientY
    if ('touches' in e) {
      if (e.touches.length === 0) return null
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = (e as React.MouseEvent).clientX
      clientY = (e as React.MouseEvent).clientY
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    }
  }

  const scratchAt = useCallback((x: number, y: number) => {
    const canvas = canvasRef.current
    if (!canvas || isRevealed) return
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    ctx.globalCompositeOperation = 'destination-out'
    ctx.fillStyle = 'rgba(0,0,0,1)'
    ctx.strokeStyle = 'rgba(0,0,0,1)'
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    ctx.lineWidth = brushSize

    ctx.beginPath()
    if (lastPoint) {
      ctx.moveTo(lastPoint.x, lastPoint.y)
      ctx.lineTo(x, y)
      ctx.stroke()
    } else {
      // For the first touch/click, draw a circle to ensure immediate feedback
      ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2)
      ctx.fill()
    }

    setLastPoint({ x, y })

    // Check percentage every 5 moves to stay responsive but performant
    scratchCounterRef.current++
    if (scratchCounterRef.current % 5 === 0) {
      const scratched = getFilledInPixels(ctx)
      if (scratched >= finishPercent) {
        completeReveal()
      }
    }
  }, [brushSize, completeReveal, finishPercent, isRevealed, lastPoint, getFilledInPixels])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isRevealed) return
    setIsDrawing(true)
    const p = getEventPoint(e)
    if (p) {
      setLastPoint(null) // Reset last point for new stroke
      scratchAt(p.x, p.y)
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || isRevealed) return
    const p = getEventPoint(e)
    if (p) scratchAt(p.x, p.y)
  }

  const handleMouseUp = () => {
    setIsDrawing(false)
    setLastPoint(null)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isRevealed) return
    // Only prevent default if we're actually scratching to allow page scroll otherwise
    setIsDrawing(true)
    const p = getEventPoint(e)
    if (p) {
      setLastPoint(null) // Reset last point for new stroke
      scratchAt(p.x, p.y)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDrawing || isRevealed) return
    // Prevent scrolling while scratching
    if (e.cancelable) e.preventDefault()
    const p = getEventPoint(e)
    if (p) scratchAt(p.x, p.y)
  }

  const handleTouchEnd = () => {
    setIsDrawing(false)
    setLastPoint(null)
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
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onTouchMove={handleTouchMove}
      />
      </div>
    </div>
  )
}

export default ScratchCard
