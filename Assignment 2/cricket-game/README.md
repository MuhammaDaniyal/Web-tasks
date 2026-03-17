# Cricket Bash — Web Programming Assignment Report README

This README is prepared so you can directly give it to Claude (or any writing assistant) to generate a polished PDF report for your university submission.

## 1) Project Information

- **Project Title:** Cricket Bash (Web Cricket Game)
- **Course:** CS-4032 Web Programming
- **Tech Stack:** React (Vite), Zustand, Tailwind CSS, HTML5 Canvas
- **Developer:**
	- Name: `[Your Name]`
	- Roll Number: `[Your Roll Number]`
	- Section: `[Your Section]`

## 2) How to Run the Project

```bash
npm install
npm run dev
```

Open the local Vite URL in browser (usually `http://localhost:5173`).

## 3) Gameplay Overview

The game is a single-innings batting simulation.

1. User enters player name and starts match.
2. User chooses batting style:
	 - Aggressive (high risk, high reward)
	 - Defensive (lower risk, steadier scoring)
3. User clicks **Bowl** to animate ball delivery.
4. Power bar activates with moving slider.
5. User clicks power bar to lock shot timing.
6. System maps slider position to an outcome (Wicket / 0 / 1 / 2 / 3 / 4 / 6).
7. Scoreboard and commentary update after each ball.
8. Game ends when innings limit is reached, then Game Over overlay appears.

## 4) Game Logic and Working Mechanism

### 4.1 State Management (Zustand)
Core states include:
- `battingStyle`
- `runs`, `wickets`, `ballsBowled`
- `phase` (idle, bowling, slider, shot, gameover)
- `lastResult` and `commentary`

### 4.2 Ball-by-Ball Flow
Per delivery, the flow is:
1. **Bowling animation starts** via canvas.
2. On ball arrival at batsman, **power bar activates**.
3. Player click captures current slider position (`0.0` to `1.0`).
4. Position is compared with cumulative probability segments of selected batting style.
5. Matched segment decides result (`Wicket`, `0`, `1`, `2`, `3`, `4`, `6`).
6. Store updates score + commentary + phase.
7. If game-ending condition is met, phase changes to `gameover`.

### 4.3 Scoring
- Numeric outcomes add corresponding runs.
- `Wicket` increases wicket count.
- Over display is formatted as `overs.balls` using `ballsBowled`.

## 5) Mapping of Probabilities to the Power Bar

Power bar is divided into colored segments. Each segment has probability weight and outcome label.

### 5.1 Aggressive Style Distribution
| Outcome | Probability |
|---|---:|
| Wicket | 35% |
| 0 | 8% |
| 1 | 7% |
| 2 | 10% |
| 3 | 5% |
| 4 | 15% |
| 6 | 20% |

### 5.2 Defensive Style Distribution
| Outcome | Probability |
|---|---:|
| Wicket | 15% |
| 0 | 20% |
| 1 | 25% |
| 2 | 20% |
| 3 | 8% |
| 4 | 8% |
| 6 | 4% |

### 5.3 Selection Mechanism
If slider position is `p` and cumulative sums are `c1, c2, c3...`, first segment with `p <= ci` is selected.

Example (aggressive):
- `0.00–0.35` → Wicket
- `0.35–0.43` → 0
- `0.43–0.50` → 1
- `0.50–0.60` → 2
- `0.60–0.65` → 3
- `0.65–0.80` → 4
- `0.80–1.00` → 6

## 6) Implementation of Animations

Animations are implemented using `requestAnimationFrame`.

### 6.1 Bowling Animation
- Ball moves from bowler side to batsman side.
- Position updated per frame using time delta (`dt`) for smooth movement.

### 6.2 Power Bar Animation
- Slider line oscillates left-right continuously.
- Direction flips at boundaries (`0` and `1`) creating a ping-pong motion.

### 6.3 Shot Animation
- For scoring shots (`1/2/3/4/6`), ball is projected on angle-based trajectory.
- Angle is mapped per outcome (higher run shots generally have steeper trajectory).

### 6.4 Visual Feedback
- Outcome-based commentary color changes.
- Batsman highlight for strong outcomes (e.g., boundaries).
- Game Over appears as overlay on canvas.

## 7) Required Screenshot Evidence (For PDF)

Take **full-screen** screenshots of all required states:

1. Aggressive batting in action
2. Defensive batting in action
3. Power bar visible during gameplay
4. Scoreboard updates reflecting game progress
5. Game over screen

### Mandatory Identity Note in Every Screenshot
Each screenshot must show a visible sticky note containing:
- Name
- Roll Number
- Section

Suggested sticky-note text format:

```text
Name: [Your Name]
Roll No: [Your Roll Number]
Section: [Your Section]
```

## 8) Suggested Screenshot Filenames

- `01_aggressive_action.png`
- `02_defensive_action.png`
- `03_power_bar_visible.png`
- `04_scoreboard_progress.png`
- `05_game_over.png`

## 9) Claude Prompt (Copy-Paste)

Use this prompt with Claude to generate your final report document:

```text
Create a formal university project report in clean academic style based on the following details.

Title: Cricket Bash — Web Cricket Game
Course: CS-4032 Web Programming
Student Name: [Your Name]
Roll Number: [Your Roll Number]
Section: [Your Section]

Include these sections:
1) Introduction
2) Tools and Technologies
3) Game Logic and Working Mechanism
4) Probability Mapping to Power Bar
5) Animation Implementation
6) Screenshot-Based Results
7) Conclusion

Important formatting requirements:
- Keep explanation concise but technical.
- Use tables where useful (especially for probability mapping).
- Mention aggressive vs defensive gameplay behavior clearly.
- Add figure captions for each screenshot.

Use these screenshot placeholders (I will replace with actual images):
- Figure 1: Aggressive batting in action (01_aggressive_action.png)
- Figure 2: Defensive batting in action (02_defensive_action.png)
- Figure 3: Power bar visible (03_power_bar_visible.png)
- Figure 4: Scoreboard updates (04_scoreboard_progress.png)
- Figure 5: Game over screen (05_game_over.png)

Note: Every screenshot includes visible sticky-note identity with Name, Roll Number, and Section.
```

## 10) Submission Checklist

- [ ] Full-screen screenshots captured
- [ ] Sticky note visible in every screenshot
- [ ] All 5 required gameplay states captured
- [ ] Report generated from this README content
- [ ] Exported as PDF and verified before submission
