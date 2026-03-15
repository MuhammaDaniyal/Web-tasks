import React, { useEffect, useRef, useState } from 'react'
import useGameStore from '../stores/gameStore'

// keep this here or move to a constants file later
const STYLES = {
  aggressive: {
    segments: [
      { outcome: 'Wicket', prob: 0.35, color: '#dc2626', text: '#fff' },
      { outcome: '0',      prob: 0.08, color: '#6b7280', text: '#fff' },
      { outcome: '1',      prob: 0.07, color: '#3b82f6', text: '#fff' },
      { outcome: '2',      prob: 0.10, color: '#8b5cf6', text: '#fff' },
      { outcome: '3',      prob: 0.05, color: '#f59e0b', text: '#000' },
      { outcome: '4',      prob: 0.15, color: '#10b981', text: '#fff' },
      { outcome: '6',      prob: 0.20, color: '#f97316', text: '#fff' },
    ],
  },
  defensive: {
    segments: [
      { outcome: 'Wicket', prob: 0.15, color: '#dc2626', text: '#fff' },
      { outcome: '0',      prob: 0.20, color: '#6b7280', text: '#fff' },
      { outcome: '1',      prob: 0.25, color: '#3b82f6', text: '#fff' },
      { outcome: '2',      prob: 0.20, color: '#8b5cf6', text: '#fff' },
      { outcome: '3',      prob: 0.08, color: '#f59e0b', text: '#000' },
      { outcome: '4',      prob: 0.08, color: '#10b981', text: '#fff' },
      { outcome: '6',      prob: 0.04, color: '#f97316', text: '#fff' },
    ],
  },
}

export { STYLES }  // export so Canvas can use it for outcome detection

const SLIDER_SPEED = 0.007  // tune this to make slider faster/slower

const PowerBar = () => {
  const battingStyle  = useGameStore((state) => state.battingStyle)
  const sliderActive  = useGameStore((state) => state.sliderActive)
  const phase         = useGameStore((state) => state.phase)
  const setPhase      = useGameStore((state) => state.setPhase)
  const setLastResult = useGameStore((state) => state.setLastResult)
  const setCommentary = useGameStore((state) => state.setCommentary)
  const setSliderActive = useGameStore((state) => state.setSliderActive)
  const addRuns       = useGameStore((state) => state.addRuns)
  const addWicket     = useGameStore((state) => state.addWicket)
  const addBall       = useGameStore((state) => state.addBall)
  const wickets       = useGameStore((state) => state.wickets)
  const ballsBowled   = useGameStore((state) => state.ballsBowled)

  const [sliderPos, setSliderPos] = useState(0)  // local — only PowerBar needs this

  const sliderRef    = useRef(0)
  const dirRef       = useRef(1)
  const animRef      = useRef(null)
  const lastTsRef    = useRef(null)

  const TOTAL_BALLS   = 12
  const TOTAL_WICKETS = 2

  const COMMENTARY = {
    Wicket: ["He's gone! Clean bowled!", "Out! What a delivery!", "Walks back to the pavilion…"],
    "0":    ["Dot ball. Good length.", "Defended solidly.", "Tight line, no room."],
    "1":    ["Nudged for a single.", "Quick single!", "Rotates the strike."],
    "2":    ["Pushed for two!", "Good placement, two.", "Two more!"],
    "3":    ["Three! Great running!", "Smart cricket, three."],
    "4":    ["FOUR! Cracked through covers!", "BOUNDARY!", "Beautiful timing!"],
    "6":    ["SIX! Into the stands!", "MAXIMUM!", "That's gone all the way!"],
  }

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