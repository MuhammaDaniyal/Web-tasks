import { useState, useEffect, useRef, useCallback } from "react";

// ─── PROBABILITY CONFIGS ────────────────────────────────────────────────────
const STYLES = {
    aggressive: {
        label: "Aggressive",
        color: "#ef4444",
        segments: [
            { outcome: "Wicket", prob: 0.35, color: "#dc2626", text: "#fff" },
            { outcome: "0", prob: 0.08, color: "#6b7280", text: "#fff" },
            { outcome: "1", prob: 0.07, color: "#3b82f6", text: "#fff" },
            { outcome: "2", prob: 0.10, color: "#8b5cf6", text: "#fff" },
            { outcome: "3", prob: 0.05, color: "#f59e0b", text: "#000" },
            { outcome: "4", prob: 0.15, color: "#10b981", text: "#fff" },
            { outcome: "6", prob: 0.20, color: "#f97316", text: "#fff" },
        ],
    },
    defensive: {
        label: "Defensive",
        color: "#22c55e",
        segments: [
            { outcome: "Wicket", prob: 0.15, color: "#dc2626", text: "#fff" },
            { outcome: "0", prob: 0.20, color: "#6b7280", text: "#fff" },
            { outcome: "1", prob: 0.25, color: "#3b82f6", text: "#fff" },
            { outcome: "2", prob: 0.20, color: "#8b5cf6", text: "#fff" },
            { outcome: "3", prob: 0.08, color: "#f59e0b", text: "#000" },
            { outcome: "4", prob: 0.08, color: "#10b981", text: "#fff" },
            { outcome: "6", prob: 0.04, color: "#f97316", text: "#fff" },
        ],
    },
};

// ─── COMMENTARY ─────────────────────────────────────────────────────────────
const COMMENTARY = {
    Wicket: ["He's gone! Clean bowled!", "Out! What a delivery!", "Walks back to the pavilion…"],
    "0": ["Dot ball. Good length.", "Defended solidly — no run.", "Tight line, no room to score."],
    "1": ["Nudged away for a single.", "Quick single, smart running.", "Rotates the strike!"],
    "2": ["Pushed into the gap — two runs!", "Good placement, two more.", "Excellent running, two!"],
    "3": ["Three! Great placement!", "Running hard, three completed!", "Smart cricket, three runs."],
    "4": ["FOUR! Cracked through the covers!", "BOUNDARY! Races away to the fence!", "That's four — beautiful timing!"],
    "6": ["SIX! Into the stands!", "MAXIMUM! What a shot!", "That's gone all the way — six!"],
};

const TOTAL_BALLS = 12;
const TOTAL_WICKETS = 2;
const SLIDER_SPEED = 0.007; // position per ms → full bar in ~143ms per pass, tune as needed

