import React from 'react'
import useGameStore from '../stores/gameStore'

const Scoreboard = () => {

    // const runs = useGameStore((state) => state.runs)
    // const wickets = useGameStore((state) => state.wickets)
    // const ballsBowled = useGameStore((state) => state.ballsBowled)

    const runs = useGameStore((state) => state.runs)
    const wickets = useGameStore((state) => state.wickets)
    const ballsBowled = useGameStore((state) => state.ballsBowled)
    const playerName = useGameStore((state) => state.playerName)

  return (
    <div>

        <h2 className='text-xl font-black  text-gray-500 tracking-widest font-mono mb-4'>
          Let's Play 
          <div
          className='text-yellow-400 text-3xl font-mono'
          >
            {playerName.trim() ? `${playerName.trim()}!` : ''} 
          </div>
        </h2>
        
        <h2 className='text-2xl font-bold mb-2 text-white'>Scoreboard</h2>
        <div className='bg-gray-800 text-white p-4 rounded-lg shadow-lg'>
            <p><span className='font-semibold'>Runs:</span> {runs}</p>
            <p><span className='font-semibold'>Wickets:</span> {wickets}</p>
            <p><span className='font-semibold'>Overs:</span> {Math.floor(ballsBowled / 6)}.{ballsBowled % 6}</p>
        </div>
    </div>
  )
}

export default Scoreboard
