import os
import re
import requests
import cloudinary
import cloudinary.uploader

from dotenv import load_dotenv


# =========================================================
# CONFIGURAZIONE
# =========================================================

load_dotenv()

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

BASE_URL = "https://www.liverpoolfc.com"

HEADERS = {
    "User-Agent": "Mozilla/5.0"
}


# =========================================================
# LIVERPOOL 2026/27
# =========================================================

PLAYERS = [
    # PORTIERI
    "alisson-becker",
    "giorgi-mamardashvili",
    "freddie-woodman",
    "vitezslav-jaros",

    # DIFENSORI
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

    # CENTROCAMPISTI
    "wataru-endo",
    "florian-wirtz",
    "dominik-szoboszlai",
    "alexis-mac-allister",
    "ryan-gravenberch",
    "james-mcconnell",
    "trey-nyoni",

    # ATTACCANTI
    "cody-gakpo",
    "federico-chiesa",
    "hugo-ekitike",
    "alexander-isak",
    "victor-munoz",
]


# =========================================================
# TROVA LE IMMAGINI
# =========================================================

def get_images(slug):

    url = f"{BASE_URL}/teams/mens-team/{slug}"

    print()
    print("=" * 70)
    print(slug)
    print("URL:", url)

    try:
        response = requests.get(
            url,
            headers=HEADERS,
            timeout=30
        )

        print("HTTP:", response.status_code)

    except Exception as e:
        print("ERRORE:", e)
        return None, None

    if response.status_code != 200:
        return None, None

    html = response.text

    # Decodifica HTML
    html = html.replace("&amp;", "&")

    # Cerca tutti gli URL delle immagini Contentful
    urls = re.findall(
        r'https://images\.ctfassets\.net/[^"\'<>\\\s]+',
        html
    )

    normal = None
    action = None

    for url in urls:

        url = url.rstrip("\\").rstrip(",").rstrip(".")

        lower = url.lower()

        if "app-profile" in lower:
            normal = url

        elif "action-shot" in lower:
            action = url

    return normal, action


# =========================================================
# DOWNLOAD
# =========================================================

def download_image(url, filename):

    try:

        response = requests.get(
            url,
            headers=HEADERS,
            timeout=30
        )

        response.raise_for_status()

        with open(filename, "wb") as file:
            file.write(response.content)

        return True

    except Exception as e:

        print("ERRORE DOWNLOAD:", e)
        return False


# =========================================================
# CLOUDINARY
# =========================================================

def upload_image(filename, public_id):

    try:

        result = cloudinary.uploader.upload(
            filename,
            folder="players",
            public_id=public_id,
            overwrite=True,
            resource_type="image"
        )

        return result.get("secure_url")

    except Exception as e:

        print("ERRORE CLOUDINARY:", e)
        return None


# =========================================================
# MAIN
# =========================================================

print()
print("=" * 70)
print("LIVERPOOL 2026/27 → CLOUDINARY")
print("=" * 70)

print()
print("Giocatori:", len(PLAYERS))
print()


normal_ok = 0
action_ok = 0


for slug in PLAYERS:

    normal, action = get_images(slug)

    # -----------------------------------------------------
    # FOTO NORMALE
    # -----------------------------------------------------

    if normal:

        print()
        print("NORMAL:")
        print(normal)

        filename = f"{slug}.webp"

        if download_image(normal, filename):

            print("Download NORMAL OK")

            result = upload_image(
                filename,
                slug
            )

            if result:

                print("UPLOAD NORMAL OK")
                print(result)

                normal_ok += 1

            if os.path.exists(filename):
                os.remove(filename)

    else:

        print("NORMAL: NON TROVATA")


    # -----------------------------------------------------
    # FOTO ACTION
    # -----------------------------------------------------

    if action:

        print()
        print("ACTION:")
        print(action)

        filename = f"{slug}-action.webp"

        if download_image(action, filename):

            print("Download ACTION OK")

            result = upload_image(
                filename,
                f"{slug}-action"
            )

            if result:

                print("UPLOAD ACTION OK")
                print(result)

                action_ok += 1

            if os.path.exists(filename):
                os.remove(filename)

    else:

        print("ACTION: NON TROVATA")


# =========================================================
# RISULTATO
# =========================================================

print()
print()
print("=" * 70)
print("RISULTATO FINALE")
print("=" * 70)

print()
print(f"NORMAL caricate: {normal_ok}/{len(PLAYERS)}")
print(f"ACTION caricate: {action_ok}/{len(PLAYERS)}")

print()
print("=" * 70)