// ─── CANVAS RENDERER ────────────────────────────────────────────────────────
function drawScene(ctx, W, H, phase, ballPos, batAngle, lastOutcome) {
    // sky gradient
    // const sky = ctx.createLinearGradient(0, 0, 0, H * 0.55);
    // sky.addColorStop(0, "#1e3a5f");
    // sky.addColorStop(1, "#3b7dd8");
    // ctx.fillStyle = sky;
    // ctx.fillRect(0, 0, W, H * 0.55);

    // // stands silhouette
    // ctx.fillStyle = "#2d5016";
    // ctx.beginPath();
    // ctx.moveTo(0, H * 0.38);
    // for (let x = 0; x <= W; x += 8) {
    //     ctx.lineTo(x, H * 0.38 - (Math.sin(x * 0.05) * 6 + 6));
    // }
    // ctx.lineTo(W, H * 0.55);
    // ctx.lineTo(0, H * 0.55);
    // ctx.closePath();
    // ctx.fill();

    // outfield
    // const grass = ctx.createLinearGradient(0, H * 0.52, 0, H);
    // grass.addColorStop(0, "#2d6a0a");
    // grass.addColorStop(1, "#1a4005");
    // ctx.fillStyle = grass;
    // ctx.fillRect(0, H * 0.52, W, H);

    // pitch strip
    // const pitchX = W * 0.38, pitchW = W * 0.24, pitchY = H * 0.5, pitchH = H * 0.48;
    const pitchX = W * 0.18, pitchW = W * 0.64, pitchY = H * 0.5, pitchH = H * 0.48;
    ctx.fillStyle = "#c8a96e";
    ctx.fillRect(pitchX, pitchY, pitchW, pitchH);

    // pitch crease lines
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pitchX, H * 0.72);
    ctx.lineTo(pitchX + pitchW, H * 0.72);
    ctx.moveTo(pitchX, H * 0.6);
    ctx.lineTo(pitchX + pitchW, H * 0.6);
    ctx.stroke();

    // stumps
    const stumpX = W * 0.23;
    const stumpY = H * 0.73;
    ctx.fillStyle = "#fff";
    [-12, 0, 12].forEach(dx => {
        ctx.fillRect(stumpX + dx - 2, stumpY - 42, 4, 42);
    });
    // bails
    ctx.fillStyle = "#f59e0b";
    ctx.fillRect(stumpX - 14, stumpY - 43, 30, 4);

    // batsman body (stick figure at batsman crease)
    const batsX = W * 0.30;
    const batsY = H * 0.73;
    drawBatsman(ctx, batsX, batsY, batAngle, lastOutcome);

    // bowler (far end, simple)
    drawBowler(ctx, W * 0.75, H * 0.61, phase);

    // ball
    if (phase === "bowling" || phase === "idle") {
        const bx = W * 0.6 - (W * 0.6 - batsX) * ballPos;
        const by = H * 0.67 - Math.sin(ballPos * Math.PI) * H * 0.04;
        ctx.beginPath();
        ctx.arc(bx, by, 7, 0, Math.PI * 2);
        ctx.fillStyle = "#dc2626";
        ctx.fill();
        ctx.strokeStyle = "#7f1d1d";
        ctx.lineWidth = 1;
        ctx.stroke();
        // seam
        ctx.strokeStyle = "#fca5a5";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(bx, by, 5, 0.3, 2.8);
        ctx.stroke();
    }
}

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
    ctx.fillRect(x - 14, y - 58, 6, 6); // visor
    ctx.fillRect(x + 8, y - 58, 6, 6);

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
    ctx.roundRect(8, 35, 22, 44, 3);
    ctx.fill();
    ctx.strokeRect(8, 35, 22, 44);

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

// ─── POWER BAR COMPONENT ────────────────────────────────────────────────────
function PowerBar({ style, sliderPos, active, onClick }) {
    const segs = STYLES[style].segments;
    return (
        <div style={{ width: "100%", userSelect: "none" }}>
            <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 6, fontFamily: "monospace", letterSpacing: 1 }}>
                POWER BAR — CLICK TO PLAY SHOT
            </div>
            <div
                onClick={active ? onClick : undefined}
                style={{
                    position: "relative",
                    height: 44,
                    borderRadius: 8,
                    overflow: "hidden",
                    display: "flex",
                    cursor: active ? "pointer" : "default",
                    border: active ? "2px solid #fbbf24" : "2px solid #374151",
                    boxShadow: active ? "0 0 16px #fbbf2466" : "none",
                    transition: "box-shadow 0.3s",
                }}
            >
                {segs.map((s, i) => (
                    <div
                        key={i}
                        style={{
                            flex: s.prob,
                            background: s.color,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 13,
                            fontWeight: 700,
                            color: s.text,
                            fontFamily: "monospace",
                            borderRight: i < segs.length - 1 ? "1px solid rgba(0,0,0,0.3)" : "none",
                            position: "relative",
                            flexDirection: "column",
                            gap: 1,
                        }}
                    >
                        <span>{s.outcome}</span>
                        <span style={{ fontSize: 9, opacity: 0.8 }}>{(s.prob * 100).toFixed(0)}%</span>
                    </div>
                ))}

                {/* slider */}
                <div
                    style={{
                        position: "absolute",
                        top: 0,
                        left: `${sliderPos * 100}%`,
                        transform: "translateX(-50%)",
                        width: 4,
                        height: "100%",
                        background: "#fff",
                        boxShadow: "0 0 8px #fff, 0 0 2px #000",
                        borderRadius: 2,
                        pointerEvents: "none",
                        transition: "none",
                    }}
                />
                {/* slider arrow */}
                <div
                    style={{
                        position: "absolute",
                        top: -10,
                        left: `${sliderPos * 100}%`,
                        transform: "translateX(-50%)",
                        width: 0,
                        height: 0,
                        borderLeft: "6px solid transparent",
                        borderRight: "6px solid transparent",
                        borderTop: "10px solid #fff",
                        pointerEvents: "none",
                    }}
                />
            </div>

            {/* scale labels */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                {(() => {
                    let cum = 0;
                    return segs.map((s, i) => {
                        cum += s.prob;
                        return (
                            <span key={i} style={{ fontSize: 9, color: "#6b7280", fontFamily: "monospace" }}>
                                {cum.toFixed(2)}
                            </span>
                        );
                    });
                })()}
            </div>
        </div>
    );
}

