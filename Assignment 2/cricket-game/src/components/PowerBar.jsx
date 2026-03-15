import React, { useEffect, useRef, useState } from 'react'
import useGameStore from '../stores/gameStore'
import { STYLES } from '../constants/constants'
import { COMMENTARY, TOTAL_BALLS, TOTAL_WICKETS } from '../constants/constants'

// keep this here or move to a constants file later
const SLIDER_SPEED = 0.007  // tune this to make slider faster/slower

const PowerBar = () => {
  
  const {battingStyle, sliderActive, setPhase, setLastResult, setCommentary, setSliderActive, addRuns, addWicket, addBall, wickets, ballsBowled} = useGameStore()

  const [sliderPos, setSliderPos] = useState(0)  // local — only PowerBar needs this

  const sliderRef    = useRef(0)
  const dirRef       = useRef(1)
  const animRef      = useRef(null)
  const lastTsRef    = useRef(null)

  // slider animation loop — only runs when sliderActive is true
  useEffect(() => {
    if (!sliderActive) {
      cancelAnimationFrame(animRef.current)
      lastTsRef.current = null
      return
    }

    const animate = (ts) => {
      if (!lastTsRef.current) lastTsRef.current = ts
      const dt = ts - lastTsRef.current
      lastTsRef.current = ts

      sliderRef.current += dirRef.current * SLIDER_SPEED * dt
      if (sliderRef.current >= 1) { sliderRef.current = 1; dirRef.current = -1 }
      if (sliderRef.current <= 0) { sliderRef.current = 0; dirRef.current =  1 }

      setSliderPos(sliderRef.current)
      animRef.current = requestAnimationFrame(animate)
    }

    animRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animRef.current)
  }, [sliderActive])

  const handleClick = () => {
    if (!sliderActive) return

    const pos  = sliderRef.current
    const segs = STYLES[battingStyle].segments
    let cum = 0
    let outcome = segs[segs.length - 1].outcome

    for (const s of segs) {
      cum += s.prob
      if (pos <= cum) { outcome = s.outcome; break }
    }

    // stop slider
    setSliderActive(false)
    setLastResult(outcome)
    setPhase('idle')

    // commentary
    const lines = COMMENTARY[outcome]
    setCommentary(lines[Math.floor(Math.random() * lines.length)])

    // score update
    const newBalls = ballsBowled + 1
    addBall()

    if (outcome === 'Wicket') {
      const newW = wickets + 1
      addWicket()
      if (newW >= TOTAL_WICKETS)
        setTimeout(() => setPhase('gameover'), 1400)
    } else {
      addRuns(parseInt(outcome) || 0)
    }

    if (newBalls >= TOTAL_BALLS)
      setTimeout(() => setPhase('gameover'), 1400)
  }

  const segs = STYLES[battingStyle].segments
  let cumulative = 0

  return (
    <div className='w-full select-none'>
      <p className='text-xs text-gray-500 font-mono tracking-widest mb-2 uppercase'>
        Power Bar — Click to Play Shot
      </p>

      {/* bar */}
      <div
        onClick={handleClick}
        className={`relative h-11 rounded-lg overflow-hidden flex transition-shadow duration-300
          ${sliderActive
            ? 'border-2 border-yellow-400 shadow-[0_0_16px_rgba(251,191,36,0.4)] cursor-pointer'
            : 'border-2 border-gray-700 cursor-default opacity-50'
          }`}
      >
        {segs.map((s, i) => (
          <div
            key={i}
            className='flex flex-col items-center justify-center border-r border-black/30 last:border-r-0'
            style={{ flex: s.prob, background: s.color, color: s.text }}
          >
            <span className='text-xs font-bold font-mono leading-none'>{s.outcome}</span>
            <span className='text-[9px] opacity-80 font-mono'>{(s.prob * 100).toFixed(0)}%</span>
          </div>
        ))}

        {/* slider line */}
        <div
          className='absolute top-0 h-full w-1 rounded-sm pointer-events-none bg-white shadow-[0_0_8px_#fff]'
          style={{ left: `${sliderPos * 100}%`, transform: 'translateX(-50%)' }}
        />
        {/* slider arrow */}
        <div
          className='absolute -top-2.5 pointer-events-none border-l-[6px] border-r-[6px] border-t-[10px] border-l-transparent border-r-transparent border-t-white'
          style={{ left: `${sliderPos * 100}%`, transform: 'translateX(-50%)' }}
        />
      </div>

      {/* scale labels */}
      <div className='flex justify-between mt-1'>
        {segs.map((s, i) => {
          cumulative += s.prob
          return (
            <span key={i} className='text-[9px] text-gray-600 font-mono'>
              {cumulative.toFixed(2)}
            </span>
          )
        })}
      </div>
    </div>
  )
}

export default PowerBar