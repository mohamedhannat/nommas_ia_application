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
    axios.get('http://13.39.193.246:5000/list-models')
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
    axios.get(`http://13.39.193.246:5000/download-best-model?model_path=${selectedModel}`, { responseType: 'blob' })
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
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      predictions.forEach(pred => {
        ctx.beginPath();
        ctx.rect(pred.x1, pred.y1, pred.x2 - pred.x1, pred.y2 - pred.y1);
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'red';
        ctx.fillStyle = 'red';
        ctx.stroke();
        ctx.fillText(
          `${pred.class} (${(pred.confidence * 100).toFixed(2)}%)`,
          pred.x1,
          pred.y1 > 10 ? pred.y1 - 5 : 10
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
    <div className="container p-4 mx-auto predictor">
      <h2 className="mb-4 text-2xl font-bold">Model Prediction</h2>
      <div className="mb-4">
        <label htmlFor="model" className="block mb-2 font-bold text-gray-700">Select Model:</label>
        <select id="model" value={selectedModel} onChange={handleModelChange} className="block w-full p-2 mt-1 border border-gray-300 rounded">
          <option value="">Select a model</option>
          {models.map((model, index) => (
            <option key={index} value={model}>{model}</option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label htmlFor="image" className="block mb-2 font-bold text-gray-700">Upload Image:</label>
        <input type="file" id="image" accept="image/*" onChange={handleImageChange} className="block w-full p-2 mt-1 border border-gray-300 rounded" />
      </div>
      <div className="flex gap-4 mb-4">
        <button onClick={handlePredict} className="px-4 py-2 text-white transition duration-300 bg-blue-500 rounded shadow-lg hover:bg-blue-600">Predict</button>
        <button onClick={handleDownloadModel} className="px-4 py-2 text-white transition duration-300 bg-green-500 rounded shadow-lg hover:bg-green-600">Download Best Model</button>
      </div>
      {isLoading && <p>Loading...</p>}
      {message && <p>{message}</p>}
      {image && (
        <div className="relative">
          <img src={image} alt="Selected" className="h-auto max-w-full" />
          <canvas ref={imageRef} className="absolute top-0 left-0" />
        </div>
      )}
      {predictions.length > 0 && (
        <div>
          <h3 className="mt-4 text-xl font-bold">Predictions</h3>
          <ul>
            {predictions.map((pred, index) => (
              <li key={index} className="mt-2">
                Class: {pred.class}, Confidence: {(pred.confidence * 100).toFixed(2)}%, BBox: ({pred.x1}, {pred.y1}, {pred.x2}, {pred.y2})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Predictor;
