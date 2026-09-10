export default async function handler(req, res) {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        error: "Manca la data"
      });
    }

    const response = await fetch(
      `https://v3.football.api-sports.io/fixtures?date=${date}&timezone=Europe/Rome`,
      {
        headers: {
          "x-apisports-key": process.env.api_football_key
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    // Permette a Vercel di conservare temporaneamente il risultato
    // e ridurre il numero di richieste all'API.
    res.setHeader(
      "Cache-Control",
      "s-maxage=60, stale-while-revalidate=300"
    );

    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({
      error: "Errore nel collegamento con API-Football"
    });
  }
}
