// VideoStream.js
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const Box = ({ geometry, label, style }) => (
  <div
    style={{
      ...style,
      position: 'absolute',
      left: `${geometry.x1}px`,
      top: `${geometry.y1}px`,
      width: `${geometry.x2 - geometry.x1}px`,
      height: `${geometry.y2 - geometry.y1}px`,
      border: '2px solid green',
    }}
  >
    <span
      style={{
        position: 'absolute',
        top: '-20px',
        left: '0px',
        backgroundColor: 'green',
        color: 'white',
        padding: '2px 4px',
        borderRadius: '4px',
      }}
    >
      {label}
    </span>
  </div>
);

const VideoStream = () => {
  const videoRef = useRef(null);
  const [detectionGeometry, setDetectionGeometry] = useState([]);

  useEffect(() => {
    let stream = null;

    if (videoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(s => {
          stream = s;
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        })
        .catch(err => {
          console.error("Error accessing the camera: ", err);
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => captureFrameAndSend(), 300); // Send frames every 300ms
    return () => clearInterval(interval);
  }, []);

  const captureFrameAndSend = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL('image/jpeg');

    axios.post(`${process.env.REACT_APP_BACKEND_URL}/process_frame`, {
        image: imageData
      })
      .then((response) => {
        if (response.data.success) {
          setDetectionGeometry(response.data.detections);
        } else {
          setDetectionGeometry([]);
        }
      })
      .catch((error) => {
        console.error("There was an error processing the frame!", error);
        console.error("Error details:", error.response ? error.response.data : error.message);
      });
    }
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="mb-4 text-2xl font-bold">Video Stream</h1>
      <div className="relative" style={{ width: '640px', height: '480px', border: '4px solid gray' }}>
        <video ref={videoRef} className="w-full h-full" />
        {detectionGeometry.map((geometry, index) => (
          <Box
            key={index}
            geometry={geometry}
            label={`${geometry.class} (${geometry.confidence.toFixed(2)})`}
          />
        ))}
      </div>
    </div>
  );
};

export default VideoStream;
