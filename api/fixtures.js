export default async function handler(req, res) {
  try {
    const date = req.query.date;

    if (!date) {
      return res.status(400).json({
        error: "Manca la data"
      });
    }

    const apiKey = process.env.api_football_key;

    if (!apiKey) {
      return res.status(500).json({
        error: "API key non trovata su Vercel"
      });
    }

    const url =
      "https://v3.football.api-sports.io/fixtures?date=" +
      encodeURIComponent(date) +
      "&timezone=Europe/Rome";

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-apisports-key": apiKey
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);

  } catch (error) {

    console.error("API FOOTBALL ERROR:", error);

    return res.status(500).json({
      error: "Errore interno",
      details: error.message
    });
  }
}
