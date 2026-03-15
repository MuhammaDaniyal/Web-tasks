import { create } from 'zustand'

const useGameStore = create((set) => ({

  // ── GAME FLOW ──────────────────────────────────────────
  phase: 'idle',          // 'idle' | 'bowling' | 'slider' | 'batting' | 'result' | 'gameover'
  setPhase: (p) => set({ phase: p }),

  // ── BATTING STYLE ──────────────────────────────────────
  battingStyle: 'aggressive',   // 'aggressive' | 'defensive'
  setBattingStyle: (s) => set({ battingStyle: s }),

  // ── SCORE ──────────────────────────────────────────────
  runs: 0,
  wickets: 0,
  ballsBowled: 0,

  addRuns: (n) => set((state) => ({ runs: state.runs + n })),

  addWicket: () => set((state) => ({ wickets: state.wickets + 1 })),

  addBall: () => set((state) => ({ ballsBowled: state.ballsBowled + 1 })),

  // ── LAST RESULT (for commentary + canvas highlight) ────
  lastResult: null,       // null | 'Wicket' | '0' | '1' | '2' | '3' | '4' | '6'
  setLastResult: (r) => set({ lastResult: r }),

  // ── COMMENTARY ─────────────────────────────────────────
  commentary: 'Pick a style and click Bowl!',
  setCommentary: (c) => set({ commentary: c }),

  // ── POWER BAR ──────────────────────────────────────────
  sliderActive: false,
  setSliderActive: (v) => set({ sliderActive: v }),

  // ── RESET — one action resets everything ───────────────
  resetGame: () => set({
    phase: 'idle',
    battingStyle: 'aggressive',
    runs: 0,
    wickets: 0,
    ballsBowled: 0,
    lastResult: null,
    commentary: 'Pick a style and click Bowl!',
    sliderActive: false,
  }),

}))

export default useGameStore