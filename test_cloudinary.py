import os
import requests
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv

load_dotenv()

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

images = {
    "alisson-becker": {
        "normal": "https://images.ctfassets.net/rm6ms1yxue4m/OivRpVQNn3BtONldeytXN/dc90f37a44d7761bd0a578ebda819f30/alisson-app-profile.png",
        "action": "https://images.ctfassets.net/rm6ms1yxue4m/72tsybXHIvAeiyGy25LLmd/e796856f7fdb345328cfedb2005d0752/alisson-becker-action-shot.png"
    }
}

for player, versions in images.items():

    for version, url in versions.items():

        print(f"\nCaricamento: {player} - {version}")

        response = requests.get(url)

        if response.status_code != 200:
            print("ERRORE download:", response.status_code)
            continue

        filename = f"{player}-action" if version == "action" else player

        result = cloudinary.uploader.upload(
            response.content,
            folder="players",
            public_id=filename,
            overwrite=True,
            resource_type="image"
        )

        print("OK!")
        print("URL:", result["secure_url"])
