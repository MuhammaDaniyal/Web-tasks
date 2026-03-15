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

export {COMMENTARY, STYLES}