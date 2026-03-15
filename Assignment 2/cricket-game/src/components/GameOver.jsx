import React from 'react'
import useGameStore from '../stores/gameStore'

const GameOver = () => {
  const phase       = useGameStore((state) => state.phase)
  const runs        = useGameStore((state) => state.runs)
  const wickets     = useGameStore((state) => state.wickets)
  const ballsBowled = useGameStore((state) => state.ballsBowled)
  const resetGame   = useGameStore((state) => state.resetGame)

  if (phase !== 'gameover') return null  // renders nothing until game ends

  return (
    <div className='absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-3 rounded-xl'>
      <p className='text-4xl font-black text-yellow-400 tracking-widest uppercase font-mono'>
        Innings Over
      </p>
      <p className='text-6xl font-bold text-white font-mono'>
        {runs} <span className='text-2xl text-gray-400'>RUNS</span>
      </p>
      <p className='text-sm text-gray-400 font-mono'>
        {wickets} wicket{wickets !== 1 ? 's' : ''} lost · {ballsBowled} balls faced
      </p>
      <button
        onClick={resetGame}
        className='mt-2 px-8 py-3 bg-yellow-400 text-black font-black text-sm
                   tracking-widest uppercase rounded-lg font-mono
                   hover:bg-yellow-300 active:scale-95 transition-all cursor-pointer'
      >
        Play Again
      </button>
    </div>
  )
}

export default GameOver