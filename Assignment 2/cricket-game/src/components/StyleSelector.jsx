import React from 'react'
import useGameStore from '../stores/gameStore'

const OPTIONS = [
  {
    key: 'aggressive',
    label: '⚡ Aggressive',
    sub: 'High risk / High reward',
    color: '#ef4444',
  },
  {
    key: 'defensive',
    label: '🛡 Defensive',
    sub: 'Low risk / Low reward',
    color: '#22c55e',
  },
]

const StyleSelector = () => {
  const battingStyle    = useGameStore((state) => state.battingStyle)
  const setBattingStyle = useGameStore((state) => state.setBattingStyle)
  const phase           = useGameStore((state) => state.phase)

  // only allow changing style when idle — not mid-ball
  const canChange = phase === 'idle'

  return (
    <div className='bg-[#0a1520] border border-[#1e3a5f] rounded-xl p-3'>
      <p className='text-yellow-400 text-[11px] tracking-widest mb-3 uppercase font-mono'>
        Batting Style
      </p>

      {OPTIONS.map((o) => (
        <button
          key={o.key}
          onClick={() => { if (canChange) setBattingStyle(o.key) }}
          disabled={!canChange}
          className={`w-full mb-2 py-2.5 rounded-lg font-mono font-bold text-xs
                      tracking-wide uppercase transition-all duration-200
                      ${!canChange ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
          style={{
            background: battingStyle === o.key ? o.color : '#1c2a38',
            color:      battingStyle === o.key ? '#fff'  : '#6b7280',
            boxShadow:  battingStyle === o.key ? `0 0 12px ${o.color}55` : 'none',
          }}
        >
          {o.label}
          <div className='text-[9px] opacity-70 mt-0.5 normal-case font-normal'>
            {o.sub}
          </div>
        </button>
      ))}
    </div>
  )
}

export default StyleSelector