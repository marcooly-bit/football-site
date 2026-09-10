export default async function handler(req, res) {
  try {
    // Data di oggi o passata tramite query string (es. ?date=2026-09-10)
    const date = req.query.date || "2026-09-10";
    const apiKey = process.env.API_FOOTBALL_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "Chiave API mancante nelle variabili d'ambiente"
      });
    }

    // ID 2 corrisponde alla UEFA Champions League su API-Football
    const response = await fetch(
      `https://v3.football.api-sports.io/fixtures?date=${date}&league=2&timezone=Europe/Rome`,
      {
        headers: {
          "x-apisports-key": apiKey
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.setHeader(
      "Cache-Control",
      "s-maxage=60, stale-while-revalidate=300"
    );

    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({
      error: "Errore nel recupero delle partite da API-Football"
    });
  }
}
