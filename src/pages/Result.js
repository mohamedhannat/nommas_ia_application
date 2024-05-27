import React, { useEffect, useRef } from 'react';

const Result = ({ model, setSelectedModelIndex }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (model.cameraConnected && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          videoRef.current.srcObject = stream;
        })
        .catch(error => {
          console.error("Error accessing webcam: ", error);
        });
    } else if (!model.cameraConnected && videoRef.current && videoRef.current.srcObject) {
      let tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  }, [model.cameraConnected]);

  if (!model) {
    return <p className="text-center text-gray-700">Machine not found.</p>;
  }

  return (
    <div className="min-h-screen bg-gray-200 flex flex-col items-center justify-start p-4">
      <div className="w-full max-w-4xl bg-white p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-bold">{model.camera}</h2>
          <button
            className="bg-black text-white py-2 px-4 rounded-lg"
            onClick={() => setSelectedModelIndex(null)}
          >
            Live Page
          </button>
        </div>
        <div className="flex flex-col items-center mb-6">
          {model.cameraConnected ? (
            <video ref={videoRef} width="640" height="480" autoPlay className="rounded-lg shadow-lg"></video>
          ) : (
            <div className="text-center text-gray-700">Camera not connected</div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col items-start bg-gray-100 p-4 rounded-lg shadow-inner">
            <div className="flex justify-between w-full">
              <span className="font-bold">Product name:</span>
              <span>{model.productName}</span>
            </div>
            <div className="flex justify-between w-full mt-2">
              <span className="font-bold">Number of Anomalies:</span>
              <span>{model.anomalies}</span>
            </div>
            <div className="flex justify-between w-full mt-2">
              <span className="font-bold">Total Products Detected:</span>
              <span>{model.totalDetected}</span>
            </div>
            <div className="flex justify-between w-full mt-2">
              <span className="font-bold">Good Products:</span>
              <span>{model.goodProducts}</span>
            </div>
          </div>
          <div className="flex flex-col items-start bg-gray-100 p-4 rounded-lg shadow-inner">
            <div className="flex justify-between w-full">
              <span className="font-bold">Camera Connected:</span>
              <span className={`h-4 w-4 rounded-full ${model.cameraConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
            </div>
            <div className="flex justify-between w-full mt-2">
              <span className="font-bold">PLC Connected:</span>
              <span className={`h-4 w-4 rounded-full ${model.plcConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Result;
