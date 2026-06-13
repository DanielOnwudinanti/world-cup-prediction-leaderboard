import TeamFlag from './TeamFlag.jsx'

const MEDALS = ['🥇', '🥈', '🥉']

export default function Leaderboard({ entries, useProjected }) {
  return (
    <section className="panel leaderboard-panel">
      <div className="panel-header">
        <h2>Leaderboard</h2>
        <span className="scoring-hint">
          {useProjected ? 'Includes live match projections' : 'Confirmed points only'}
        </span>
      </div>

      <div className="leaderboard-list">
        {entries.map((entry, index) => {
          const points = useProjected ? entry.projectedPoints : entry.confirmedPoints
          const liveBonus = entry.projectedPoints - entry.confirmedPoints

          return (
            <article
              key={entry.id}
              className={`leader-card rank-${index + 1}`}
              style={{ '--rank-delay': `${index * 80}ms` }}
            >
              <div className="rank-badge">{MEDALS[index] || `#${index + 1}`}</div>

              <div className="leader-main">
                <div className="leader-name-row">
                  <h3>{entry.name}</h3>
                  {entry.predictedChampion && (
                    <div className="champion-pick">
                      <TeamFlag team={entry.predictedChampion} size={22} />
                      <span>{entry.predictedChampion} to win</span>
                    </div>
                  )}
                </div>

                <div className="leader-stats">
                  <span>{entry.correctResults} correct picks</span>
                  <span>{entry.matchesScored} matches played</span>
                </div>
              </div>

              <div className="points-block">
                <div className="points-value">{points}</div>
                <div className="points-label">pts</div>
                {useProjected && liveBonus > 0 && (
                  <div className="live-bonus">+{liveBonus} live</div>
                )}
              </div>
            </article>
          )
        })}
      </div>

      <div className="scoring-rules">
        <strong>Scoring:</strong> 1 pt per correct result (win/draw/loss) · 15 pts for picking the champion (awarded at end)
      </div>
    </section>
  )
}
