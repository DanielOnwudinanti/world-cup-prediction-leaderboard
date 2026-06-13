import { matchKey, normalizeTeam } from './teams.js'

export const SCORING = {
  correctResult: 1,
  champion: 15,
}

function result(homeScore, awayScore) {
  if (homeScore > awayScore) return 'H'
  if (homeScore < awayScore) return 'A'
  return 'D'
}

function alignPredictionScores(prediction, gameHome, gameAway) {
  const predHome = normalizeTeam(prediction.home)
  const predAway = normalizeTeam(prediction.away)
  const gHome = normalizeTeam(gameHome)
  const gAway = normalizeTeam(gameAway)

  if (predHome === gHome && predAway === gAway) {
    return { homeScore: prediction.homeScore, awayScore: prediction.awayScore }
  }
  if (predHome === gAway && predAway === gHome) {
    return { homeScore: prediction.awayScore, awayScore: prediction.homeScore }
  }
  return { homeScore: prediction.homeScore, awayScore: prediction.awayScore }
}

export function predictedResult(prediction, gameHome, gameAway) {
  const { homeScore, awayScore } =
    gameHome != null && gameAway != null
      ? alignPredictionScores(prediction, gameHome, gameAway)
      : { homeScore: prediction.homeScore, awayScore: prediction.awayScore }
  return result(homeScore, awayScore)
}

export function formatPredictionOutcome(prediction, home, away) {
  const r = predictedResult(prediction, home, away)
  if (r === 'H') return `${home} win`
  if (r === 'A') return `${away} win`
  return 'Draw'
}

function scoreMatch(prediction, gameHome, gameAway, actualHome, actualAway, status) {
  const isFinished = status === 'finished'
  const isLive = status === 'live'

  if (!isFinished && !isLive) {
    return { confirmed: 0, projected: 0, correctResult: false }
  }

  const { homeScore, awayScore } = alignPredictionScores(prediction, gameHome, gameAway)
  const predResult = result(homeScore, awayScore)
  const actualResult = result(actualHome, actualAway)
  const correct = predResult === actualResult

  let confirmed = 0
  if (isFinished && correct) confirmed = SCORING.correctResult

  let projected = confirmed
  if (isLive && correct) projected = SCORING.correctResult

  return { confirmed, projected, correctResult: correct }
}

export function buildPredictionMap(groupMatches) {
  const map = new Map()
  for (const match of groupMatches) {
    map.set(matchKey(match.home, match.away), match)
  }
  return map
}

export function scorePlayer(player, games) {
  const predictions = buildPredictionMap(player.groupMatches)
  let confirmedPoints = 0
  let projectedPoints = 0
  let correctResults = 0
  let matchesScored = 0
  const matchDetails = []

  for (const game of games) {
    if (game.type !== 'group') continue

    const home = normalizeTeam(game.home)
    const away = normalizeTeam(game.away)
    const key = matchKey(home, away)
    const prediction = predictions.get(key)
    if (!prediction) continue

    const status = getGameStatus(game)
    const actualHome = parseInt(game.home_score, 10) || 0
    const actualAway = parseInt(game.away_score, 10) || 0

    const scored = scoreMatch(prediction, home, away, actualHome, actualAway, status)
    confirmedPoints += scored.confirmed
    projectedPoints += scored.projected

    if (status === 'finished') {
      matchesScored += 1
      if (scored.correctResult) correctResults += 1
    }

    if (status !== 'upcoming') {
      matchDetails.push({
        gameId: game.id,
        home,
        away,
        status,
        actualHome,
        actualAway,
        predictedHome: prediction.homeScore,
        predictedAway: prediction.awayScore,
        ...scored,
      })
    }
  }

  return {
    id: player.id,
    name: player.name,
    predictedChampion: player.predictedChampion,
    championPicks: player.championPicks,
    confirmedPoints,
    projectedPoints,
    correctResults,
    matchesScored,
    matchDetails,
  }
}

export function getGameStatus(game) {
  const finished = String(game.finished).toUpperCase() === 'TRUE'
  const elapsed = (game.time_elapsed || '').toLowerCase()

  if (finished || elapsed === 'finished') return 'finished'
  if (elapsed === 'live') return 'live'
  return 'upcoming'
}

export function sortLeaderboard(entries, useProjected = false) {
  return [...entries].sort((a, b) => {
    const aPts = useProjected ? a.projectedPoints : a.confirmedPoints
    const bPts = useProjected ? b.projectedPoints : b.confirmedPoints
    if (bPts !== aPts) return bPts - aPts
    if (b.correctResults !== a.correctResults) return b.correctResults - a.correctResults
    return a.name.localeCompare(b.name)
  })
}
