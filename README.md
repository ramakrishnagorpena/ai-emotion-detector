# 🎭 AI Emotion Detector

> 📺 **YouTube Channel:** [@techbeastaihub](https://youtube.com/@techbeastaihub)

The **AI Emotion Detector** is a real-time facial analysis system that uses Deep Learning to detect a person's **emotion, age, and gender** from a live webcam feed. The project consists of a **React** frontend and a **Python Flask** backend powered by **DeepFace** and **OpenCV**.

---

## 🚀 Features

- 📸 Live webcam streaming
- 😄 Emotion recognition (Happy, Sad, Angry, Neutral, etc.)
- 👤 Age estimation
- 🚻 Gender classification
- 📊 Confidence score visualization using animated progress bars
- ⚡ Backend status indicator to show if AI API is active
- 🎨 Modern glassmorphism UI with smooth animations
- 🔌 Fully offline after installation

---

## 🧠 Tech Stack

| Layer       | Technology |
|------------ |-----------|
| Frontend    | React, Lucide Icons, CSS |
| Backend     | Python, Flask |
| AI / ML     | DeepFace, TensorFlow, Keras |
| Computer Vision | OpenCV |
| Communication | REST API |

---

## 📁 Project Structure

```
ai-emotion-detector/
│
├── frontend/              # React user interface
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/               # Flask + DeepFace service
│   ├── app.py
│   ├── requirements.txt
│   └── models/
│
└── README.md
```

---

## 🔧 Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/<your-username>/ai-emotion-detector.git
cd ai-emotion-detector
```

### 2️⃣ Backend Setup (Python + Flask + DeepFace)

📌 Make sure you have Python 3.8+ installed

```bash
cd backend
python -m venv env
```

**Activate the Virtual Environment**

Windows:
```bash
env\Scripts\activate
```

Mac / Linux:
```bash
source env/bin/activate
```

**Install Dependencies**

```bash
pip install -r requirements.txt
```

**Start the Backend Server**

```bash
python app.py
```

The backend will run here:
```
http://127.0.0.1:5000
```

⚠️ Do not close this terminal while using the app.

### 3️⃣ Frontend Setup (React)

Open a new terminal:

```bash
cd frontend
npm install
npm start
```

Your React app will open:
```
http://localhost:3000
```

---

## 🎥 How the System Works

1. User starts webcam from the UI
2. The app captures frames at intervals
3. Frames are sent as Base64 to the Flask backend
4. DeepFace analyzes:
   - Dominant emotion
   - Gender
   - Age estimation
   - Confidence levels
5. Results are returned and visualized on the UI

---

## 🖼 Example Output

```
Emotion: Happy
Age: 24
Gender: Male
Confidence: 97.8%
```

---

## 🧪 Use Cases

- Sentiment-aware applications
- AI-powered analytics dashboards
- Mental health & behavior studies
- Customer feedback systems
- Smart classroom engagement tools

---

## 🛡 Notes

- Works best with good lighting
- Webcam access is required
- First-time model loading may take a few seconds
- No external internet needed after install

---

## 🤝 Contributing

Pull requests and feature enhancements are welcome. You can add new models, improve UI, or extend analysis features.

---

## 🙏 Acknowledgements

- [DeepFace](https://github.com/serengil/deepface) — Facial Recognition Python Library
- TensorFlow / Keras
- OpenCV
- React + Flask communities

---

## 👨‍💻 Author

**Tech Beast AI Hub**  
📺 YouTube: [@techbeastaihub](https://youtube.com/@techbeastaihub)  
🚀 Building AI projects and tutorials for the community

---

⭐ **If this project helped you, don't forget to star the repo!**  
🔔 **Subscribe to [@techbeastaihub](https://youtube.com/@techbeastaihub) for more AI projects and tutorials!**
