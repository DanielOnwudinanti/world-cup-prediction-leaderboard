import { useEffect, useMemo, useState } from 'react'
import Leaderboard from './components/Leaderboard.jsx'
import LiveMatches from './components/LiveMatches.jsx'
import PredictionCompare from './components/PredictionCompare.jsx'
import { scorePlayer, sortLeaderboard } from './utils/scoring.js'
import { normalizeTeam } from './utils/teams.js'

const REFRESH_MS = 30000

function normalizeGames(raw) {
  const games = raw?.games || raw || []
  return games.map((game) => ({
    ...game,
    home: normalizeTeam(game.home_team_name_en || game.home),
    away: normalizeTeam(game.away_team_name_en || game.away),
    home_score: game.home_score ?? '0',
    away_score: game.away_score ?? '0',
  }))
}

export default function App() {
  const [predictions, setPredictions] = useState(null)
  const [games, setGames] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)

  useEffect(() => {
    fetch('/data/predictions.json')
      .then((res) => res.json())
      .then(setPredictions)
      .catch(() => setError('Could not load predictions.'))
  }, [])

  useEffect(() => {
    let active = true

    async function loadGames() {
      try {
        const res = await fetch('/api/games')
        if (!res.ok) throw new Error('Failed to fetch live games')
        const data = await res.json()
        if (active) {
          setGames(normalizeGames(data))
          setLastUpdated(new Date())
          setError(null)
        }
      } catch {
        if (active) setError('Live scores unavailable — showing predictions only.')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadGames()
    const timer = setInterval(loadGames, REFRESH_MS)
    return () => {
      active = false
      clearInterval(timer)
    }
  }, [])

  const hasLiveGames = useMemo(
    () => games.some((g) => String(g.time_elapsed).toLowerCase() === 'live'),
    [games],
  )

  const leaderboard = useMemo(() => {
    if (!predictions) return []
    const entries = predictions.players.map((player) => scorePlayer(player, games))
    return sortLeaderboard(entries, hasLiveGames)
  }, [predictions, games, hasLiveGames])

  return (
    <div className="app">
      <div className="bg-gradient" />
      <div className="bg-grid" />

      <header className="hero">
        <div className="hero-badge">FIFA World Cup 2026</div>
        <h1>Prediction Leaderboard</h1>
        <p>Daniel · Emmanuel · Praise — who called it best?</p>
        {lastUpdated && (
          <p className="updated-at">
            Last updated {lastUpdated.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
          </p>
        )}
      </header>

      {error && <div className="banner warning">{error}</div>}

      <main className="layout">
        <Leaderboard entries={leaderboard} useProjected={hasLiveGames} />

        <aside className="side-column">
          <LiveMatches games={games} />

          <section className="panel picks-panel">
            <h2>Champion Picks</h2>
            <div className="pick-cards">
              {predictions?.players.map((player) => (
                <div key={player.id} className="pick-card">
                  <strong>{player.name}</strong>
                  <span>{player.championPicks.join(' · ')}</span>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </main>

      <PredictionCompare games={games} players={predictions?.players} />

      {loading && <div className="loading-bar" />}
    </div>
  )
}
