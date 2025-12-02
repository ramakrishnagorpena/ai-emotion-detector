import React, { useState, useRef, useEffect } from "react";
import {
  Camera,
  Video,
  VideoOff,
  Smile,
  AlertCircle,
  RefreshCw,
  Zap,
} from "lucide-react";
import "./EmotionDetector.css";

export default function EmotionDetector() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [emotion, setEmotion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [apiStatus, setApiStatus] = useState("checking");

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);

  // Check API health on component mount
  useEffect(() => {
    checkApiHealth();
  }, []);

  // Check if Flask backend is running
  const checkApiHealth = async () => {
    try {
      const response = await fetch("http://localhost:5001/health");
      if (response.ok) {
        setApiStatus("connected");
        setError("");
      } else {
        setApiStatus("error");
        setError("Backend not responding");
      }
    } catch (err) {
      setApiStatus("error");
      setError("Backend not running. Start Flask server first!");
    }
  };

  // Start webcam stream
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
        setError("");

        // Start emotion detection every 2 seconds
        intervalRef.current = setInterval(captureAndDetect, 2000);
      }
    } catch (err) {
      setError("Camera access denied. Please allow camera permissions.");
      console.error("Camera error:", err);
    }
  };

  // Stop webcam stream
  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsStreaming(false);
    setEmotion(null);
  };

  // Capture frame and send to backend for emotion detection
  const captureAndDetect = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    // Draw current video frame to canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to base64 image
    const imageData = canvas.toDataURL("image/jpeg");

    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:5001/detect-emotion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageData }),
      });

      const data = await response.json();

      if (data.success && data.face_detected) {
        setEmotion(data);
        setError("");
      } else {
        setError(data.message || "No face detected");
        setEmotion(null);
      }
    } catch (err) {
      console.error("Detection error:", err);
      setError("Failed to detect emotion. Check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      {/* Header Section */}
      <div className="header">
        <div className="title-section">
          <Smile size={48} className="title-icon" />
          <h1 className="main-title">AI Emotion Detector</h1>
        </div>
        <p className="subtitle">
          Real-time facial emotion recognition powered by Deep Learning
        </p>

        {/* API Status Indicator */}
        <div className="status-container">
          <div className={`status-dot ${apiStatus}`}></div>
          <span className="status-text">
            {apiStatus === "connected"
              ? "Backend Connected"
              : apiStatus === "error"
              ? "Backend Disconnected"
              : "Checking..."}
          </span>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid-container">
        {/* Video Feed Card */}
        <div className="card">
          <h2 className="card-header">
            <Camera size={24} />
            Live Camera Feed
          </h2>

          {/* Video Container */}
          <div className="video-container">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="video-feed"
            />

            {/* No Camera Overlay */}
            {!isStreaming && (
              <div className="no-camera-overlay">
                <VideoOff size={64} color="#666" />
              </div>
            )}

            {/* Loading Badge */}
            {loading && (
              <div className="loading-badge">
                <RefreshCw size={16} className="spin-icon" />
                Analyzing...
              </div>
            )}
          </div>

          {/* Hidden Canvas for Frame Capture */}
          <canvas ref={canvasRef} style={{ display: "none" }} />

          {/* Control Buttons */}
          <div className="button-container">
            {!isStreaming ? (
              <button
                onClick={startWebcam}
                disabled={apiStatus === "error"}
                className="btn btn-start"
              >
                <Video size={20} />
                Start Camera
              </button>
            ) : (
              <button onClick={stopWebcam} className="btn btn-stop">
                <VideoOff size={20} />
                Stop Camera
              </button>
            )}
            <button
              onClick={checkApiHealth}
              className="btn btn-refresh"
              title="Refresh Connection"
            >
              <RefreshCw size={20} />
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-box">
              <AlertCircle size={20} className="error-icon" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Emotion Results Card */}
        <div className="card">
          <h2 className="card-header">
            <Zap size={24} />
            Emotion Analysis
          </h2>

          {emotion ? (
            <div className="results-container">
              {/* Dominant Emotion Display */}
              <div
                className="emotion-card"
                style={{ borderColor: emotion.color + "cc" }}
              >
                <div className="emoji">{emotion.emoji}</div>
                <h3 className="emotion-name">{emotion.dominant_emotion}</h3>
                <ul className="meta-list">
                  <li>
                    <span className="meta-label">Age</span>
                    <span>{emotion.age}</span>
                  </li>

                  <li>
                    <span className="meta-label">Gender</span>
                    <span>
                      {emotion.gender
                        ? Object.keys(emotion.gender)[0]
                        : "Unknown"}
                    </span>
                  </li>
                </ul>

                <div
                  className="confidence-value"
                  style={{ color: emotion.color }}
                >
                  {emotion.confidence}%
                </div>
                <p className="confidence-label">Confidence Level</p>
              </div>

              {/* Detailed Emotion Breakdown */}
              <div className="analysis-section">
                <h4 className="analysis-title">Detailed Analysis</h4>
                {Object.entries(emotion.all_emotions).map(
                  ([emotionName, confidence]) => (
                    <div key={emotionName} className="emotion-bar">
                      <div className="emotion-bar-header">
                        <span className="emotion-label">{emotionName}</span>
                        <span className="emotion-value">{confidence}%</span>
                      </div>
                      <div className="progress-bar-bg">
                        <div
                          className="progress-bar"
                          style={{
                            width: `${Math.min(confidence, 100)}%`,
                            backgroundColor: emotion.color,
                          }}
                        ></div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          ) : (
            // Placeholder when no emotion detected
            <div className="placeholder">
              <Smile size={96} color="#666" />
              <p className="placeholder-text">
                {isStreaming
                  ? "Position your face in the camera..."
                  : "Start your camera to begin emotion detection"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="footer">
        <p>Powered by DeepFace & OpenCV | Real-time AI Analysis</p>
        <p>Created by Ramakrishna | TechBeastAiHub</p>
      </div>
    </div>
  );
}
