"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from '@/lib/translations'

export default function RSVPSection() {
  const t = useTranslation()
  const [name, setName] = useState('')
  const [attending, setAttending] = useState<'yes' | 'no' | ''>('')
  const [guests, setGuests] = useState('1')
  const [guestNames, setGuestNames] = useState<string[]>([''])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' as 'success' | 'error' | 'info' | '' })

  const handleGuestsChange = (value: string) => {
    setGuests(value)
    const count = parseInt(value, 10) || 0
    setGuestNames((prev) => {
      const next = [...prev]
      if (count > next.length) {
        while (next.length < count) {
          next.push('')
        }
      } else if (count < next.length) {
        next.length = count
      }
      return next
    })
  }

  const handleGuestNameChange = (index: number, value: string) => {
    setGuestNames((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!name.trim()) {
      setMessage({ text: t('rsvpError'), type: 'error' })
      return
    }

    if (attending !== 'yes' && attending !== 'no') {
      setMessage({ text: t('rsvpError'), type: 'error' })
      return
    }

    if (attending === 'yes') {
      if (!guests.trim()) {
        setMessage({ text: t('rsvpError'), type: 'error' })
        return
      }

      const guestCountNumber = parseInt(guests, 10) || 0
      if (guestCountNumber < 1) {
        setMessage({ text: t('rsvpError'), type: 'error' })
        return
      }

      const hasEmptyGuestName = guestNames
        .slice(0, guestCountNumber)
        .some((guestName) => !guestName.trim())
      if (hasEmptyGuestName) {
        setMessage({ text: t('rsvpError'), type: 'error' })
        return
      }
    }

    setIsSubmitting(true)
    setMessage({ text: t('submitting'), type: 'info' })

    try {
      const formData = new FormData()
      const guestsValue = attending === 'yes' ? guests.trim() : '0'

      formData.append('name', name.trim())
      formData.append('attending', attending)
      formData.append('guests', guestsValue)
      formData.append('type', 'rsvp')

      if (attending === 'yes') {
        const guestCountNumber = parseInt(guestsValue, 10) || 0
        const joinedGuestNames = guestNames
          .slice(0, guestCountNumber)
          .join(', ')
        formData.append('guestNames', joinedGuestNames)
      }

      const response = await fetch('/api/send-email', {
        method: 'POST',
        body: formData,
      })

      const contentType = response.headers.get('content-type') || ''
      let responseData: any = null
      
      if (contentType.includes('application/json')) {
        try {
          responseData = await response.json()
        } catch (e) {
          console.error('Failed to parse JSON response:', e)
          const rawText = await response.text().catch(() => '')
          responseData = { raw: rawText }
        }
      } else {
        const rawText = await response.text().catch(() => '')
        responseData = { raw: rawText }
      }

      if (!response.ok) {
        console.error('Server error:', response.status, response.statusText, responseData)
        const msg = responseData?.message
          || responseData?.error
          || (typeof responseData?.raw === 'string' && responseData.raw.trim() ? responseData.raw : '')
          || 'Failed to submit RSVP'
        throw new Error(msg)
      }

      if (!responseData.success) {
        console.error('API error:', responseData)
        throw new Error(responseData.message || 'RSVP submission failed')
      }

      setMessage({ 
        text: t('rsvpSuccess'),
        type: 'success' as const
      })
      
      // Reset form
      setName('')
      setAttending('')
      setGuests('1')
      setGuestNames([''])
      
    } catch (error) {
      console.error('Error submitting RSVP:', error)
      setMessage({ 
        text: error instanceof Error ? error.message : t('rsvpError'), 
        type: 'error' 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section 
      id="rsvp" 
      className="relative py-20 px-4 md:py-32 bg-[#ebebeb] overflow-hidden"
    >
      <div className="max-w-4xl mx-auto text-center flex flex-col items-center relative z-10">
        <motion.div 
          className="mb-12 flex flex-col items-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="font-handwritten text-7xl md:text-9xl text-[#661314] mb-12 tracking-tight">
            {t('rsvpSectionTitle')}
          </h2>
          <p className="font-serif text-lg md:text-xl text-[#661314]/80 italic mt-4">
            {t('rsvpDescription')}
          </p>
        </motion.div>
        
        {/* Elegant form card */}
        <motion.div 
          className="w-full max-w-2xl bg-transparent border border-[#661314]/20 rounded-lg p-8 md:p-12 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <label htmlFor="rsvp-name" className="block text-sm font-medium text-[#661314] mb-2 font-serif">
                {t('rsvpFormName')}
              </label>
              <input
                id="rsvp-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('rsvpFormName')}
                className="w-full px-4 py-3 bg-transparent border border-[#661314]/30 rounded-lg focus:outline-none focus:border-[#661314] transition-all font-serif"
                required
                disabled={isSubmitting}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.25 }}
            >
              <label className="block text-sm font-medium text-[#661314] mb-3 font-serif">
                {t('attendanceLabel')}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAttending('yes')}
                  className={`px-4 py-2 rounded-lg border font-serif transition-all ${
                    attending === 'yes'
                      ? 'bg-[#661314] text-white border-[#661314] shadow-sm'
                      : 'bg-transparent text-[#661314] border-[#661314]/30 hover:border-[#661314]/60'
                  }`}
                  disabled={isSubmitting}
                >
                  {t('attendingOption')}
                </button>
                <button
                  type="button"
                  onClick={() => setAttending('no')}
                  className={`px-4 py-2 rounded-lg border font-serif transition-all ${
                    attending === 'no'
                      ? 'bg-[#661314] text-white border-[#661314] shadow-sm'
                      : 'bg-transparent text-[#661314] border-[#661314]/30 hover:border-[#661314]/60'
                  }`}
                  disabled={isSubmitting}
                >
                  {t('notAttendingOption')}
                </button>
              </div>
            </motion.div>

            {attending === 'yes' && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <label htmlFor="rsvp-guests" className="block text-sm font-medium text-[#661314] mb-2 font-serif">
                    {t('rsvpFormGuests')}
                  </label>
                  <select
                    id="rsvp-guests"
                    value={guests}
                    onChange={(e) => handleGuestsChange(e.target.value)}
                    className="w-full px-4 py-3 bg-transparent border border-[#661314]/30 rounded-lg focus:outline-none focus:border-[#661314] transition-all font-serif appearance-none"
                    disabled={isSubmitting}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                      <option key={num} value={num.toString()}>
                        {num} {num === 1 ? t('guestSingular') : t('guestPlural')}
                      </option>
                    ))}
                  </select>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.35 }}
                >
                  <label className="block text-sm font-medium text-[#661314] mb-2 font-serif">
                    {t('guestNamesLabel')}
                  </label>
                  <div className="space-y-3">
                    {Array.from({ length: parseInt(guests, 10) || 0 }).map((_, index) => (
                      <input
                        key={index}
                        type="text"
                        value={guestNames[index] || ''}
                        onChange={(e) => handleGuestNameChange(index, e.target.value)}
                        placeholder={t('guestNamePlaceholder', { n: index + 1 })}
                        className="w-full px-4 py-3 bg-transparent border border-[#661314]/30 rounded-lg focus:outline-none focus:border-[#661314] transition-all font-serif"
                        disabled={isSubmitting}
                      />
                    ))}
                  </div>
                </motion.div>
              </>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <button
                type="submit"
                className="w-full px-8 py-4 text-white bg-[#661314] rounded-lg hover:opacity-90 disabled:opacity-50 transition-all font-serif text-lg font-medium shadow-sm transform hover:scale-[1.02] disabled:transform-none"
                disabled={isSubmitting}
              >
                {isSubmitting ? t('submitting') : t('rsvpFormSubmit')}
              </button>
            </motion.div>

            {message.text && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`mt-4 p-4 rounded-lg text-center font-luxury ${
                  message.type === 'error' ? 'bg-red-100/80 text-red-700 border-2 border-red-300' : 
                  message.type === 'info' ? 'bg-blue-100/80 text-blue-700 border-2 border-blue-300' : 
                  'bg-green-100/80 text-green-700 border-2 border-green-300'
                }`}
              >
                {message.text}
              </motion.div>
            )}
          </form>
        </motion.div>
      </div>
    </section>
  )
}

