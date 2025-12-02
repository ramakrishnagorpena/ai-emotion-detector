from flask import Flask, request, jsonify
from flask_cors import CORS
from deepface import DeepFace
import cv2
import numpy as np
import base64
from PIL import Image
import io

app = Flask(__name__)
CORS(app)

# Emotion emoji mapping for better UX
EMOTION_EMOJIS = {
    'happy': '😊',
    'sad': '😢',
    'angry': '😠',
    'surprise': '😮',
    'fear': '😨',
    'disgust': '🤢',
    'neutral': '😐'
}

# Color mapping for UI
EMOTION_COLORS = {
    'happy': '#4CAF50',
    'sad': '#2196F3',
    'angry': '#F44336',
    'surprise': '#FF9800',
    'fear': '#9C27B0',
    'disgust': '#795548',
    'neutral': '#9E9E9E'
}

@app.route('/health', methods=['GET'])
def health_check():
    """Check if API is running"""
    return jsonify({"status": "running", "message": "Emotion Detector API is active!"})

@app.route('/detect-emotion', methods=['POST'])
def detect_emotion():
    """
    Detect emotion from base64 encoded image
    Expects JSON: {"image": "base64_string"}
    """
    try:
        data = request.get_json()
        
        if not data or 'image' not in data:
            return jsonify({"error": "No image provided"}), 400
        
        # Decode base64 image
        image_data = data['image'].split(',')[1] if ',' in data['image'] else data['image']
        image_bytes = base64.b64decode(image_data)
        
        # Convert to numpy array
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            return jsonify({"error": "Invalid image format"}), 400
        
        # Analyze emotion using DeepFace
        result = DeepFace.analyze(
            img, 
            actions=['age', 'gender', 'emotion'],
            enforce_detection=False, 
            detector_backend='opencv',
            silent=True
        )
        
        # Extract emotion data
        if isinstance(result, list):
            result = result[0]
        
        age = result['age']
        gender = result['gender']
        emotions = result['emotion']
        dominant_emotion = result['dominant_emotion']
        
        # Sort emotions by confidence
        sorted_emotions = sorted(emotions.items(), key=lambda x: x[1], reverse=True)
        
        response = {
            "success": True,
            "dominant_emotion": dominant_emotion,
            "emoji": EMOTION_EMOJIS.get(dominant_emotion, '🤔'),
            "color": EMOTION_COLORS.get(dominant_emotion, '#000000'),
            "confidence": round(emotions[dominant_emotion], 2),
            "all_emotions": {k: round(v, 2) for k, v in sorted_emotions},
            "age": age,
            "gender": gender,
            "face_detected": True
        }
        
        return jsonify(response)
    
    except ValueError as ve:
        # No face detected
        return jsonify({
            "success": False,
            "error": "No face detected",
            "face_detected": False,
            "message": "Please ensure your face is visible in the camera"
        }), 200
    
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "face_detected": False
        }), 500

@app.route('/test', methods=['GET'])
def test():
    """Test endpoint with sample response"""
    return jsonify({
        "success": True,
        "dominant_emotion": "happy",
        "emoji": "😊",
        "color": "#4CAF50",
        "confidence": 85.5,
        "all_emotions": {
            "happy": 85.5,
            "neutral": 10.2,
            "surprise": 4.3
        },
        "face_detected": True,
        "message": "This is a test response"
    })

if __name__ == '__main__':
    print("🚀 Emotion Detection API Starting...")
    print("📍 Running on http://localhost:5001")
    print("✅ Health check: http://localhost:5001/health")
    app.run(debug=True, port=5001, threaded=True)