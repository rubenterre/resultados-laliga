/* 
 * Netlify Scheduled Function
 * Runs every 30 minutes
 * Schedule: */30 * * * *
 */

const API_TOKEN = process.env.FOOTBALL_API_TOKEN;
const API_BASE = 'https://api.football-data.org/v4';
const LALIGA_CODE = 'PD';

async function fetchWithAuth(url) {
  const response = await fetch(url, {
    headers: { 'X-Auth-Token': API_TOKEN }
  });
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.json();
}

async function getLastFinishedMatchday(matches) {
  const finished = matches.filter(m => m.status === 'FINISHED');
  if (finished.length === 0) return null;
  return finished[0].matchday;
}

async function getNextMatchday(matches) {
  const scheduled = matches.filter(m => m.status === 'SCHEDULED');
  if (scheduled.length === 0) return null;
  return scheduled[0].matchday;
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function fetchLaLigaData() {
  const today = new Date();
  const fromDate = new Date(today);
  fromDate.setDate(fromDate.getDate() - 14);
  const toDate = new Date(today);
  toDate.setDate(toDate.getDate() + 14);

  const from = fromDate.toISOString().split('T')[0];
  const to = toDate.toISOString().split('T')[0];

  const data = await fetchWithAuth(
    `${API_BASE}/competitions/${LALIGA_CODE}/matches?dateFrom=${from}&dateTo=${to}`
  );

  const lastMatchday = await getLastFinishedMatchday(data.matches);
  const nextMatchday = await getNextMatchday(data.matches);

  const lastMatches = data.matches.filter(m => m.matchday === lastMatchday);
  const nextMatches = data.matches.filter(m => m.matchday === nextMatchday);

  const celtaId = 564;
  const celtaLastMatch = lastMatches.find(m => 
    m.homeTeam.id === celtaId || m.awayTeam.id === celtaId
  );
  const celtaNextMatch = nextMatches.find(m => 
    m.homeTeam.id === celtaId || m.awayTeam.id === celtaId
  );

  const formatMatch = (m, isCelta) => ({
    id: m.id,
    home: {
      name: m.homeTeam.name,
      shortName: slugify(m.homeTeam.name),
      isCelta: m.homeTeam.id === celtaId
    },
    away: {
      name: m.awayTeam.name,
      shortName: slugify(m.awayTeam.name),
      isCelta: m.awayTeam.id === celtaId
    },
    homeScore: m.score.fullTime.home ?? null,
    awayScore: m.score.fullTime.away ?? null,
    status: m.status === 'FINISHED' ? 'finished' : m.status === 'IN_PLAY' || m.status === 'LIVE' ? 'live' : 'scheduled',
    date: m.utcDate,
    venue: m.homeTeam.name,
    isHome: m.homeTeam.id === celtaId,
    isCelta: isCelta
  });

  return {
    jornada: lastMatchday,
    jornadaSiguiente: nextMatchday,
    partidos: lastMatches.map(m => formatMatch(m, m.homeTeam.id === celtaId || m.awayTeam.id === celtaId)),
    proximosPartidos: nextMatches.map(m => formatMatch(m, m.homeTeam.id === celtaId || m.awayTeam.id === celtaId)),
    celta: {
      ultimo: celtaLastMatch ? formatMatch(celtaLastMatch, true) : null,
      proximo: celtaNextMatch ? formatMatch(celtaNextMatch, true) : null
    },
    fetchedAt: new Date().toISOString()
  };
}

exports.handler = async (event, context) => {
  try {
    const data = await fetchLaLigaData();
    console.log('LaLiga data fetched successfully:', data.fetchedAt);
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, data })
    };
  } catch (error) {
    console.error('Error fetching LaLiga data:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
};
