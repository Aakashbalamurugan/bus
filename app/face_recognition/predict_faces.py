import pickle
import cv2
import requests
import numpy as np
import base64
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from keras_facenet import FaceNet
from mtcnn import MTCNN
from scipy.spatial.distance import cosine

router = APIRouter()
ENCODINGS_FILE = "app/face_recognition/face_encodings.pkl"

# Load known face encodings
with open(ENCODINGS_FILE, "rb") as f:
    known_encodings, known_names = pickle.load(f)

# Load FaceNet model & MTCNN detector
embedder = FaceNet()
detector = MTCNN()

class ImageRequest(BaseModel):
    image_url: str = None
    image_base64: str = None

def recognize_face_embedding(face_embedding):
    """Compare embeddings using cosine similarity."""
    best_match = None
    best_distance = 1.0  # Lower is better

    for name, known_embedding in zip(known_names, known_encodings):
        distance = cosine(known_embedding, face_embedding)
        if distance < best_distance:
            best_match = name
            best_distance = distance
    
    print(f"Best match: {best_match} ({best_distance:.2f})")
    return best_match if best_distance < 0.95 else "Unknown"  # Adjust threshold if needed

@router.post("/api/recognize_faces")
def recognize_faces(data: ImageRequest):
    if not data.image_url and not data.image_base64:
        raise HTTPException(status_code=400, detail="Provide either image_url or image_base64")

    if data.image_url:
        response = requests.get(data.image_url, stream=True)
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to download image")
        image_array = np.asarray(bytearray(response.content), dtype=np.uint8)
    else:
        try:
            image_data = base64.b64decode(data.image_base64)
            image_array = np.frombuffer(image_data, dtype=np.uint8)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid base64 encoding")

    image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
    if image is None:
        raise HTTPException(status_code=400, detail="Invalid image data")

    rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    
    # Detect faces using MTCNN
    detections = detector.detect_faces(rgb_image)
    if not detections:
        raise HTTPException(status_code=404, detail="No face detected")

    results = []
    for detection in detections:
        x, y, width, height = detection['box']
        face = rgb_image[y:y + height, x:x + width]

        # Get face embedding
        face_embedding = embedder.embeddings([face])[0]
        name = recognize_face_embedding(face_embedding)

        results.append({
            "name": name,
            "bounding_box": {"top": y, "right": x + width, "bottom": y + height, "left": x}
        })

    return {"faces": results}

@router.get("/face")
def check_connection():
    return {"message": "API is working!"}
