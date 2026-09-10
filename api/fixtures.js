export default async function handler(req, res) {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: "Manca la data (formato richiesto: YYYY-MM-DD)" });
    }

    const apiKey = process.env.FOOTBALL_DATA_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "Chiave FOOTBALL_DATA_KEY non configurata su Vercel" });
    }

    // Chiamata all'API per la finestra temporale della singola giornata
    const apiUrl = `https://api.football-data.org/v4/matches?dateFrom=${date}&dateTo=${date}`;

    const response = await fetch(apiUrl, {
      headers: {
        "X-Auth-Token": apiKey
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    // Filtra lato server per mantenere solo la Champions League (codice competizione: CL)
    const championsMatches = (data.matches || []).filter(
      (match) => match.competition.code === "CL"
    );

    res.setHeader("Cache-Control", "no-store, max-age=0");

    // Invia i dati trovati al tuo frontend o al browser
    return res.status(200).json({
      date: date,
      count: championsMatches.length,
      matches: championsMatches
    });

  } catch (error) {
    return res.status(500).json({ error: "Errore durante il recupero dei dati" });
  }
}
