import TeamFlag from './TeamFlag.jsx'
import { getGameStatus } from '../utils/scoring.js'

function statusLabel(status) {
  if (status === 'live') return 'LIVE'
  if (status === 'finished') return 'FT'
  return 'Upcoming'
}

export default function LiveMatches({ games }) {
  const live = games.filter((g) => getGameStatus(g) === 'live')
  const recent = games
    .filter((g) => getGameStatus(g) === 'finished')
    .slice(-4)
    .reverse()
  const upcoming = games.filter((g) => getGameStatus(g) === 'upcoming').slice(0, 4)

  const sections = [
    { title: 'Live Now', items: live, accent: 'live' },
    { title: 'Just Finished', items: recent, accent: 'finished' },
    { title: 'Coming Up', items: upcoming, accent: 'upcoming' },
  ].filter((section) => section.items.length > 0)

  if (sections.length === 0) {
    return (
      <section className="panel live-panel">
        <h2>Matches</h2>
        <p className="muted">No match data available right now.</p>
      </section>
    )
  }

  return (
    <section className="panel live-panel">
      <div className="panel-header">
        <h2>Match Center</h2>
        <span className="live-pulse">Updating live</span>
      </div>

      <div className="match-sections">
        {sections.map((section) => (
          <div key={section.title} className="match-section">
            <h3>{section.title}</h3>
            <div className="match-grid">
              {section.items.map((game) => {
                const status = getGameStatus(game)
                const homeScore = parseInt(game.home_score, 10) || 0
                const awayScore = parseInt(game.away_score, 10) || 0

                return (
                  <article key={game.id} className={`match-card ${status}`}>
                    <div className="match-meta">
                      <span className={`status-badge ${status}`}>{statusLabel(status)}</span>
                      {game.group && <span className="group-badge">Group {game.group}</span>}
                    </div>

                    <div className="match-row">
                      <div className="team-line">
                        <TeamFlag team={game.home} />
                        <span>{game.home}</span>
                      </div>
                      <strong className="score">{homeScore}</strong>
                    </div>

                    <div className="match-row">
                      <div className="team-line">
                        <TeamFlag team={game.away} />
                        <span>{game.away}</span>
                      </div>
                      <strong className="score">{awayScore}</strong>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
