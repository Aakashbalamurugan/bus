import os
import pickle
import cv2
import numpy as np
import requests
from keras_facenet import FaceNet
from mtcnn import MTCNN

URLS_DIR = "image_urls"
ENCODINGS_FILE = "face_encodings.pkl"

embedder = FaceNet()
detector = MTCNN()

def url_to_image(url):
    resp = requests.get(url)
    img_arr = np.asarray(bytearray(resp.content), dtype=np.uint8)
    image = cv2.imdecode(img_arr, cv2.IMREAD_COLOR)
    return cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

def augment_image(image):
    flipped = cv2.flip(image, 1)
    hsv = cv2.cvtColor(image, cv2.COLOR_RGB2HSV)
    hsv[:, :, 2] = np.clip(hsv[:, :, 2] * 1.2, 0, 255)
    bright = cv2.cvtColor(hsv, cv2.COLOR_HSV2RGB)
    return [image, flipped, bright]

def train_from_urls():
    known_encodings = []
    known_names = []

    for txt_file in os.listdir(URLS_DIR):
        if not txt_file.endswith(".txt"):
            continue

        person_name = txt_file.replace(".txt", "")
        with open(os.path.join(URLS_DIR, txt_file), "r") as f:
            urls = f.read().strip().split(",")

        for url in urls:
            try:
                rgb_image = url_to_image(url)
                detections = detector.detect_faces(rgb_image)
                if detections:
                    x, y, width, height = detections[0]['box']
                    face = rgb_image[y:y + height, x:x + width]

                    for img in augment_image(face):
                        encodings = embedder.embeddings([img])
                        if len(encodings) > 0:
                            known_encodings.append(encodings[0])
                            known_names.append(person_name)
            except Exception as e:
                print(f"Failed to process {url}: {e}")

    with open(ENCODINGS_FILE, "wb") as f:
        pickle.dump((known_encodings, known_names), f)

    print(f"Encoded {len(known_names)} faces and saved to {ENCODINGS_FILE}")

if __name__ == "__main__":
    train_from_urls()
