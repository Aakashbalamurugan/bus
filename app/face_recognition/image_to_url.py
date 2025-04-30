import os
import cloudinary
import cloudinary.uploader
from config import CLOUD_NAME, API_KEY, API_SECRET

cloudinary.config(
  cloud_name=CLOUD_NAME, 
  api_key=API_KEY,       
  api_secret=API_SECRET,  
  secure=True
)

KNOWN_FACES_DIR = "known_faces"
URLS_DIR = "image_urls"

os.makedirs(URLS_DIR, exist_ok=True)

def upload_images():
    for person_name in os.listdir(KNOWN_FACES_DIR):
        person_path = os.path.join(KNOWN_FACES_DIR, person_name)
        if not os.path.isdir(person_path):
            continue

        image_urls = []
        for image_name in os.listdir(person_path):
            image_path = os.path.join(person_path, image_name)

            try:
                response = cloudinary.uploader.upload(
                    image_path,
                    upload_preset="ml_default"  # This is important
                    
                )
                image_urls.append(response['secure_url'])
            except Exception as e:
                print(f"Failed to upload {image_path}: {e}")

        if image_urls:
            txt_file = os.path.join(URLS_DIR, f"{person_name}.txt")
            with open(txt_file, "w") as f:
                f.write(",".join(image_urls))

if __name__ == "__main__":
    upload_images()
