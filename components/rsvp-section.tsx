"use client"

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from '@/lib/translations'

export default function RSVPSection() {
  const t = useTranslation()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [name, setName] = useState('')
  const [attending, setAttending] = useState<'yes' | 'no' | ''>('')
  const [guests, setGuests] = useState('1')
  const [guestNames, setGuestNames] = useState<string[]>([''])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' as 'success' | 'error' | 'info' | '' })
  
  // Message Section States
  const [messageType, setMessageType] = useState<'drawn' | 'written'>('drawn')
  const [writtenText, setWrittenText] = useState('')
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentColor, setCurrentColor] = useState('#000000')
  const [currentWidth, setCurrentWidth] = useState(3)
  const [history, setHistory] = useState<string[]>([])
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null)
  
  const points = useRef<Array<{x: number, y: number, pressure: number}>>([])
  const rafId = useRef<number | null>(null)
  const lastWidth = useRef(3)
  const lastTouchTime = useRef(0)
  const isProcessingStop = useRef(false)
  const hasSavedToHistory = useRef(false)
  const canvasStateBeforeDrawing = useRef<ImageData | null>(null)

  const penColors = [
    { color: '#000000', name: t('colorBlack') },
    { color: '#EF4444', name: t('colorRed') },
    { color: '#3B82F6', name: t('colorBlue') },
    { color: '#10B981', name: t('colorGreen') },
    { color: '#8B5CF6', name: t('colorPurple') },
    { color: '#F59E0B', name: t('colorOrange') },
  ]

  // Initialize canvas
  useEffect(() => {
    if (messageType !== 'drawn' || !canvasRef.current) return

    const canvas = canvasRef.current
    const container = canvas.parentElement
    if (container) {
      canvas.width = container.clientWidth
      canvas.height = 300
    }

    const context = canvas.getContext('2d')
    if (context) {
      context.lineCap = 'round'
      context.lineJoin = 'round'
      context.strokeStyle = currentColor
      context.lineWidth = currentWidth
      context.fillStyle = 'white'
      context.fillRect(0, 0, canvas.width, canvas.height)
      setCtx(context)
      
      if (history.length === 0) {
        setHistory([canvas.toDataURL()])
      }
    }
  }, [messageType])

  const getPressure = (e: any): number => {
    if (e.force) return Math.min(Math.max(e.force, 0.1), 1)
    return 0.5
  }

  const getCanvasCoordinates = (e: any) => {
    if (!canvasRef.current) return null
    const rect = canvasRef.current.getBoundingClientRect()
    const touch = e.touches ? e.touches[0] : e
    return {
      x: (touch.clientX - rect.left) * (canvasRef.current.width / rect.width),
      y: (touch.clientY - rect.top) * (canvasRef.current.height / rect.height)
    }
  }

  const drawSmoothLine = () => {
    if (!ctx || points.current.length < 3) return
    const pts = points.current
    ctx.beginPath()
    ctx.moveTo(pts[0].x, pts[0].y)
    for (let i = 1; i < pts.length - 2; i++) {
      const xc = (pts[i].x + pts[i + 1].x) / 2
      const yc = (pts[i].y + pts[i + 1].y) / 2
      ctx.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc)
    }
    const avgPressure = pts.reduce((sum, p) => sum + p.pressure, 0) / pts.length
    const targetWidth = currentWidth * (0.5 + avgPressure * 0.5)
    ctx.lineWidth = lastWidth.current + (targetWidth - lastWidth.current) * 0.3
    lastWidth.current = ctx.lineWidth
    ctx.stroke()
  }

  const startDrawing = (e: any) => {
    e.preventDefault()
    if (Date.now() - lastTouchTime.current < 500 && !e.touches) return
    if (e.touches) lastTouchTime.current = Date.now()
    
    const coords = getCanvasCoordinates(e)
    if (!coords || !ctx || !canvasRef.current) return

    canvasStateBeforeDrawing.current = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height)
    points.current = [{ ...coords, pressure: getPressure(e) }]
    setIsDrawing(true)
    hasSavedToHistory.current = false
    isProcessingStop.current = false

    const loop = () => {
      if (points.current.length >= 3) drawSmoothLine()
      rafId.current = requestAnimationFrame(loop)
    }
    rafId.current = requestAnimationFrame(loop)
  }

  const draw = (e: any) => {
    e.preventDefault()
    if (!isDrawing) return
    const coords = getCanvasCoordinates(e)
    if (coords) points.current.push({ ...coords, pressure: getPressure(e) })
  }

  const stopDrawing = () => {
    if (!isDrawing || isProcessingStop.current) return
    isProcessingStop.current = true
    setIsDrawing(false)
    if (rafId.current) cancelAnimationFrame(rafId.current)

    // Handle dot drawing (if there are very few points, it's likely a tap)
    if (ctx && points.current.length > 0 && points.current.length < 3) {
      const point = points.current[0]
      ctx.beginPath()
      ctx.arc(point.x, point.y, currentWidth / 2, 0, Math.PI * 2)
      ctx.fillStyle = currentColor
      ctx.fill()
    }

    if (canvasRef.current && !hasSavedToHistory.current) {
      hasSavedToHistory.current = true
      setHistory(prev => [...prev, canvasRef.current!.toDataURL()])
    }
  }

  const clearCanvas = () => {
    if (!ctx || !canvasRef.current) return
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    setHistory([canvasRef.current.toDataURL()])
  }

  const undo = () => {
    if (!ctx || !canvasRef.current || history.length <= 1) return
    const newHistory = [...history]
    newHistory.pop()
    setHistory(newHistory)
    const img = new window.Image()
    img.onload = () => ctx.drawImage(img, 0, 0)
    img.src = newHistory[newHistory.length - 1]
  }

  const handleGuestsChange = (value: string) => {
    setGuests(value)
    const count = parseInt(value, 10) || 0
    setGuestNames(prev => {
      const next = [...prev]
      while (next.length < count) next.push('')
      next.length = count
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !attending) {
      setMessage({ text: t('rsvpError'), type: 'error' })
      return
    }

    setIsSubmitting(true)
    setMessage({ text: t('submitting'), type: 'info' })

    try {
      const formData = new FormData()
      formData.append('name', name.trim())
      formData.append('attending', attending)
      formData.append('guests', attending === 'yes' ? guests : '0')
      
      if (attending === 'yes') {
        formData.append('guestNames', guestNames.join(', '))
      }

      // Handle optional message
      if (messageType === 'drawn' && canvasRef.current) {
        const blob = await new Promise<Blob | null>(res => canvasRef.current?.toBlob(res, 'image/png'))
        if (blob) formData.append('image', blob, 'drawing.png')
      } else if (writtenText.trim()) {
        formData.append('message', writtenText.trim())
      }

      const response = await fetch('/api/send-email', { method: 'POST', body: formData })
      const data = await response.json()

      if (data.success) {
        setMessage({ text: t('rsvpSuccess'), type: 'success' })
        setName(''); setAttending(''); setGuests('1'); setGuestNames(['']); setWrittenText(''); clearCanvas()
      } else {
        throw new Error(data.message)
      }
    } catch (error: any) {
      setMessage({ text: error.message || t('rsvpError'), type: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="rsvp" className="relative py-8 px-4 md:py-12 bg-[#ebebeb] overflow-hidden">
      <div className="max-w-4xl mx-auto text-center flex flex-col items-center relative z-10">
        <motion.div 
          className="mb-8 flex flex-col items-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-handwritten text-7xl md:text-9xl text-[#661314] mb-4 tracking-tight">
            {t('rsvpSectionTitle')}
          </h2>
          <p className="font-serif text-lg md:text-xl text-[#661314]/80 italic mt-4">
            {t('rsvpDescription')}
          </p>
        </motion.div>
        
        <motion.div 
          className="w-full max-w-2xl bg-transparent border border-[#661314]/20 rounded-lg p-8 md:p-12 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <form onSubmit={handleSubmit} className="space-y-6 text-left">
            <div>
              <label className="block text-sm font-medium text-[#661314] mb-2 font-serif">{t('rsvpFormName')}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-transparent border border-[#661314]/30 rounded-lg focus:border-[#661314] outline-none font-serif"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#661314] mb-3 font-serif">{t('attendanceLabel')}</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAttending('yes')}
                  className={`py-2 rounded-lg border font-serif transition-all ${attending === 'yes' ? 'bg-[#661314] text-white' : 'text-[#661314] border-[#661314]/30'}`}
                >
                  {t('attendingOption')}
                </button>
                <button
                  type="button"
                  onClick={() => setAttending('no')}
                  className={`py-2 rounded-lg border font-serif transition-all ${attending === 'no' ? 'bg-[#661314] text-white' : 'text-[#661314] border-[#661314]/30'}`}
                >
                  {t('notAttendingOption')}
                </button>
              </div>
            </div>

            {attending === 'yes' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#661314] mb-2 font-serif">{t('rsvpFormGuests')}</label>
                  <select
                    value={guests}
                    onChange={(e) => handleGuestsChange(e.target.value)}
                    className="w-full px-4 py-3 bg-transparent border border-[#661314]/30 rounded-lg font-serif outline-none"
                  >
                    {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} {n === 1 ? t('guestSingular') : t('guestPlural')}</option>)}
                  </select>
                </div>
                {guestNames.map((gn, i) => (
                  <input
                    key={i}
                    type="text"
                    value={gn}
                    onChange={(e) => {
                      const next = [...guestNames]; next[i] = e.target.value; setGuestNames(next)
                    }}
                    placeholder={`${t('guestSingular')} ${i + 1}`}
                    className="w-full px-4 py-3 bg-transparent border border-[#661314]/30 rounded-lg font-serif outline-none"
                    required
                  />
                ))}
              </motion.div>
            )}

            <div className="pt-4 border-t border-[#661314]/10">
              <label className="block text-sm font-medium text-[#661314] mb-4 font-serif">
                {t('writeUsDescription')} ({t('optional') || 'Optional'})
              </label>
              <div className="flex gap-4 mb-4">
                <button
                  type="button"
                  onClick={() => setMessageType('drawn')}
                  className={`flex-1 py-2 text-xs rounded-lg border font-serif transition-all ${messageType === 'drawn' ? 'bg-[#661314] text-white' : 'text-[#661314] border-[#661314]/30'}`}
                >
                  {t('drawnMessage')}
                </button>
                <button
                  type="button"
                  onClick={() => setMessageType('written')}
                  className={`flex-1 py-2 text-xs rounded-lg border font-serif transition-all ${messageType === 'written' ? 'bg-[#661314] text-white' : 'text-[#661314] border-[#661314]/30'}`}
                >
                  {t('writtenMessage')}
                </button>
              </div>

              {messageType === 'drawn' ? (
                <div className="space-y-4">
                  <div className="flex justify-center gap-2 mb-2">
                    {penColors.map(p => (
                      <button
                        key={p.color}
                        type="button"
                        onClick={() => setCurrentColor(p.color)}
                        className={`w-6 h-6 rounded-full border-2 ${currentColor === p.color ? 'border-[#661314]' : 'border-transparent'}`}
                        style={{ backgroundColor: p.color }}
                      />
                    ))}
                  </div>
                  <div className="border border-[#661314]/20 rounded-lg bg-white overflow-hidden">
                    <canvas
                      ref={canvasRef}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="w-full touch-none cursor-crosshair"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={undo} className="flex-1 py-2 text-xs border border-[#661314]/30 rounded-lg font-serif">{t('undo')}</button>
                    <button type="button" onClick={clearCanvas} className="flex-1 py-2 text-xs border border-[#661314]/30 rounded-lg font-serif">{t('clearDrawing')}</button>
                  </div>
                </div>
              ) : (
                <textarea
                  value={writtenText}
                  onChange={(e) => setWrittenText(e.target.value)}
                  placeholder={t('writeYourMessage')}
                  className="w-full px-4 py-3 bg-transparent border border-[#661314]/30 rounded-lg font-serif outline-none resize-none"
                  rows={4}
                />
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-[#661314] text-white rounded-lg font-serif text-lg font-medium hover:opacity-90 transition-all disabled:opacity-50"
            >
              {isSubmitting ? t('submitting') : t('rsvpFormSubmit')}
            </button>

            {message.text && (
              <div className={`p-4 rounded-lg text-center font-serif ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                {message.text}
              </div>
            )}
          </form>
        </motion.div>
      </div>
    </section>
  )
}


