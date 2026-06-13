import TeamFlag from './TeamFlag.jsx'
import {
  buildPredictionMap,
  formatPredictionOutcome,
  getGameStatus,
  predictedResult,
} from '../utils/scoring.js'
import { matchKey } from '../utils/teams.js'

function statusLabel(status) {
  if (status === 'live') return 'LIVE'
  return 'Upcoming'
}

function pickStatus(prediction, game) {
  const status = getGameStatus(game)
  if (!prediction || status === 'upcoming') return 'neutral'

  const actualHome = parseInt(game.home_score, 10) || 0
  const actualAway = parseInt(game.away_score, 10) || 0
  const actual = actualHome > actualAway ? 'H' : actualHome < actualAway ? 'A' : 'D'
  const predicted = predictedResult(prediction)

  return predicted === actual ? 'correct' : 'wrong'
}

function MatchPredictions({ game, players }) {
  const status = getGameStatus(game)
  const homeScore = parseInt(game.home_score, 10) || 0
  const awayScore = parseInt(game.away_score, 10) || 0
  const key = matchKey(game.home, game.away)

  return (
    <article className={`prediction-match-card ${status}`}>
      <div className="prediction-match-header">
        <div className="prediction-match-teams">
          <div className="prediction-team">
            <TeamFlag team={game.home} size={32} />
            <span>{game.home}</span>
            {status === 'live' && <strong className="live-score">{homeScore}</strong>}
          </div>
          <span className="prediction-vs">vs</span>
          <div className="prediction-team">
            <TeamFlag team={game.away} size={32} />
            <span>{game.away}</span>
            {status === 'live' && <strong className="live-score">{awayScore}</strong>}
          </div>
        </div>

        <div className="prediction-match-meta">
          <span className={`status-badge ${status}`}>{statusLabel(status)}</span>
          {game.group && <span className="group-badge">Group {game.group}</span>}
          {game.local_date && <span className="time-badge">{game.local_date}</span>}
        </div>
      </div>

      <div className="prediction-picks">
        {players.map((player) => {
          const prediction = player.predictionMap.get(key)
          const state = pickStatus(prediction, game)

          return (
            <div key={player.id} className={`prediction-pick ${state}`}>
              <span className="prediction-player">{player.name}</span>
              <span className="prediction-outcome">
                {prediction
                  ? formatPredictionOutcome(prediction, game.home, game.away)
                  : 'No pick'}
              </span>
              {status === 'live' && state !== 'neutral' && (
                <span className="prediction-live-tag">
                  {state === 'correct' ? 'On track' : 'Off track'}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </article>
  )
}

export default function PredictionCompare({ games, players }) {
  const playerMaps = (players || []).map((player) => ({
    id: player.id,
    name: player.name,
    predictionMap: buildPredictionMap(player.groupMatches || []),
  }))

  const relevant = games.filter((g) => {
    if (g.type !== 'group') return false
    const status = getGameStatus(g)
    return status === 'live' || status === 'upcoming'
  })

  const live = relevant.filter((g) => getGameStatus(g) === 'live')
  const upcoming = relevant.filter((g) => getGameStatus(g) === 'upcoming')

  if (relevant.length === 0) {
    return (
      <section className="panel predictions-panel">
        <h2>Everyone&apos;s Picks</h2>
        <p className="muted">No live or upcoming group games right now.</p>
      </section>
    )
  }

  return (
    <section className="panel predictions-panel">
      <div className="panel-header">
        <h2>Everyone&apos;s Picks</h2>
        <span className="scoring-hint">Live &amp; upcoming games</span>
      </div>

      {live.length > 0 && (
        <div className="prediction-section">
          <h3>Live Now</h3>
          <div className="prediction-match-list">
            {live.map((game) => (
              <MatchPredictions key={game.id} game={game} players={playerMaps} />
            ))}
          </div>
        </div>
      )}

      {upcoming.length > 0 && (
        <div className="prediction-section">
          <h3>Coming Up</h3>
          <div className="prediction-match-list">
            {upcoming.map((game) => (
              <MatchPredictions key={game.id} game={game} players={playerMaps} />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
