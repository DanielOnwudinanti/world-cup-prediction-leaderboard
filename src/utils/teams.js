export const TEAM_CODES = {
  Mexico: 'mx',
  'South Africa': 'za',
  'South Korea': 'kr',
  'Czech Republic': 'cz',
  Canada: 'ca',
  Switzerland: 'ch',
  Qatar: 'qa',
  'Bosnia and Herzegovina': 'ba',
  Brazil: 'br',
  Morocco: 'ma',
  Scotland: 'gb-sct',
  Haiti: 'ht',
  'United States': 'us',
  Paraguay: 'py',
  Australia: 'au',
  Turkey: 'tr',
  Germany: 'de',
  Ecuador: 'ec',
  Curaçao: 'cw',
  'Ivory Coast': 'ci',
  Netherlands: 'nl',
  Japan: 'jp',
  Sweden: 'se',
  Tunisia: 'tn',
  Belgium: 'be',
  Egypt: 'eg',
  Iran: 'ir',
  'New Zealand': 'nz',
  Spain: 'es',
  Uruguay: 'uy',
  'Saudi Arabia': 'sa',
  'Cape Verde': 'cv',
  France: 'fr',
  Senegal: 'sn',
  Norway: 'no',
  Iraq: 'iq',
  Argentina: 'ar',
  Austria: 'at',
  Algeria: 'dz',
  Jordan: 'jo',
  Portugal: 'pt',
  Colombia: 'co',
  'Democratic Republic of the Congo': 'cd',
  Uzbekistan: 'uz',
  England: 'gb-eng',
  Croatia: 'hr',
  Panama: 'pa',
  Ghana: 'gh',
}

export function normalizeTeam(name) {
  if (!name) return ''
  const aliases = {
    Czechia: 'Czech Republic',
    Turkiye: 'Turkey',
    'DR Congo': 'Democratic Republic of the Congo',
    USA: 'United States',
    Curacao: 'Curaçao',
    Bosnia: 'Bosnia and Herzegovina',
  }
  return aliases[name] || name
}

export function matchKey(home, away) {
  const a = normalizeTeam(home)
  const b = normalizeTeam(away)
  return [a, b].sort().join('|')
}

export function flagUrl(team) {
  const code = TEAM_CODES[normalizeTeam(team)]
  return code ? `https://flagcdn.com/w80/${code}.png` : null
}

export function initials(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}
