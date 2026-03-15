import Canvas from './components/Canvas'
import Scoreboard from './components/Scoreboard'
import PowerBar from './components/PowerBar'
import StyleSelector from './components/StyleSelector'
import Commentary from './components/Commentary'
import GameOver from './components/GameOver'

export default function App() {
  return (
    <div className='min-h-screen bg-[#060d14] flex flex-col items-center justify-center p-4'>
      <h1 className='text-3xl font-black text-yellow-400 tracking-widest uppercase font-mono mb-4'>
        🏏 Cricket Bash
      </h1>

      <div className='flex flex-wrap gap-4 items-start justify-center w-full max-w-5xl'>

        {/* left — canvas + powerbar + commentary */}
        <div className='flex-1 min-w-[320px] max-w-[600px] flex flex-col gap-3'>
          <div className='relative'>   {/* relative so GameOver overlay positions correctly */}
            <Canvas />
            <GameOver />
          </div>
          <div className='bg-[#0a1520] border border-[#1e3a5f] rounded-xl px-4 py-3'>
            <PowerBar />
          </div>
          <Commentary />
        </div>

        {/* right — scoreboard + style selector */}
        <div className='flex flex-col gap-3 w-52 shrink-0'>
          <Scoreboard />
          <StyleSelector />
        </div>

      </div>
    </div>
  )
}