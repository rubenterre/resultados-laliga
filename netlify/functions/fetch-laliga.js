const API_TOKEN = process.env.FOOTBALL_API_TOKEN;
const API_BASE = 'https://api.football-data.org/v4';
const LALIGA_CODE = 'PD';
const CELTA_ID = 564;

async function fetchWithAuth(url) {
  const response = await fetch(url, {
    headers: { 'X-Auth-Token': API_TOKEN }
  });
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.json();
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function formatMatch(m) {
  const isCelta = m.homeTeam.id === CELTA_ID || m.awayTeam.id === CELTA_ID;
  return {
    id: m.id,
    home: {
      name: m.homeTeam.name,
      shortName: slugify(m.homeTeam.name),
      isCelta: m.homeTeam.id === CELTA_ID
    },
    away: {
      name: m.awayTeam.name,
      shortName: slugify(m.awayTeam.name),
      isCelta: m.awayTeam.id === CELTA_ID
    },
    homeScore: m.score?.fullTime?.home ?? null,
    awayScore: m.score?.fullTime?.away ?? null,
    status: m.status === 'FINISHED' ? 'finished' : m.status === 'IN_PLAY' || m.status === 'LIVE' ? 'live' : 'scheduled',
    date: m.utcDate,
    venue: m.homeTeam.name,
    isHome: m.homeTeam.id === CELTA_ID,
    isCelta
  };
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

  const finishedMatches = data.matches.filter(m => m.status === 'FINISHED');
  const scheduledMatches = data.matches.filter(m => m.status === 'SCHEDULED' || m.status === 'TIMED');

  const lastMatchday = finishedMatches.length > 0 ? finishedMatches[0].matchday : null;
  const nextMatchday = scheduledMatches.length > 0 ? scheduledMatches[0].matchday : null;

  const lastMatches = data.matches.filter(m => m.matchday === lastMatchday);
  const nextMatches = data.matches.filter(m => m.matchday === nextMatchday);

  const celtaLastMatch = lastMatches.find(m => 
    m.homeTeam.id === CELTA_ID || m.awayTeam.id === CELTA_ID
  );
  const celtaNextMatch = nextMatches.find(m => 
    m.homeTeam.id === CELTA_ID || m.awayTeam.id === CELTA_ID
  );

  return {
    jornada: lastMatchday,
    jornadaSiguiente: nextMatchday,
    partidos: lastMatches.map(formatMatch),
    proximosPartidos: nextMatches.map(formatMatch),
    celta: {
      ultimo: celtaLastMatch ? formatMatch(celtaLastMatch) : null,
      proximo: celtaNextMatch ? formatMatch(celtaNextMatch) : null
    },
    fetchedAt: new Date().toISOString()
  };
}

exports.handler = async (event, context) => {
  try {
    const data = await fetchLaLigaData();
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, data })
    };
  } catch (error) {
    console.error('Error fetching LaLiga data:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
};
