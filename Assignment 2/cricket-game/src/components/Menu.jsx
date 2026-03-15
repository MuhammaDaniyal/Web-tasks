import { useState } from 'react'
import useGameStore from '../stores/gameStore'

const OVERS_OPTIONS   = [1, 2, 3, 4, 5]
const WICKETS_OPTIONS = [1, 2, 3]

const Menu = () => {
  const {
    playerName, setPlayerName,
    totalOvers, setTotalOvers,
    totalWickets, setTotalWickets,
    setGameStarted,
  } = useGameStore()

  const canStart = playerName.trim().length > 0

  return (
    <div className='min-h-screen bg-[#060d14] flex items-center justify-center p-4'>
      <div className='w-full max-w-md'>

        {/* title */}
        <div className='text-center mb-10'>
          <div className='text-6xl mb-3'>🏏</div>
          <h1 className='text-5xl font-black text-yellow-400 tracking-widest uppercase font-mono'>
            Cricket
            Bash
          </h1>
          <p className='text-gray-500 text-xs tracking-widest mt-2 font-mono uppercase'>
            CS-4032 · Web Programming
          </p>
        </div>

        {/* card */}
        <div className='bg-[#0a1520] border border-[#1e3a5f] rounded-2xl p-6 flex flex-col gap-6'>

          {/* name input */}
          <div>
            <label className='text-yellow-400 text-[11px] font-mono tracking-widest uppercase block mb-2'>
              Player Name
            </label>
            <input
              type='text'
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder='Enter your name...'
              maxLength={20}
              className='
                w-full bg-[#0f1f2e] border border-[#1e3a5f] rounded-lg
                px-4 py-3 text-white font-mono text-sm
                placeholder-gray-600 outline-none
                focus:border-yellow-400 focus:shadow-[0_0_10px_rgba(251,191,36,0.2)]
                transition-all duration-200
              '
            />
          </div>

          {/* overs selector */}
          <div>
            <label className='text-yellow-400 text-[11px] font-mono tracking-widest uppercase block mb-2'>
              Overs
            </label>
            <div className='flex gap-2'>
              {OVERS_OPTIONS.map((o) => (
                <button
                  key={o}
                  onClick={() => setTotalOvers(o)}
                  className={`
                    flex-1 py-2.5 rounded-lg font-mono font-black text-sm
                    transition-all duration-150 cursor-pointer border
                    ${totalOvers === o
                      ? 'bg-yellow-400 text-black border-yellow-400 shadow-[0_0_12px_rgba(251,191,36,0.4)]'
                      : 'bg-[#0f1f2e] text-gray-500 border-[#1e3a5f] hover:border-gray-500 hover:text-gray-300'
                    }
                  `}
                >
                  {o}
                </button>
              ))}
            </div>
            <p className='text-gray-600 text-[10px] font-mono mt-1.5'>
              {totalOvers * 6} balls total
            </p>
          </div>

          {/* wickets selector */}
          <div>
            <label className='text-yellow-400 text-[11px] font-mono tracking-widest uppercase block mb-2'>
              Wickets
            </label>
            <div className='flex gap-2'>
              {WICKETS_OPTIONS.map((w) => (
                <button
                  key={w}
                  onClick={() => setTotalWickets(w)}
                  className={`
                    flex-1 py-2.5 rounded-lg font-mono font-black text-sm
                    transition-all duration-150 cursor-pointer border
                    ${totalWickets === w
                      ? 'bg-orange-400 text-black border-orange-400 shadow-[0_0_12px_rgba(251,115,22,0.4)]'
                      : 'bg-[#0f1f2e] text-gray-500 border-[#1e3a5f] hover:border-gray-500 hover:text-gray-300'
                    }
                  `}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          {/* summary line */}
          <div className='bg-[#0f1f2e] border border-[#1e3a5f] rounded-lg px-4 py-3 font-mono text-xs text-gray-400'>
            {playerName.trim()
              ? <span className='text-white'>{playerName.trim()}</span>
              : <span className='text-gray-600'>Your name</span>
            }
            {' '}· {totalOvers} over{totalOvers > 1 ? 's' : ''} · {totalWickets} wicket{totalWickets > 1 ? 's' : ''}
          </div>

          {/* start button */}
          <button
            onClick={() => { if (canStart) setGameStarted(true) }}
            disabled={!canStart}
            className={`
              w-full py-4 rounded-xl font-mono font-black text-base
              tracking-widest uppercase transition-all duration-200
              ${canStart
                ? `bg-gradient-to-r from-yellow-400 to-orange-400 text-black
                   shadow-[0_0_24px_rgba(251,191,36,0.4)]
                   hover:shadow-[0_0_32px_rgba(251,191,36,0.7)]
                   hover:from-yellow-300 hover:to-orange-300
                   active:scale-95 cursor-pointer`
                : 'bg-[#0f1f2e] text-gray-600 border border-[#1e3a5f] cursor-not-allowed'
              }
            `}
          >
            {canStart ? '🏏 Start Match' : 'Enter name to start'}
          </button>

        </div>
      </div>
    </div>
  )
}

export default Menu