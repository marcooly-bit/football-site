document.addEventListener("DOMContentLoaded", () => {
  const competitionLogo = document.querySelector(
    'img[src*="images/competitions/"]'
  );

  if (!competitionLogo) return;

  const src = competitionLogo.getAttribute("src").toLowerCase();

  const leagues = {
    "eredivisie.png": "eredivisie"
  };

  for (const [logo, className] of Object.entries(leagues)) {
    if (src.includes(logo)) {
      document.body.classList.add(className);
      break;
    }
  }
});
