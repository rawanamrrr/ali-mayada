"use client"

import { useEffect, useState, useMemo, useCallback, memo } from "react"
import { useTranslation } from "@/lib/translations"

interface CountdownTimerProps {
  targetDate: Date
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

const CountdownTimer = memo(function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const t = useTranslation()
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  // Memoize target timestamp to avoid recalculation
  const targetTimestamp = useMemo(() => targetDate.getTime(), [targetDate])

  // Optimize calculation with useCallback
  const calculateTimeLeft = useCallback(() => {
    const difference = targetTimestamp - Date.now()

    if (difference > 0) {
      const newTimeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      }
      
      // Only update if values actually changed to prevent unnecessary re-renders
      setTimeLeft(prev => {
        if (prev.days !== newTimeLeft.days || 
            prev.hours !== newTimeLeft.hours || 
            prev.minutes !== newTimeLeft.minutes || 
            prev.seconds !== newTimeLeft.seconds) {
          return newTimeLeft
        }
        return prev
      })
    }
  }, [targetTimestamp])

  useEffect(() => {
    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [calculateTimeLeft])

  // Memoize time units array to prevent recreation on every render
  const timeUnits = useMemo(() => [
    { key: 'days', value: timeLeft.days },
    { key: 'hours', value: timeLeft.hours },
    { key: 'minutes', value: timeLeft.minutes },
    { key: 'seconds', value: timeLeft.seconds },
  ], [timeLeft.days, timeLeft.hours, timeLeft.minutes, timeLeft.seconds])

  return (
    <div className="flex flex-row justify-center items-end gap-3 md:gap-6">
      {timeUnits.map((unit, index) => (
        <div
          key={unit.key}
          className="flex flex-col items-center gap-2"
        >
          {/* Rectangular box with rounded corners and thin border */}
          <div className="w-[70px] h-[80px] md:w-[100px] md:h-[110px] flex items-center justify-center bg-transparent border border-[#661314]/30 rounded-lg shadow-sm">
            <span className="text-3xl md:text-5xl font-serif text-[#661314]">
              {unit.value.toString()}
            </span>
          </div>
          
          {/* Label below the box */}
          <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-[#661314]/70 font-medium">
            {unit.key === 'days' ? t('daysShort') : 
             unit.key === 'hours' ? t('hoursShort') : 
             unit.key === 'minutes' ? t('minutesShort') : t('secondsShort')}
          </span>
        </div>
      ))}
    </div>
  )
})

export default CountdownTimer