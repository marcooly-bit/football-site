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

      Lista delle competizioni europee che vogliamo mostrare.

      FILTRIAMO PER ID, NON PER NOME.
      Questo impedisce di prendere per errore:
      - Premier League India
      - Ligue 1 Algeria
      - altre competizioni omonime
    */

    const allowedCompetitions = {
      2: {
        name: "Champions League",
        country: "World",
        order: 20
      },

      3: {
        name: "Europa League",
        country: "World",
        order: 21
      },

      848: {
        name: "Conference League",
        country: "World",
        order: 22
      },

      // 🇬🇧 England
      39: {
        name: "Premier League",
        country: "England",
        order: 1
      },

      45: {
        name: "FA Cup",
        country: "England",
        order: 10
      },

      48: {
        name: "EFL Cup",
        country: "England",
        order: 11
      },

      // 🇮🇹 Italy
      135: {
        name: "Serie A",
        country: "Italy",
        order: 2
      },

      137: {
        name: "Coppa Italia",
        country: "Italy",
        order: 12
      },

      // 🇪🇸 Spain
      140: {
        name: "La Liga",
        country: "Spain",
        order: 3
      },

      // 🇩🇪 Germany
      78: {
        name: "Bundesliga",
        country: "Germany",
        order: 4
      },

      // 🇫🇷 France
      61: {
        name: "Ligue 1",
        country: "France",
        order: 5
      },

      // 🇵🇹 Portugal
      94: {
        name: "Primeira Liga",
        country: "Portugal",
        order: 6
      },

      // 🇳🇱 Netherlands
      88: {
        name: "Eredivisie",
        country: "Netherlands",
        order: 7
      },

      // 🇧🇪 Belgium
      144: {
        name: "Belgian Pro League",
        country: "Belgium",
        order: 8
      },

      // 🇹🇷 Turkey
      203: {
        name: "Süper Lig",
        country: "Turkey",
        order: 9
      }
    };

    /*
      UNA SOLA CHIAMATA API.

      Non specifichiamo league e season.
      Chiediamo semplicemente tutte le partite
      della data desiderata.
    */

    const url =
      "https://v3.football.api-sports.io/fixtures" +
      "?date=" + encodeURIComponent(date) +
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
      return res.status(response.status).json({
        error: "Errore API-Football",
        details: data.errors || null
      });
    }

    if (
      data.errors &&
      Object.keys(data.errors).length > 0
    ) {
      return res.status(500).json({
        error: "Errore API-Football",
        details: data.errors
      });
    }

    /*
      FILTRO PRINCIPALE

      Guardiamo l'ID della competizione restituita
      da API-Football.

      Se l'ID non è nella nostra whitelist,
      la partita viene eliminata.
    */

    const fixtures = (data.response || [])
      .filter((fixture) => {
        if (!fixture.league) {
          return false;
        }

        const leagueId = Number(fixture.league.id);

        return allowedCompetitions[leagueId] !== undefined;
      })
      .map((fixture) => {
        const leagueId = Number(fixture.league.id);
        const competition = allowedCompetitions[leagueId];

        /*
          Controllo extra del paese.

          Per Champions / Europa / Conference
          il paese viene ignorato perché sono competizioni UEFA.
        */

        if (
          competition.country !== "World" &&
          fixture.league.country !== competition.country
        ) {
          return null;
        }

        /*
          Normalizziamo il nome ricevuto dall'API
          usando il nostro nome ufficiale.
        */

        return {
          ...fixture,

          league: {
            ...fixture.league,

            name: competition.name,
            country: competition.country,

            /*
              Conserviamo anche l'ordine che abbiamo deciso.
            */
            order: competition.order
          }
        };
      })
      .filter(Boolean);

    /*
      Ordine:
      prima per data/ora,
      poi per ordine della competizione.
    */

    fixtures.sort((a, b) => {
      const dateDifference =
        new Date(a.fixture.date) -
        new Date(b.fixture.date);

      if (dateDifference !== 0) {
        return dateDifference;
      }

      return (
        (a.league.order || 999) -
        (b.league.order || 999)
      );
    });

    /*
      Cache di 60 secondi.
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
