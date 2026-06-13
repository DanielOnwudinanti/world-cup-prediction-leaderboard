# World Cup 2026 Prediction Leaderboard

A live leaderboard for Daniel, Emmanuel, and Praise's World Cup 2026 bracket predictions.

## Quick start

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

## How it works

- Predictions are parsed from the three PDF files in the project root
- Live scores come from the [worldcup26.ir](https://worldcup26.ir) API
- The leaderboard updates every 30 seconds
- During live matches, rankings include projected points based on the current score

## Scoring

| Rule | Points |
|------|--------|
| Correct result (win/draw/loss) | 1 |
| Correct champion | 15 (awarded when tournament ends) |

## Refresh predictions

If you update the PDF files, re-run:

```bash
npm run parse
```

## Build for production

```bash
npm run build
npm run preview
```
