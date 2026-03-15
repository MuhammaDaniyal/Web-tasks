import React from 'react'
import useGameStore from '../stores/gameStore'

const RESULT_COLORS = {
  Wicket: '#ef4444',
  '0': '#9ca3af',
  '1': '#60a5fa',
  '2': '#a78bfa',
  '3': '#fbbf24',
  '4': '#34d399',
  '6': '#fb923c',
}

const Commentary = () => {
  // const commentary = useGameStore((state) => state.commentary)
  // const lastResult = useGameStore((state) => state.lastResult)

  const { commentary, lastResult } = useGameStore()

  const color = lastResult ? (RESULT_COLORS[lastResult] || '#e5e7eb') : '#e5e7eb'

  return (
    <div
      className='rounded-lg px-4 py-3 text-sm min-h-[44px] bg-[#0a1520] transition-colors duration-300'
      style={{ border: `1px solid ${color}`, color }}
    >
      {lastResult && (
        <span
          className='inline-block mr-2 px-2 py-0.5 rounded font-black text-[13px] text-black'
          style={{ background: color }}
        >
          {lastResult === 'Wicket' ? 'OUT!' : `+${lastResult}`}
        </span>
      )}
      {commentary}
    </div>
  )
}

export default Commentary