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
      PAGES OF FOOTBALL
      Competizioni principali europee

      L'ID identifica la competizione.
      Il paese viene controllato dopo la risposta
      dell'API per evitare omonimie tipo:
      "Premier League" India / "Ligue 1" Algeria.
    */

    const competitions = [
      // 🇬🇧 England
      {
        id: 39,
        name: "Premier League",
        country: "England",
        order: 1
      },
      {
        id: 45,
        name: "FA Cup",
        country: "England",
        order: 10
      },
      {
        id: 48,
        name: "EFL Cup",
        country: "England",
        order: 11
      },

      // 🇮🇹 Italy
      {
        id: 135,
        name: "Serie A",
        country: "Italy",
        order: 2
      },
      {
        id: 137,
        name: "Coppa Italia",
        country: "Italy",
        order: 12
      },

      // 🇪🇸 Spain
      {
        id: 140,
        name: "La Liga",
        country: "Spain",
        order: 3
      },

      // 🇩🇪 Germany
      {
        id: 78,
        name: "Bundesliga",
        country: "Germany",
        order: 4
      },

      // 🇫🇷 France
      {
        id: 61,
        name: "Ligue 1",
        country: "France",
        order: 5
      },

      // 🇵🇹 Portugal
      {
        id: 94,
        name: "Primeira Liga",
        country: "Portugal",
        order: 6
      },

      // 🇳🇱 Netherlands
      {
        id: 88,
        name: "Eredivisie",
        country: "Netherlands",
        order: 7
      },

      // 🇧🇪 Belgium
      {
        id: 144,
        name: "Belgian Pro League",
        country: "Belgium",
        order: 8
      },

      // 🇹🇷 Turkey
      {
        id: 203,
        name: "Süper Lig",
        country: "Turkey",
        order: 9
      },

      // 🇪🇺 UEFA
      {
        id: 2,
        name: "Champions League",
        country: "World",
        order: 20
      },
      {
        id: 3,
        name: "Europa League",
        country: "World",
        order: 21
      },
      {
        id: 848,
        name: "Conference League",
        country: "World",
        order: 22
      }
    ];

    /*
      Le stagioni dei campionati europei 2026/27
      sono indicate dall'anno di inizio: 2026.
    */

    const season = 2026;

    const requests = competitions.map(async (competition) => {
      try {
        const url =
          "https://v3.football.api-sports.io/fixtures" +
          "?league=" + competition.id +
          "&season=" + season +
          "&date=" + encodeURIComponent(date) +
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
          console.warn(
            `Errore HTTP ${competition.name}:`,
            response.status
          );

          return [];
        }

        if (
          data.errors &&
          Object.keys(data.errors).length > 0
        ) {
          console.warn(
            `Errore API ${competition.name}:`,
            data.errors
          );

          return [];
        }

        /*
          FILTRO DI SICUREZZA

          Controlliamo sia l'ID sia il paese.
          In questo modo una competizione omonima
          non può finire accidentalmente nel sito.
        */

        const validFixtures = (data.response || []).filter(
          (fixture) => {
            const league = fixture.league;

            if (!league) {
              return false;
            }

            // L'ID deve essere quello che abbiamo richiesto
            if (Number(league.id) !== competition.id) {
              return false;
            }

            // Per le competizioni nazionali controlliamo il paese
            if (competition.country !== "World") {
              if (league.country !== competition.country) {
                return false;
              }
            }

            return true;
          }
        );

        /*
          Normalizziamo il nome della competizione
          così il frontend riceve sempre quello deciso da noi.
        */

        return validFixtures.map((fixture) => ({
          ...fixture,

          league: {
            ...fixture.league,
            name: competition.name,
            country: competition.country
          }
        }));

      } catch (error) {
        console.warn(
          `Errore caricando ${competition.name}:`,
          error.message
        );

        return [];
      }
    });

    /*
      Promise.all permette di aspettare tutte le competizioni.
      Un errore di una singola lega NON blocca le altre.
    */

    const results = await Promise.all(requests);

    const fixtures = results.flat();

    /*
      Ordine cronologico
    */

    fixtures.sort((a, b) => {
      return (
        new Date(a.fixture.date) -
        new Date(b.fixture.date)
      );
    });

    /*
      Cache:
      non richiamiamo inutilmente API-Football
      ogni volta che la pagina viene caricata.
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
