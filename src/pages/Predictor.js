import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const Predictor = () => {
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [image, setImage] = useState(null);
  const [imageData, setImageData] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const imageRef = useRef(null);

  useEffect(() => {
    axios.get('http://ec2-13-39-193-246.eu-west-3.compute.amazonaws.com:5000/list-models')
      .then(response => setModels(response.data.models))
      .catch(error => console.error('Error listing models:', error));
  }, []);

  const handleModelChange = (event) => {
    setSelectedModel(event.target.value);
  };

  const handleImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target.result);
        setImageData(event.target.files[0]);
        setPredictions([]);  // Clear previous predictions
        setMessage('');  // Clear previous message
      };
      reader.readAsDataURL(event.target.files[0]);
    }
  };

  const handlePredict = () => {
    if (!selectedModel || !imageData) {
      alert('Please select a model and an image.');
      return;
    }

    setIsLoading(true);
    setMessage('');
    const formData = new FormData();
    formData.append('model', selectedModel);
    formData.append('image', imageData);

    axios.post('http://13.39.193.246:5000/predict', formData)
      .then(response => {
        setPredictions(response.data.detections);
        setMessage(response.data.message || '');
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error making prediction:', error);
        setIsLoading(false);
      });
  };

  const handleDownloadModel = () => {
    axios.get(`http://ec2-13-39-193-246.eu-west-3.compute.amazonaws.com:5000/download-best-model?model_path=${selectedModel}`, { responseType: 'blob' })
      .then(response => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'best_model.pt');
        document.body.appendChild(link);
        link.click();
      })
      .catch(error => console.error('Error downloading model:', error));
  };

  const drawPredictions = () => {
    const canvas = imageRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = image;
    img.onload = () => {
      const maxWidth = 600;
      const maxHeight = 600;
      let ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      predictions.forEach(pred => {
        ctx.beginPath();
        ctx.rect(
          pred.x1 * ratio,
          pred.y1 * ratio,
          (pred.x2 - pred.x1) * ratio,
          (pred.y2 - pred.y1) * ratio
        );
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'red';
        ctx.fillStyle = 'red';
        ctx.stroke();
        ctx.fillText(
          `${pred.class} (${(pred.confidence * 100).toFixed(2)}%)`,
          pred.x1 * ratio,
          pred.y1 * ratio > 10 ? pred.y1 * ratio - 5 : 10
        );
      });
    };
  };

  useEffect(() => {
    if (predictions.length > 0) {
      drawPredictions();
    }
  }, [predictions]);

  return (
    <div className="container p-6 mx-auto bg-white rounded-lg shadow-md">
      <h2 className="mb-6 text-3xl font-bold text-center text-gray-800">Model Prediction</h2>
      <div className="mb-6">
        <label htmlFor="model" className="block mb-2 text-lg font-semibold text-gray-700">Select Model:</label>
        <select id="model" value={selectedModel} onChange={handleModelChange} className="block w-full p-3 mt-1 border border-gray-300 rounded-lg">
          <option value="">Select a model</option>
          {models.map((model, index) => (
            <option key={index} value={model}>{model}</option>
          ))}
        </select>
      </div>
      <div className="mb-6">
        <label htmlFor="image" className="block mb-2 text-lg font-semibold text-gray-700">Upload Image:</label>
        <input type="file" id="image" accept="image/*" onChange={handleImageChange} className="block w-full p-3 mt-1 border border-gray-300 rounded-lg" />
      </div>
      <div className="flex justify-center gap-4 mb-6">
        <button onClick={handlePredict} className="px-6 py-3 text-lg font-semibold text-white bg-blue-500 rounded-lg shadow-lg hover:bg-blue-600">Predict</button>
      
      </div>
      {isLoading && <p className="text-lg font-semibold text-center text-gray-700">Loading...</p>}
      {message && <p className="text-lg font-semibold text-center text-gray-700">{message}</p>}
      {image && (
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <canvas ref={imageRef} className="max-w-full" />
          </div>
        </div>
      )}
      {predictions.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-4 text-xl font-bold text-gray-800">Predictions</h3>
          <ul className="list-disc list-inside">
            {predictions.map((pred, index) => (
              <li key={index} className="mt-2 text-lg">
                <span className="font-semibold">Class:</span> {pred.class}, <span className="font-semibold">Confidence:</span> {(pred.confidence * 100).toFixed(2)}%)
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Predictor;
