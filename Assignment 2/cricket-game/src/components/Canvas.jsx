import { useRef, useEffect } from 'react'
import useGameStore from '../stores/gameStore'

function drawBatsman(ctx, x, y, batAngle, lastOutcome) {
    const highlight = lastOutcome === "4" || lastOutcome === "6";

    // shadow
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.beginPath();
    ctx.ellipse(x, y + 2, 18, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // legs
    ctx.strokeStyle = highlight ? "#fbbf24" : "#fff";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x, y - 20);
    ctx.lineTo(x - 8, y);
    ctx.moveTo(x, y - 20);
    ctx.lineTo(x + 6, y);
    ctx.stroke();

    // torso
    ctx.beginPath();
    ctx.moveTo(x, y - 20);
    ctx.lineTo(x, y - 50);
    ctx.stroke();

    // helmet
    ctx.fillStyle = "#15803d";
    ctx.beginPath();
    ctx.arc(x, y - 60, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#166534";
    // ctx.fillRect(x - 14, y - 58, 6, 6); // visor
    // ctx.fillRect(x + 8, y - 58, 6, 6);

    // bat arm + bat
    ctx.save();
    ctx.translate(x - 4, y - 42); // shoulder pivot
    ctx.rotate((batAngle * Math.PI) / 180);

    // arm
    ctx.strokeStyle = highlight ? "#fbbf24" : "#fff";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(16, 20);
    ctx.stroke();

    // bat
    ctx.fillStyle = "#92400e";
    ctx.strokeStyle = "#78350f";
    ctx.lineWidth = 1;
    // handle
    ctx.fillRect(14, 18, 4, 18);
    // blade
    ctx.fillStyle = "#d97706";
    ctx.beginPath();
    ctx.roundRect(8, 35, 18, 44, 3);
    ctx.fill();
    ctx.strokeRect(8, 35, 18, 44);

    ctx.restore();
}

function drawBowler(ctx, x, y, phase) {
    // simple silhouette
    ctx.fillStyle = "#1e40af";
    ctx.beginPath();
    ctx.arc(x, y - 22, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(x - 5, y - 14, 10, 18);
    ctx.fillStyle = "#1e40af";
    ctx.fillRect(x - 8, y - 2, 6, 16);
    ctx.fillRect(x + 2, y - 2, 6, 16);
    if (phase === "idle") {
        // arm raised
        ctx.strokeStyle = "#93c5fd";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x + 5, y - 10);
        ctx.lineTo(x + 18, y - 26);
        ctx.stroke();
    }
}

function drawScene(ctx, W, H, phase, ballPos, batAngle, lastOutcome) {
    // pitch strip
    // const pitchX = W * 0.38, pitchW = W * 0.24, pitchY = H * 0.5, pitchH = H * 0.48;

    const pitchX = W * 0.05, pitchW = W * 0.9, pitchY = H * 0.3, pitchH = H * 0.68;
    ctx.fillStyle = "#c8a96e";
    ctx.fillRect(pitchX, pitchY, pitchW, pitchH);

    // // pitch crease lines
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pitchX, H * 0.85);
    ctx.lineTo(pitchX + pitchW, H * 0.85);
    ctx.moveTo(pitchX, H * 0.65);
    ctx.lineTo(pitchX + pitchW, H * 0.65);
    ctx.stroke();

    // stumps
    const stumpX = W * 0.23;
    const stumpY = H * 0.8;
    ctx.fillStyle = "#fff";
    [-12, 0, 12].forEach(dx => {
        ctx.fillRect(stumpX + dx - 2, stumpY - 42, 4, 42);
    });
    // bails
    ctx.fillStyle = "#f59e0b";
    ctx.fillRect(stumpX - 14, stumpY - 43, 30, 4);

    // batsman body (stick figure at batsman crease)
    const batsX = W * 0.30;
    const batsY = H * 0.8;
    drawBatsman(ctx, batsX, batsY, batAngle, lastOutcome);

    // bowler (far end, simple)
    drawBowler(ctx, W * 0.8, batsY - 10, phase);

    // ball
    if (phase === "bowling" || phase === "idle") {
        const bx = W * 0.8 - (W * 0.8 - batsX) * ballPos;
        const by = H * 0.77 - Math.sin(ballPos * Math.PI) * H * 0.04;
        
        // ball core
        ctx.beginPath();
        ctx.arc(bx, by, 7, 0, Math.PI * 2);
        ctx.fillStyle = "#dc2626";
        ctx.fill();
        ctx.strokeStyle = "#7f1d1d";
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}

const Canvas = () => {
  const canvasRef = useRef(null)
  const ballPosRef = useRef(0)        // 0 = ball at bowler, 1 = ball at batsman
  const animRef = useRef(null)        // stores the requestAnimationFrame id
  const lastTsRef = useRef(null)      // tracks last timestamp for delta time
  const isBowling = useRef(false)     // are we currently animating?

  const test_div = useRef(null)

  const { setSliderActive, phase, lastResult, setPhase, setLastResult, addBall } = useGameStore()

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    // initial draw so something shows on screen
    drawScene(ctx, 500, 300, "idle", 0, 85, null)
  }, [])

  useEffect(() => {
    if (test_div.current) {
      test_div.current.textContent = `phase: ${phase}, lastResult: ${lastResult}`
    }
  }, [phase, lastResult]) // Runs whenever these change


  const animate = (timestamp) => {
    // first frame — just record time and keep going
    if (!lastTsRef.current) lastTsRef.current = timestamp

    const dt = timestamp - lastTsRef.current   // ms since last frame
    lastTsRef.current = timestamp

    // move ball forward — 0.001 means full journey takes ~1000ms, tune this
    ballPosRef.current = Math.min(1, ballPosRef.current + dt * 0.001)

    // redraw scene with updated ball position
    const ctx = canvasRef.current.getContext('2d')
    drawScene(ctx, 500, 300, "bowling", ballPosRef.current, 85, null)

    // keep animating until ball reaches batsman
    if (ballPosRef.current < 1) {
      animRef.current = requestAnimationFrame(animate)
    } else {
      // ball arrived — stop
      isBowling.current = false
      lastTsRef.current = null
      setPhase('slider')
      setSliderActive(true)
      test_div.current.textContent = `phase: ${phase}, lastResult: ${lastResult}`
    }
  }

  const bowl = () => {
    if (isBowling.current) return   // don't start again mid-animation
    setPhase("bowling")
    // reset ball to start
    ballPosRef.current = 0
    isBowling.current = true
    lastTsRef.current = null
    test_div.current.textContent = `phase: ${phase}, lastResult: ${lastResult}`
    addBall(1)

    animRef.current = requestAnimationFrame(animate)
  }


  // cleanup on unmount so animation doesn't keep running
  useEffect(() => {
    return () => cancelAnimationFrame(animRef.current)
  }, [])

return (
  <div className='relative inline-block'>
    <canvas
      ref={canvasRef}
      width={500}
      height={300}
      className='bg-gray-800 rounded-lg shadow-lg block'
    />
    <button 
      onClick={bowl} 
      className='absolute top-2 left-2 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600'
    >
      Bowl
    </button>
    <div 
      ref={test_div} 
      className='absolute top-2 right-2 text-sm text-gray-300 bg-black/50 px-2 py-1 rounded'
    >
      Test Div
    </div>
  </div>
)
}

export default Canvas