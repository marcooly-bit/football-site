import requests
from bs4 import BeautifulSoup

URL = "https://www.liverpoolfc.com/team/first-team/player/alisson-becker"

headers = {
    "User-Agent": "Mozilla/5.0"
}

response = requests.get(URL, headers=headers)

print("Status:", response.status_code)

soup = BeautifulSoup(response.text, "html.parser")

images = []

for img in soup.find_all("img"):
    src = img.get("src")
    alt = img.get("alt", "")

    if src:
        images.append((alt, src))

print("\nIMMAGINI TROVATE:\n")

for alt, src in images:
    print("ALT:", alt)
    print("URL:", src)
    print("-" * 80)
