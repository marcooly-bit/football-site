document.addEventListener("DOMContentLoaded", () => {
  const competitionLogo = document.querySelector(
    'img[src*="images/competitions/"]'
  );

  if (!competitionLogo) return;

  const src = competitionLogo.getAttribute("src").toLowerCase();

  const leagues = {
    "liga-portugal.png": "liga-portugal",
    "eredivisie.png": "eredivisie",
    "super-lig.png": "super-lig",
    "scottish-premiership.png": "scottish-premiership",
    "jupiler-pro-league.png": "jupiler-pro-league",
    "serie-b.png": "serie-b",
    "segunda-division.png": "segunda-division",
    "2-bundesliga.png": "2-bundesliga",
    "ligue-2.png": "ligue-2"
  };

  for (const [logo, className] of Object.entries(leagues)) {
    if (src.includes(logo)) {
      document.body.classList.add(className);
      break;
    }
  }
});
