export default async function handler(req, res) {
  try {
    const { date, league } = req.query;

    if (!date) {
      return res.status(400).json({
        error: "Manca la data (formato richiesto: YYYY-MM-DD)"
      });
    }

    const apiKey = process.env.API_FOOTBALL_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "Chiave API mancante nelle variabili d'ambiente"
      });
    }

    // Se non specifichi la lega dalla chiamata, forza l'ID 2 (Champions League)
    const targetLeague = league || "2";

    // Ricavo l'anno della stagione dalla data passata (es. "2026-09-10" -> "2026")
    const year = date.split("-")[0];

    const apiUrl = `https://v3.football.api-sports.io/fixtures?date=${date}&league=${targetLeague}&season=${year}&timezone=Europe/Rome`;

    const response = await fetch(apiUrl, {
      headers: {
        "x-apisports-key": apiKey
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    // Disabilita la cache per evitare che Vercel mostri dati vecchi durante i cambi data
    res.setHeader("Cache-Control", "no-store, max-age=0");

    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({
      error: "Errore nel collegamento con API-Football"
    });
  }
}
