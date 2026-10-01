import re
from pathlib import Path


# =========================================================
# FILE
# =========================================================

FILE = Path("liverpool26-27.html")

CLOUDINARY = (
    "https://res.cloudinary.com/vu7tcmgu/image/upload/players/"
)


# =========================================================
# GIOCATORI LIVERPOOL 2026/27
# =========================================================

PLAYERS = [
    "alisson-becker",
    "giorgi-mamardashvili",
    "freddie-woodman",
    "vitezslav-jaros",

    "joe-gomez",
    "virgil-van-dijk",
    "jeremy-jacquet",
    "milos-kerkez",
    "conor-bradley",
    "kostas-tsimikas",
    "jeremie-frimpong",
    "ronald-araujo",
    "luke-chambers",
    "giovanni-leoni",

    "wataru-endo",
    "florian-wirtz",
    "dominik-szoboszlai",
    "alexis-mac-allister",
    "ryan-gravenberch",
    "james-mcconnell",
    "trey-nyoni",

    "cody-gakpo",
    "federico-chiesa",
    "hugo-ekitike",
    "alexander-isak",
    "victor-munoz",
]


# =========================================================
# LETTURA
# =========================================================

if not FILE.exists():
    print(f"ERRORE: file non trovato: {FILE}")
    raise SystemExit


html = FILE.read_text(encoding="utf-8")


# =========================================================
# BACKUP
# =========================================================

backup = Path("liverpool26-27.backup.html")

backup.write_text(
    html,
    encoding="utf-8"
)

print(f"Backup creato: {backup}")


# =========================================================
# SOSTITUZIONE
# =========================================================

changes = 0


for slug in PLAYERS:

    new_url = CLOUDINARY + slug + ".webp"


    # Cerca immagini precedenti associate allo stesso slug
    patterns = [
        f"players/{slug}.png",
        f"players/{slug}.jpg",
        f"players/{slug}.jpeg",
        f"players/{slug}.webp",
    ]


    found = False


    for old_path in patterns:

        old_url = CLOUDINARY + old_path.replace(
            "players/",
            ""
        )

        if old_url in html:

            html = html.replace(
                old_url,
                new_url
            )

            changes += 1
            found = True
            break


    # -----------------------------------------------------
    # CASO IMMAGINE CON NOME DIVERSO
    # -----------------------------------------------------
    #
    # Cerchiamo il blocco del giocatore tramite alt=""
    # e sostituiamo SOLO il src dell'immagine.
    #

    if not found:

        pattern = (
            r'(<img\s+'
            r'src=")[^"]+'
            r'("\s+'
            r'alt="[^"]*'
            + re.escape(slug.replace("-", " "))
            + r'[^"]*"\s*>)'
        )

        new_html, count = re.subn(
            pattern,
            lambda m: m.group(1) + new_url + m.group(2),
            html,
            flags=re.IGNORECASE
        )

        if count:

            html = new_html
            changes += count
            found = True


    if found:

        print(f"OK   {slug}")

    else:

        print(f"---- {slug}: non trovato")


# =========================================================
# SALVATAGGIO
# =========================================================

FILE.write_text(
    html,
    encoding="utf-8"
)


# =========================================================
# RISULTATO
# =========================================================

print()
print("=" * 60)
print(f"Immagini aggiornate: {changes}")
print(f"File modificato: {FILE}")
print(f"Backup: {backup}")
print("=" * 60)
