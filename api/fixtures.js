export default async function handler(req, res) {
  const date = req.query.date;

  const apiKey = process.env.API_FOOTBALL_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: "API key non trovata"
    });
  }

  const url =
    "https://v3.football.api-sports.io/fixtures" +
    "?date=" + encodeURIComponent(date) +
    "&timezone=Europe/Rome";

  const response = await fetch(url, {
    headers: {
      "x-apisports-key": apiKey,
      "Accept": "application/json"
    }
  });

  const data = await response.json();

  return res.status(200).json({
    apiStatus: response.status,
    apiErrors: data.errors,
    apiResults: data.results,
    firstFixtures: (data.response || []).slice(0, 5)
  });
}
