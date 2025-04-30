import os
import pickle
import numpy as np
import cv2
from keras_facenet import FaceNet
from mtcnn import MTCNN

KNOWN_FACES_DIR = "known_faces"
ENCODINGS_FILE = "face_encodings.pkl"

# Load FaceNet model & MTCNN detector
embedder = FaceNet()
detector = MTCNN()

def augment_image(image):
    """Apply augmentations like flipping and brightness adjustment."""
    flipped = cv2.flip(image, 1)

    # Increase brightness
    hsv = cv2.cvtColor(image, cv2.COLOR_RGB2HSV)
    hsv[:, :, 2] = np.clip(hsv[:, :, 2] * 1.2, 0, 255)
    bright = cv2.cvtColor(hsv, cv2.COLOR_HSV2RGB)

    return [image, flipped, bright]

def encode_faces():
    known_encodings = []
    known_names = []

    for person_name in os.listdir(KNOWN_FACES_DIR):
        person_path = os.path.join(KNOWN_FACES_DIR, person_name)
        if not os.path.isdir(person_path):
            continue

        for image_name in os.listdir(person_path):
            image_path = os.path.join(person_path, image_name)
            image = cv2.imread(image_path)
            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

            detections = detector.detect_faces(rgb_image)
            if detections:
                x, y, width, height = detections[0]['box']
                face = rgb_image[y:y + height, x:x + width]

                # Augment images
                for img in augment_image(face):
                    encodings = embedder.embeddings([img])
                    if len(encodings) > 0:
                        known_encodings.append(encodings[0])
                        known_names.append(person_name)

    # Save encodings
    with open(ENCODINGS_FILE, "wb") as f:
        pickle.dump((known_encodings, known_names), f)

    print(f"Encoded {len(known_names)} faces and saved to {ENCODINGS_FILE}")

if __name__ == "__main__":
    encode_faces()
