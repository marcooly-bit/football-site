import re
import unicodedata
from pathlib import Path


ROOT = Path(".")


def slugify(text):
    """
    Trasforma il nome del giocatore nel nome del file HTML.
    Esempio:
    Kenan Yıldız -> kenan-yildiz.html
    Kylian Mbappé -> kylian-mbappe.html
    """
    text = unicodedata.normalize("NFKD", text)
    text = "".join(
        char for char in text
        if not unicodedata.combining(char)
    )

    text = text.lower()
    text = text.replace("ß", "ss")

    # Apostrofi e caratteri non alfanumerici diventano -
    text = re.sub(r"[^a-z0-9]+", "-", text)

    return text.strip("-")


# Cerca tutte le pagine delle squadre 2026/27
team_files = list(ROOT.glob("*26-27.html"))

print(f"Trovate {len(team_files)} pagine squadra.\n")


for team_file in team_files:

    html = team_file.read_text(encoding="utf-8")
    original = html

    def add_player_link(match):

        block = match.group(0)

        # Se il giocatore ha già un link, non modificarlo
        if "<a " in block:
            return block

        # Cerca il nome dentro <strong>
        name_match = re.search(
            r"<strong>\s*([^<]+?)\s*</strong>",
            block
        )

        if not name_match:
            return block

        player_name = name_match.group(1).strip()

        # Crea automaticamente il nome della pagina
        filename = slugify(player_name) + ".html"

        old = name_match.group(0)

        new = (
            f'<strong>'
            f'<a href="{filename}">{player_name}</a>'
            f'</strong>'
        )

        return block.replace(old, new, 1)


    # Modifica SOLO le schede giocatore della rosa
    html = re.sub(
        r'<div class="player-info">.*?</div>',
        add_player_link,
        html,
        flags=re.DOTALL
    )


    # Salva solo i file realmente modificati
    if html != original:

        team_file.write_text(
            html,
            encoding="utf-8"
        )

        print(f"✓ AGGIORNATA: {team_file.name}")

    else:

        print(f"– Nessuna modifica: {team_file.name}")


print("\n================================")
print("Operazione completata.")
print("================================")