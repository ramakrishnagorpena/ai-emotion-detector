import os
# Memory optimization BEFORE imports
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['TF_FORCE_GPU_ALLOW_GROWTH'] = 'true'
os.environ['CUDA_VISIBLE_DEVICES'] = '-1'  # Force CPU for stability

from flask import Flask, request, jsonify
from flask_cors import CORS
from deepface import DeepFace
import cv2, numpy as np, base64
import time

app = Flask(__name__)
CORS(app)

EMOTION_EMOJIS = {
    'happy':'😊', 'sad': '😢', 'angry': '😠',
    'surprise':'😮', 'fear':'😨', 'disgust':'🤢', 'neutral':'😐'
}

EMOTION_COLORS = {
    'happy': '#4CAF50', 'sad': '#2196F3', 'angry': '#F44336',
    'surprise': '#FF9800', 'fear': '#9C27B0', 'disgust': '#795548', 'neutral': '#9E9E9E'
}

def preload_models():
    """Load all models at startup to avoid crashes during requests"""
    print("\n🔄 Starting model preloading...")
    print("⚠️  This will take 1-2 minutes on first run...\n")
    
    try:
        # Create a small dummy image
        dummy_img = np.zeros((224, 224, 3), dtype=np.uint8)
        
        # Load each model individually with progress
        models_to_load = ['age', 'gender', 'race', 'emotion']
        
        for i, action in enumerate(models_to_load, 1):
            print(f"[{i}/4] Loading {action} model...", end=" ")
            start = time.time()
            
            try:
                DeepFace.analyze(
                    dummy_img, 
                    actions=[action],
                    enforce_detection=False,
                    silent=True
                )
                elapsed = time.time() - start
                print(f"✅ ({elapsed:.1f}s)")
            except Exception as e:
                print(f"⚠️  Warning: {e}")
        
        # Test full analysis
        print("\n🧪 Testing full analysis...", end=" ")
        DeepFace.analyze(
            dummy_img,
            actions=['age', 'gender', 'race', 'emotion'],
            enforce_detection=False,
            silent=True
        )
        print("✅ All models ready!\n")
        
    except Exception as e:
        print(f"\n⚠️  Model loading error: {e}")
        print("API will still start but may be slower on first request.\n")

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status":"running", "message":"AI is awake with all models!"})

@app.route('/detect-emotion', methods=['POST'])
def detect_emotion():
    try:
        data = request.get_json()
        if not data or 'image' not in data:
            return jsonify({"success":False, "message": "No image provided"}), 400

        # Decode image
        image_data = data['image'].split(',')[1] if ',' in data['image'] else data['image']
        image_bytes = base64.b64decode(image_data)
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            return jsonify({"success":False, "message": "Invalid image"}), 400

        # Analyze with ALL 4 models
        result = DeepFace.analyze(
            img, 
            actions=['age', 'gender', 'race', 'emotion'],
            enforce_detection=False, 
            detector_backend='opencv',
            silent=True
        )

        # Extract results
        analysis = result[0] if isinstance(result, list) else result
        emotions = analysis['emotion']
        dominant = analysis['dominant_emotion']

        return jsonify({
            "success": True,
            
            # Emotion data
            "dominant_emotion": dominant,
            "emoji": EMOTION_EMOJIS.get(dominant, '😐'),
            "color": EMOTION_COLORS.get(dominant, '#9E9E9E'),
            "confidence": round(float(emotions[dominant]), 2),
            "all_emotions": {k: round(float(v), 2) for k, v in sorted(emotions.items(), key=lambda x: x[1], reverse=True)},
            
            # Additional face data
            "age": int(analysis['age']),
            "gender": analysis['dominant_gender'],
            "race": analysis['dominant_race'],
            
            "face_detected": True
        })
    
    except Exception as e:
        print("🔥 ERROR:", repr(e))
        return jsonify({"success": False, "message": str(e)}), 500

if __name__ == '__main__':
    print("=" * 60)
    print("🚀 AI EMOTION DETECTOR - FULL ANALYSIS MODE")
    print("=" * 60)
    
    # Preload all models BEFORE starting server
    preload_models()
    
    print("📍 Server starting at http://localhost:5000")
    print("=" * 60)
    
    app.run(debug=True, port=5000, threaded=True, use_reloader=False)  # use_reloader=False prevents double loading