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

  return {
    lastMatchday,
    nextMatchday,
    lastMatches,
    nextMatches,
    celtaLastMatch,
    celtaNextMatch,
    fetchedAt: new Date().toISOString()
  };
}

exports.handler = async (event, context) => {
  try {
    const data = await fetchLaLigaData();
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data, null, 2)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
