export default async function handler(req, res) {
  try {
    const date = req.query.date;

    if (!date) {
      return res.status(400).json({
        error: "Manca la data"
      });
    }

    // Chiave API di football-data.org
    const apiKey = process.env.FOOTBALL_DATA_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "API key di football-data.org non trovata su Vercel"
      });
    }

    /*
      Competizioni disponibili nel piano gratuito
      che vogliamo mostrare su Pages Of Football.
    */

    const allowedCompetitions = {
      CL: {
        name: "Champions League",
        country: "Europe",
        order: 1
      },

      PL: {
        name: "Premier League",
        country: "England",
        order: 2
      },

      SA: {
        name: "Serie A",
        country: "Italy",
        order: 3
      },

      PD: {
        name: "La Liga",
        country: "Spain",
        order: 4
      },

      BL1: {
        name: "Bundesliga",
        country: "Germany",
        order: 5
      },

      FL1: {
        name: "Ligue 1",
        country: "France",
        order: 6
      },

      PPL: {
        name: "Primeira Liga",
        country: "Portugal",
        order: 7
      },

      DED: {
        name: "Eredivisie",
        country: "Netherlands",
        order: 8
      }
    };

    /*
      Recuperiamo tutte le partite della data richiesta.

      Esempio:
      /api/fixtures?date=2026-09-10
    */

    const url =
      "https://api.football-data.org/v4/matches" +
      "?date=" +
      encodeURIComponent(date);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-Auth-Token": apiKey,
        "Accept": "application/json"
      }
    });

    const data = await response.json();

    /*
      Se football-data.org restituisce un errore,
      lo rimandiamo al browser per poterlo vedere
      facilmente durante i test.
    */

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Errore football-data.org",
        status: response.status,
        details: data
      });
    }

    /*
      Teniamo solamente le competizioni che ci interessano.
    */

    const fixtures = (data.matches || [])
      .filter((match) => {
        if (!match.competition) {
          return false;
        }

        return (
          allowedCompetitions[match.competition.code] !== undefined
        );
      })

      /*
        Convertiamo il formato di football-data.org
        nel formato che il nostro index.html
        sta già utilizzando.
      */

      .map((match) => {
        const competition =
          allowedCompetitions[match.competition.code];

        return {
          fixture: {
            id: match.id,
            date: match.utcDate,

            status: {
              short: convertStatus(match.status),
              long: match.status
            }
          },

          league: {
            id: match.competition.id,
            name: competition.name,
            country: competition.country,
            logo: match.competition.emblem || null,
            order: competition.order
          },

          teams: {
            home: {
              id: match.homeTeam?.id,
              name: match.homeTeam?.name || "TBD",
              logo: match.homeTeam?.crest || null,

              winner:
                match.score?.winner === "HOME"
            },

            away: {
              id: match.awayTeam?.id,
              name: match.awayTeam?.name || "TBD",
              logo: match.awayTeam?.crest || null,

              winner:
                match.score?.winner === "AWAY"
            }
          },

          goals: {
            home: match.score?.fullTime?.home ?? null,
            away: match.score?.fullTime?.away ?? null
          }
        };
      });

    /*
      Ordiniamo le partite:
      prima per orario, poi per competizione.
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
      Cache breve per evitare richieste inutili all'API.
    */

    res.setHeader(
      "Cache-Control",
      "s-maxage=60, stale-while-revalidate=300"
    );

    /*
      Restituiamo il risultato nel formato
      previsto dal frontend.
    */

    return res.status(200).json({
      get: "fixtures",
      date: date,
      results: fixtures.length,
      response: fixtures
    });

  } catch (error) {
    console.error(
      "FOOTBALL-DATA ERROR:",
      error
    );

    return res.status(500).json({
      error: "Errore interno",
      details: error.message
    });
  }
}


/*
  Conversione degli stati di football-data.org
  negli stati che già utilizziamo nel sito.
*/

function convertStatus(status) {
  switch (status) {
    case "IN_PLAY":
      return "LIVE";

    case "PAUSED":
      return "HT";

    case "FINISHED":
      return "FT";

    case "POSTPONED":
      return "PST";

    case "CANCELLED":
      return "CANC";

    case "SUSPENDED":
      return "SUSP";

    case "TIMED":
    case "SCHEDULED":
    default:
      return "NS";
  }
}
