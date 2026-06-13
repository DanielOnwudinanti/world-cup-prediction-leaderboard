import { flagUrl, initials } from '../utils/teams.js'

export default function TeamFlag({ team, size = 28 }) {
  const url = flagUrl(team)

  if (url) {
    return (
      <img
        src={url}
        alt={`${team} flag`}
        className="team-flag"
        width={size}
        height={Math.round(size * 0.75)}
        loading="lazy"
      />
    )
  }

  return (
    <span className="team-flag-fallback" style={{ width: size, height: Math.round(size * 0.75) }}>
      {initials(team)}
    </span>
  )
}
