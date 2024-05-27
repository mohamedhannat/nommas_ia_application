import React, { useState } from 'react';
import ModelModal from './ModelModal';
import ConfirmationModal from './ConfirmationModal';

// Variable to store the media stream for the camera
let cameraStream = null;

// Dummy functions to simulate turning the camera and PLC on/off
const turnCameraOn = () => {
  console.log(`Turning on camera`);
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      cameraStream = stream;
      // You can now display the stream on a video element if needed
    })
    .catch(error => {
      console.error('Error accessing camera:', error);
    });
};

const turnCameraOff = () => {
  console.log(`Turning off camera`);
  if (cameraStream) {
    const tracks = cameraStream.getTracks();
    tracks.forEach(track => track.stop());
    cameraStream = null;
  }
};

const turnPLCOn = (plcIP) => {
  console.log(`Turning on PLC with IP: ${plcIP}`);
  // Add your code here to turn on the PLC
};

const turnPLCOff = (plcIP) => {
  console.log(`Turning off PLC with IP: ${plcIP}`);
  // Add your code here to turn off the PLC
};

const Config = ({ models, setModels }) => {
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [confirmationAction, setConfirmationAction] = useState(null);
  const [selectedModelIndex, setSelectedModelIndex] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const addModel = (newModel) => {
    if (isEditMode) {
      const updatedModels = models.map((model, index) =>
        index === selectedModelIndex ? newModel : model
      );
      setModels(updatedModels);
      setIsEditMode(false);
    } else {
      setModels([newModel, ...models]);
    }
    setIsModelModalOpen(false);
  };

  const confirmToggleModelStatus = (index) => {
    setSelectedModelIndex(index);
    setConfirmationMessage(`Are you sure you want to ${models[index].status === 'Running' ? 'stop' : 'start'} this model?`);
    setConfirmationAction(() => () => toggleModelStatus(index));
    setIsConfirmationModalOpen(true);
  };

  const toggleModelStatus = (index) => {
    const updatedModels = models.map((model, i) => {
      if (i === index) {
        return {
          ...model,
          status: model.status === 'Running' ? 'Stopped' : 'Running',
        };
      }
      return model;
    });
    setModels(updatedModels);
    setIsConfirmationModalOpen(false);
  };

  const toggleConnection = (index, type) => {
    const updatedModels = models.map((model, i) => {
      if (i === index) {
        const newConnectionState = !model[type];
        if (type === 'cameraConnected') {
          if (newConnectionState) {
            turnCameraOn();
          } else {
            turnCameraOff();
          }
        } else if (type === 'plcConnected') {
          if (newConnectionState) {
            turnPLCOn(model.plcIP);
          } else {
            turnPLCOff(model.plcIP);
          }
        }
        return {
          ...model,
          [type]: newConnectionState,
        };
      }
      return model;
    });
    setModels(updatedModels);
  };

  const openEditModal = (index) => {
    setSelectedModelIndex(index);
    setIsEditMode(true);
    setIsModelModalOpen(true);
  };

  const confirmDeleteModel = (index) => {
    setSelectedModelIndex(index);
    setConfirmationMessage(`Are you sure you want to delete the machine with ID: ${models[index].machineID}?`);
    setConfirmationAction(() => () => deleteModel(index));
    setIsConfirmationModalOpen(true);
  };

  const deleteModel = (index) => {
    const updatedModels = models.filter((_, i) => i !== index);
    setModels(updatedModels);
    setIsConfirmationModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-200 flex flex-col items-center">
      <div className="w-3/4 p-4 rounded-lg mt-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">Machine Configurations</h1>
          <button 
            className="bg-green-500 text-white py-2 px-4 rounded-lg"
            onClick={() => setIsModelModalOpen(true)}
          >
            Add Machine
          </button>
        </div>
        {models.length === 0 && <p className="text-center text-gray-700">No Machine available. Click "Add Machine" to get started.</p>}
        {models.map((model, index) => (
          <div key={index} className="flex flex-col justify-between items-center p-4 bg-white rounded-lg shadow mb-4 w-full overflow-auto">
            <div className="flex justify-between w-full">
              <div className="flex items-center">
                <span className="mr-2 font-bold">Machine ID:</span> {model.machineID}
              </div>
              <div className="flex items-center cursor-pointer" onClick={() => confirmToggleModelStatus(index)}>
                <span className="mr-2">{model.status}</span>
                <span className={`h-4 w-4 rounded-full ${model.status === 'Running' ? 'bg-green-500' : 'bg-red-500'}`}></span>
              </div>
              <button 
                className={`py-1 px-3 rounded-lg ${model.status === 'Running' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}
                onClick={() => confirmToggleModelStatus(index)}
              >
                {model.status === 'Running' ? 'Stop Model' : 'Start Model'}
              </button>
              <button 
                className="bg-blue-500 text-white py-1 px-3 rounded-lg ml-2"
                onClick={() => openEditModal(index)}
              >
                Edit
              </button>
              <button 
                className="bg-red-500 text-white py-1 px-3 rounded-lg ml-2"
                onClick={() => confirmDeleteModel(index)}
              >
                Delete
              </button>
            </div>
            <div className="flex justify-between w-full mt-2">
              <div className="flex items-center">
                <span className="mr-2 font-bold">Product Name:</span> {model.productName}
              </div>
              <div className="flex items-center">
                <span className="mr-2 font-bold">Model Name:</span> {model.modelName}
              </div>
              <div className="flex items-center">
                <span className="mr-2 font-bold">Detection Type:</span> {model.detectionType}
              </div>
            </div>
            <div className="flex justify-between w-full mt-2">
              <div className="flex items-center">
                <span className="mr-2 font-bold">Camera:</span> {model.camera}
              </div>
              <div className="flex items-center">
                <span className="mr-2 font-bold">Camera IP:</span> {model.cameraIP}
              </div>
              <div className="flex items-center">
                <span className="mr-2 font-bold">PLC IP:</span> {model.plcIP}
              </div>
            </div>
            <div className="flex justify-between w-full mt-2 overflow-auto">
              <div className="flex items-center">
                <span className="mr-2 font-bold">Input Ports:</span> {model.inputPorts.map((port, i) => (
                  <div key={i} className="mr-2">{port.name} ({port.port})</div>
                ))}
              </div>
              <div className="flex items-center">
                <span className="mr-2 font-bold">Output Ports:</span> {model.outputPorts.map((port, i) => (
                  <div key={i} className="mr-2">{port.name} ({port.port})</div>
                ))}
              </div>
            </div>
            <div className="flex justify-between w-full mt-2">
              <div className="flex items-center">
                <span className="mr-2 font-bold">Alert Type:</span> {model.alertType}
              </div>
              <div className="flex items-center">
                <span className="mr-2 font-bold">Alert Status:</span> {model.alertStatus ? 'Active' : 'Inactive'}
              </div>
            </div>
            <div className="flex justify-between w-full mt-2">
              <div className="flex items-center">
                <span className="mr-2 font-bold">Alert Actions:</span>
                {model.smsNumber && <span className="mr-2">SMS to {model.smsNumber}</span>}
                {model.email && <span className="mr-2">Email to {model.email}</span>}
                {model.buzzer && <span className="mr-2">Buzzer: {model.buzzer}</span>}
              </div>
            </div>
            <div className="flex justify-between w-full mt-2">
              <button
                className={`py-1 px-3 rounded-lg ${model.cameraConnected ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}
                onClick={() => toggleConnection(index, 'cameraConnected')}
              >
                {model.cameraConnected ? 'Disconnect Camera' : 'Connect Camera'}
              </button>
              <button
                className={`py-1 px-3 rounded-lg ${model.plcConnected ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}
                onClick={() => toggleConnection(index, 'plcConnected')}
              >
                {model.plcConnected ? 'Disconnect PLC' : 'Connect PLC'}
              </button>
            </div>
          </div>
        ))}
      </div>
      {isModelModalOpen && (
        <ModelModal 
          addModel={addModel} 
          closeModal={() => {
            setIsModelModalOpen(false);
            setIsEditMode(false);
          }} 
          model={isEditMode ? models[selectedModelIndex] : null}
        />
      )}
      {isConfirmationModalOpen && (
        <ConfirmationModal 
          message={confirmationMessage}
          confirmAction={confirmationAction}
          cancelAction={() => setIsConfirmationModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Config;
