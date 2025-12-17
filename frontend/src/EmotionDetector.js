import React, { useState, useRef, useEffect } from "react";
import {
  Camera,
  Video,
  VideoOff,
  Smile,
  AlertCircle,
  RefreshCw,
  Zap,
  ZapIcon,
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

  useEffect(() => {
    fetch("http://localhost:5000/health")
      .then((res) =>
        res.ok ? setApiStatus("connected") : setApiStatus("error")
      )
      .catch(() => setApiStatus("error"));
  }, []);

  // webcam

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      });
      videoRef.current.srcObject = stream;
      streamRef.current = stream;
      setIsStreaming(true);
      intervalRef.current = setInterval(captureAndDetect, 2000);
    } catch (error) {
      setError("Camera access denied");
    }
  };

  // Stop webcam:

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    clearInterval(intervalRef.current);
    setIsStreaming(false);
    setEmotion(null);
  };

  const captureAndDetect = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL("image/jpeg");

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/detect-emotion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: imageData,
        }),
      });
      const data = await response.json();

      if (data.success) {
        setEmotion(data);
        setError("");
      } else {
        setError("No face detected");
      }
    } catch (error) {
      setError("Backend connection failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="header">
        <div className="title-section">
          <Smile size={48} />
          <h1>AI Emotion Detector</h1>
        </div>
        <div className="status-container">
          <div className={`status-dot ${apiStatus}`}></div>
          <span>
            {apiStatus === "connected" ? "Backend Connected" : "Disconnected"}
          </span>
        </div>
      </div>
      <div className="grid-container">
        <div className="card">
          <h2>
            <Camera size={24} /> Live Camera Feed
          </h2>
          <div className="video-container">
            <video ref={videoRef} autoPlay playsInline muted />
            {!isStreaming && (
              <div className="no-camera-overlay">
                <videoOff size={64} />
              </div>
            )}
            {loading && (
              <div className="loading-badge">
                <RefreshCw className="spin-icon" /> Analyzing...
              </div>
            )}
          </div>
          <canvas ref={canvasRef} style={{ display: "none" }} />
          <div className="button-container">
            {!isStreaming ? (
              <button
                onClick={startWebcam}
                disabled={apiStatus === "error"}
                className="btn btn-start"
              >
                <video size={20} />
                Start Camera
              </button>
            ) : (
              <button onClick={stopWebcam} className="btn btn-stop">
                <video size={20} />
                Stop Camera
              </button>
            )}
            <button
              onClick={() => window.location.reload()}
              className="btn btn-refresh"
            >
              <RefreshCw size={20} />
            </button>
          </div>
          {error && (
            <div className="error-box">
              <AlertCircle size={20} />
              {error}
            </div>
          )}
        </div>
        <div className="card">
          <h2>
            <Zap size={24} />
            Emotion Analysis
          </h2>
          {emotion ? (
            <>
              <div
                className="emotion-card"
                style={{ borderColor: emotion.color }}
              >
                <div className="emoji">{emotion.emoji}</div>
                <h3 className="emotion-name">{emotion.dominant_emotion}</h3>
                <div
                  className="confidence-value"
                  style={{ color: emotion.color }}
                >
                  {emotion.confidence}%
                </div>
                <p>Confidence Level</p>
                <div
                  className="confidence-value"
                  style={{ color: emotion.color }}
                >
                  {emotion.age}
                </div>
                <div
                  className="confidence-value"
                  style={{ color: emotion.color }}
                >
                  {emotion.gender}
                </div>
              </div>
              <div className="analysis-section">
                <h4>Detailed Analysis</h4>
                {Object.entries(emotion.all_emotions).map(([name, conf]) => (
                  <div key={name} className="emotion-bar">
                    <div className="emotion-bar-header">
                      <span>{name}</span>
                      <span>{conf}%</span>
                    </div>
                    <div className="progress-bar-bg">
                      <div
                        className="progress-bar"
                        style={{
                          width: `${conf}%`,
                          backgroundColor: emotion.color,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="placeholder">
              <Smile size={96} />
              <p>
                {isStreaming
                  ? "Position your face..."
                  : "Start camera to detect emotions"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