// ─── SCOREBOARD ─────────────────────────────────────────────────────────────
function Scoreboard({ runs, wickets, ballsBowled }) {
    const overs = Math.floor(ballsBowled / 6);
    const balls = ballsBowled % 6;
    const ballsLeft = TOTAL_BALLS - ballsBowled;
    const oversLeft = `${Math.floor(ballsLeft / 6)}.${ballsLeft % 6}`;

    return (
        <div style={{
            background: "#0f1923",
            border: "1px solid #1e3a5f",
            borderRadius: 10,
            padding: "12px 16px",
            fontFamily: "'Courier New', monospace",
        }}>
            <div style={{ color: "#fbbf24", fontSize: 11, letterSpacing: 2, marginBottom: 8 }}>SCOREBOARD</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 20px" }}>
                {[
                    ["RUNS", runs],
                    ["WICKETS", `${wickets}/${TOTAL_WICKETS}`],
                    ["OVERS", `${overs}.${balls}`],
                    ["REMAINING", oversLeft],
                ].map(([label, val]) => (
                    <div key={label}>
                        <div style={{ color: "#6b7280", fontSize: 9, letterSpacing: 1 }}>{label}</div>
                        <div style={{ color: "#f9fafb", fontSize: 22, fontWeight: 700, lineHeight: 1.1 }}>{val}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function CricketGame() {
    const canvasRef = useRef(null);
    const animRef = useRef(null);
    const sliderRef = useRef(0);
    const sliderDirRef = useRef(1);
    const lastTsRef = useRef(null);
    const phaseRef = useRef("idle"); // idle | bowling | batting | result | gameover
    const ballPosRef = useRef(0);
    const batAngleRef = useRef(40);
    const lastOutcomeRef = useRef(null);

    const [runs, setRuns] = useState(0);
    const [wickets, setWickets] = useState(0);
    const [ballsBowled, setBallsBowled] = useState(0);
    const [style, setStyle] = useState("aggressive");
    const [sliderPos, setSliderPos] = useState(0);
    const [phase, setPhase] = useState("idle"); // for React UI
    const [commentary, setCommentary] = useState("Select batting style and click BOWL to start!");
    const [lastResult, setLastResult] = useState(null);
    const [sliderActive, setSliderActive] = useState(false);

    const WH = { W: 700, H: 340 };

    // ── canvas render loop ──────────────────────────────────────────
    const render = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        const { W, H } = WH;
        ctx.clearRect(0, 0, W, H);
        drawScene(ctx, W, H, phaseRef.current, ballPosRef.current, batAngleRef.current, lastOutcomeRef.current);
    }, []);

    // ── main animation loop ─────────────────────────────────────────
    const loop = useCallback((ts) => {
        if (!lastTsRef.current) lastTsRef.current = ts;
        const dt = ts - lastTsRef.current;
        lastTsRef.current = ts;

        const p = phaseRef.current;

        if (p === "bowling") {
            ballPosRef.current = Math.min(1, ballPosRef.current + dt * 0.0014);
            if (ballPosRef.current >= 1) {
                phaseRef.current = "slider";
                setPhase("slider");
                setSliderActive(true);
            }
        }

        if (p === "slider") {
            // oscillate slider
            sliderRef.current += sliderDirRef.current * SLIDER_SPEED * dt;
            if (sliderRef.current >= 1) { sliderRef.current = 1; sliderDirRef.current = -1; }
            if (sliderRef.current <= 0) { sliderRef.current = 0; sliderDirRef.current = 1; }
            setSliderPos(sliderRef.current);
        }

        if (p === "batting") {
            batAngleRef.current -= dt * 0.35;
            if (batAngleRef.current <= -80) {
                batAngleRef.current = -80;
                phaseRef.current = "result";
                setPhase("result");
                // small pause then reset bat
                setTimeout(() => {
                    batAngleRef.current = 40;
                    phaseRef.current = "idle";
                    setPhase("idle");
                    setSliderActive(false);
                }, 1200);
            }
        }

        render();
        animRef.current = requestAnimationFrame(loop);
    }, [render]);

    useEffect(() => {
        animRef.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(animRef.current);
    }, [loop]);

    // ── bowl ────────────────────────────────────────────────────────
    const bowl = () => {
        if (phaseRef.current !== "idle") return;
        if (ballsBowled >= TOTAL_BALLS || wickets >= TOTAL_WICKETS) return;
        ballPosRef.current = 0;
        batAngleRef.current = 40;
        lastOutcomeRef.current = null;
        phaseRef.current = "bowling";
        lastTsRef.current = null;
        setPhase("bowling");
        setCommentary("Ball on its way…");
        setLastResult(null);
    };

    // ── play shot ───────────────────────────────────────────────────
    const playShot = () => {
        if (phaseRef.current !== "slider") return;
        const pos = sliderRef.current;
        const segs = STYLES[style].segments;
        let cum = 0;
        let outcome = segs[segs.length - 1].outcome;
        for (const s of segs) {
            cum += s.prob;
            if (pos <= cum) { outcome = s.outcome; break; }
        }

        // trigger batting animation
        phaseRef.current = "batting";
        setPhase("batting");
        setSliderActive(false);
        lastOutcomeRef.current = outcome;

        // commentary
        const lines = COMMENTARY[outcome];
        setCommentary(lines[Math.floor(Math.random() * lines.length)]);
        setLastResult(outcome);

        // update state
        const newBalls = ballsBowled + 1;
        setBallsBowled(newBalls);

        if (outcome === "Wicket") {
            const newW = wickets + 1;
            setWickets(newW);
            if (newW >= TOTAL_WICKETS) {
                setTimeout(() => { phaseRef.current = "gameover"; setPhase("gameover"); }, 1400);
            }
        } else {
            const scored = parseInt(outcome) || 0;
            setRuns(r => r + scored);
        }
        if (newBalls >= TOTAL_BALLS) {
            setTimeout(() => { phaseRef.current = "gameover"; setPhase("gameover"); }, 1400);
        }
    };

    // ── restart ─────────────────────────────────────────────────────
    const restart = () => {
        setRuns(0); setWickets(0); setBallsBowled(0);
        setCommentary("Select batting style and click BOWL to start!");
        setLastResult(null); setSliderPos(0); setSliderActive(false);
        phaseRef.current = "idle"; setPhase("idle");
        ballPosRef.current = 0; batAngleRef.current = 40;
        sliderRef.current = 0; lastOutcomeRef.current = null;
    };

    const gameOver = phase === "gameover";
    const canBowl = phase === "idle" && !gameOver;

    // result color
    const resultColors = { Wicket: "#ef4444", "0": "#9ca3af", "1": "#60a5fa", "2": "#a78bfa", "3": "#fbbf24", "4": "#34d399", "6": "#fb923c" };

    return (
        <div style={{
            minHeight: "100vh",
            background: "#060d14",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
            fontFamily: "'Courier New', monospace",
        }}>
            {/* title */}
            <div style={{ marginBottom: 16, textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: "#fbbf24", letterSpacing: 4, textTransform: "uppercase" }}>
                    🏏 Cricket Bash
                </div>
                <div style={{ fontSize: 11, color: "#4b5563", letterSpacing: 3 }}>CS-4032 · WEB PROGRAMMING</div>
            </div>

            <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap", justifyContent: "center", width: "100%", maxWidth: 900 }}>
                {/* left: canvas + power bar */}
                <div style={{ flex: "1 1 500px", maxWidth: 700 }}>
                    {/* canvas */}
                    <div style={{ position: "relative", borderRadius: 10, overflow: "hidden", border: "2px solid #1e3a5f" }}>
                        <canvas ref={canvasRef} width={WH.W} height={WH.H} style={{ display: "block", width: "100%", height: "auto" }} />

                        {/* game over overlay */}
                        {gameOver && (
                            <div style={{
                                position: "absolute", inset: 0,
                                background: "rgba(0,0,0,0.82)",
                                display: "flex", flexDirection: "column",
                                alignItems: "center", justifyContent: "center", gap: 10,
                            }}>
                                <div style={{ fontSize: 36, fontWeight: 900, color: "#fbbf24", letterSpacing: 3 }}>INNINGS OVER</div>
                                <div style={{ fontSize: 48, color: "#f9fafb", fontWeight: 700 }}>{runs} RUNS</div>
                                <div style={{ fontSize: 14, color: "#9ca3af" }}>{wickets} wicket{wickets !== 1 ? "s" : ""} lost · {ballsBowled} balls faced</div>
                                <button onClick={restart} style={btnStyle("#fbbf24", "#000")}>PLAY AGAIN</button>
                            </div>
                        )}
                    </div>

                    {/* power bar */}
                    <div style={{ marginTop: 14, background: "#0a1520", border: "1px solid #1e3a5f", borderRadius: 10, padding: "14px 16px" }}>
                        <PowerBar style={style} sliderPos={sliderPos} active={sliderActive} onClick={playShot} />
                    </div>

                    {/* commentary */}
                    <div style={{
                        marginTop: 10,
                        background: "#0a1520",
                        border: `1px solid ${lastResult ? (resultColors[lastResult] || "#1e3a5f") : "#1e3a5f"}`,
                        borderRadius: 8, padding: "10px 14px",
                        color: lastResult ? (resultColors[lastResult] || "#e5e7eb") : "#e5e7eb",
                        fontSize: 14, minHeight: 40,
                        transition: "border-color 0.4s, color 0.4s",
                    }}>
                        {lastResult && (
                            <span style={{
                                display: "inline-block", marginRight: 8,
                                background: resultColors[lastResult] || "#374151",
                                color: "#000", fontWeight: 900, fontSize: 13,
                                padding: "1px 8px", borderRadius: 4,
                            }}>
                                {lastResult === "Wicket" ? "OUT!" : `+${lastResult}`}
                            </span>
                        )}
                        {commentary}
                    </div>
                </div>

                {/* right panel */}
                <div style={{ flex: "0 0 200px", display: "flex", flexDirection: "column", gap: 12 }}>
                    <Scoreboard runs={runs} wickets={wickets} ballsBowled={ballsBowled} />

                    {/* batting style */}
                    <div style={{ background: "#0a1520", border: "1px solid #1e3a5f", borderRadius: 10, padding: "12px 14px" }}>
                        <div style={{ color: "#fbbf24", fontSize: 11, letterSpacing: 2, marginBottom: 10 }}>BATTING STYLE</div>
                        {["aggressive", "defensive"].map(s => (
                            <button
                                key={s}
                                onClick={() => { if (canBowl) setStyle(s); }}
                                style={{
                                    display: "block", width: "100%", marginBottom: 8,
                                    padding: "10px 0", borderRadius: 7, border: "none", cursor: canBowl ? "pointer" : "not-allowed",
                                    fontFamily: "monospace", fontWeight: 700, letterSpacing: 1, fontSize: 12,
                                    background: style === s ? STYLES[s].color : "#1c2a38",
                                    color: style === s ? "#fff" : "#6b7280",
                                    boxShadow: style === s ? `0 0 12px ${STYLES[s].color}88` : "none",
                                    transition: "all 0.2s",
                                    textTransform: "uppercase",
                                }}
                            >
                                {s === "aggressive" ? "⚡ Aggressive" : "🛡 Defensive"}
                                <div style={{ fontSize: 9, opacity: 0.7, marginTop: 2 }}>
                                    {s === "aggressive" ? "High risk / High reward" : "Low risk / Low reward"}
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* action buttons */}
                    <button
                        onClick={bowl}
                        disabled={!canBowl}
                        style={btnStyle(canBowl ? "#22c55e" : "#1c2a38", canBowl ? "#000" : "#4b5563", !canBowl)}
                    >
                        🎳 BOWL
                    </button>

                    <button
                        onClick={playShot}
                        disabled={!sliderActive}
                        style={btnStyle(sliderActive ? "#fbbf24" : "#1c2a38", sliderActive ? "#000" : "#4b5563", !sliderActive)}
                    >
                        🏏 PLAY SHOT
                    </button>

                    <button onClick={restart} style={btnStyle("#374151", "#e5e7eb")}>
                        ↺ RESTART
                    </button>

                    {/* instructions */}
                    <div style={{ background: "#0a1520", border: "1px solid #1e3a5f", borderRadius: 8, padding: "10px 12px", fontSize: 10, color: "#6b7280", lineHeight: 1.7 }}>
                        <div style={{ color: "#fbbf24", marginBottom: 4 }}>HOW TO PLAY</div>
                        1. Pick batting style<br />
                        2. Click BOWL<br />
                        3. Watch ball arrive<br />
                        4. Click power bar or PLAY SHOT to swing<br />
                        5. Timing = outcome!
                    </div>
                </div>
            </div>
        </div>
    );
}

function btnStyle(bg, color, disabled = false) {
    return {
        width: "100%", padding: "12px 0", borderRadius: 8, border: "none",
        background: bg, color, fontFamily: "monospace", fontWeight: 700,
        fontSize: 13, letterSpacing: 2, cursor: disabled ? "not-allowed" : "pointer",
        textTransform: "uppercase", opacity: disabled ? 0.5 : 1,
        transition: "all 0.15s",
    };
}