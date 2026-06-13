const LIVE_GAMES_URL = 'https://worldcup26.ir/get/games'

export function predictionsUrl() {
  return `${import.meta.env.BASE_URL}data/predictions.json`
}

export async function fetchLiveGames() {
  const response = await fetch(LIVE_GAMES_URL)
  if (!response.ok) throw new Error('Failed to fetch live games')
  return response.json()
}
