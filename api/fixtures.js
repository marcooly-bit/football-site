export default async function handler(req, res) {
  try {
    const date = req.query.date;

    if (!date) {
      return res.status(400).json({
        error: "Manca la data"
      });
    }

    const apiKey = process.env.API_FOOTBALL_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "API key non trovata su Vercel"
      });
    }

    /*
      Le principali competizioni che vogliamo
      mostrare sulla homepage.

      ID API-Football:
      2   Champions League
      3   Europa League
      848 Conference League
      39  Premier League
      135 Serie A
      140 La Liga
      78  Bundesliga
      61  Ligue 1
      137 Coppa Italia
      45  FA Cup
      48  EFL Cup
    */

    const leagues = [
      {
        id: 2,
        name: "UEFA Champions League",
        order: 1
      },
      {
        id: 39,
        name: "Premier League",
        order: 2
      },
      {
        id: 135,
        name: "Serie A",
        order: 3
      },
      {
        id: 140,
        name: "La Liga",
        order: 4
      },
      {
        id: 78,
        name: "Bundesliga",
        order: 5
      },
      {
        id: 61,
        name: "Ligue 1",
        order: 6
      },
      {
        id: 3,
        name: "UEFA Europa League",
        order: 7
      },
      {
        id: 848,
        name: "UEFA Conference League",
        order: 8
      },
      {
        id: 137,
        name: "Coppa Italia",
        order: 9
      },
      {
        id: 45,
        name: "FA Cup",
        order: 10
      },
      {
        id: 48,
        name: "EFL Cup",
        order: 11
      }
    ];


    /*
      La stagione 2026/27 per queste competizioni
      è indicata dall'anno 2026.
    */

    const season = 2026;


    /*
      Facciamo una richiesta per ogni competizione.

      Promise.all permette di farle in parallelo.
    */

    const requests = leagues.map(async (league) => {

      const url =
        "https://v3.football.api-sports.io/fixtures" +
        "?league=" +
        league.id +
        "&season=" +
        season +
        "&date=" +
        encodeURIComponent(date) +
        "&timezone=Europe/Rome";


      const response = await fetch(url, {
        method: "GET",

        headers: {
          "x-apisports-key": apiKey,
          "Accept": "application/json"
        }
      });


      const data = await response.json();


      if (!response.ok) {
        throw new Error(
          `Errore API per ${league.name}: ${response.status}`
        );
      }


      /*
        API-Football può restituire errori
        anche dentro una risposta HTTP 200.
      */

      if (
        data.errors &&
        Object.keys(data.errors).length > 0
      ) {

        console.warn(
          `Errore ${league.name}:`,
          data.errors
        );

        return [];
      }


      return data.response || [];

    });


    const results =
      await Promise.all(requests);


    /*
      Uniamo tutte le partite.
    */

    const fixtures =
      results.flat();


    /*
      Ordiniamo cronologicamente.
    */

    fixtures.sort((a, b) => {

      return (
        new Date(a.fixture.date) -
        new Date(b.fixture.date)
      );

    });


    /*
      Cache breve.
    */

    res.setHeader(
      "Cache-Control",
      "s-maxage=60, stale-while-revalidate=300"
    );


    return res.status(200).json({
      get: "fixtures",
      date: date,
      results: fixtures.length,
      response: fixtures
    });


  } catch (error) {

    console.error(
      "API FOOTBALL ERROR:",
      error
    );


    return res.status(500).json({
      error: "Errore interno",
      details: error.message
    });

  }
}
