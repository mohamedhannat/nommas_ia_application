import React from 'react';

const Workspace = ({ models, setSelectedModelIndex }) => {
  return (
    <div className="min-h-screen bg-gray-200 flex flex-col items-center justify-start py-4">
      <div className="w-full max-w-6xl p-4 bg-white rounded-lg shadow">
        <h1 className="text-3xl font-bold mb-6 text-center">Live</h1>
        {models.length === 0 && <p className="text-center text-gray-700">No machines available.</p>}
        {models.map((model, index) => (
          <div 
            key={index} 
            className="block w-full mb-4 cursor-pointer p-4 bg-gray-100 rounded-lg shadow-sm hover:bg-gray-200" 
            onClick={() => setSelectedModelIndex(index)}
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="flex flex-col">
                <span className="font-bold">Machine ID:</span> {model.machineID}
              </div>
              <div className="flex flex-col">
                <span className="font-bold">Model name:</span> {model.modelName}
              </div>
              <div className="flex flex-col">
                <span className="font-bold">Status:</span> {model.status}
                <span className={`h-4 w-4 rounded-full ${model.status === 'Running' ? 'bg-green-500' : 'bg-red-500'}`}></span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold">Confidence:</span> {model.confidence}%
              </div>
              <div className="flex flex-col">
                <span className="font-bold">Camera:</span> {model.camera}
                <span className={`h-4 w-4 rounded-full ${model.cameraConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold">Camera IP:</span> {model.cameraIP}
              </div>
              <div className="flex flex-col">
                <span className="font-bold">PLC IP:</span> {model.plcIP}
                <span className={`h-4 w-4 rounded-full ${model.plcConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold">Input Ports:</span> {model.inputPorts.map((port, i) => (
                  <div key={i}>{port.name} ({port.port})</div>
                ))}
              </div>
              <div className="flex flex-col">
                <span className="font-bold">Output Ports:</span> {model.outputPorts.map((port, i) => (
                  <div key={i}>{port.name} ({port.port})</div>
                ))}
              </div>
              <div className="flex flex-col">
                <span className="font-bold">Alert Type:</span> {model.alertType}
              </div>
              <div className="flex flex-col">
                <span className="font-bold">Alert Status:</span> {model.alertStatus ? 'Active' : 'Inactive'}
              </div>
              <div className="flex flex-col">
                <span className="font-bold">Alert Actions:</span>
                {model.smsNumber && <div>SMS to {model.smsNumber}</div>}
                {model.email && <div>Email to {model.email}</div>}
                {model.buzzer && <div>Buzzer: {model.buzzer}</div>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Workspace;
