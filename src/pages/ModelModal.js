import React, { useState, useEffect } from 'react';

const ModelModal = ({ addModel, closeModal, model }) => {
  const [machineID, setMachineID] = useState('');
  const [productName, setProductName] = useState('');
  const [modelName, setModelName] = useState('');
  const [detectionType, setDetectionType] = useState('');
  const [camera, setCamera] = useState('');
  const [cameraIP, setCameraIP] = useState('');
  const [plcIP, setPlcIP] = useState('');
  const [inputPortCount, setInputPortCount] = useState(0);
  const [outputPortCount, setOutputPortCount] = useState(0);
  const [inputPorts, setInputPorts] = useState([]);
  const [outputPorts, setOutputPorts] = useState([]);
  const [alertType, setAlertType] = useState('');
  const [alertStatus, setAlertStatus] = useState(false);
  const [smsChecked, setSmsChecked] = useState(false);
  const [emailChecked, setEmailChecked] = useState(false);
  const [buzzerChecked, setBuzzerChecked] = useState(false);
  const [smsNumber, setSmsNumber] = useState('');
  const [email, setEmail] = useState('');
  const [buzzer, setBuzzer] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (model) {
      setMachineID(model.machineID);
      setProductName(model.productName);
      setModelName(model.modelName);
      setDetectionType(model.detectionType);
      setCamera(model.camera);
      setCameraIP(model.cameraIP);
      setPlcIP(model.plcIP);
      setInputPortCount(model.inputPorts.length);
      setOutputPortCount(model.outputPorts.length);
      setInputPorts(model.inputPorts);
      setOutputPorts(model.outputPorts);
      setAlertType(model.alertType);
      setAlertStatus(model.alertStatus);
      setSmsChecked(!!model.smsNumber);
      setEmailChecked(!!model.email);
      setBuzzerChecked(!!model.buzzer);
      setSmsNumber(model.smsNumber || '');
      setEmail(model.email || '');
      setBuzzer(model.buzzer || '');
    }
  }, [model]);

  const handlePortChange = (index, type, value, name) => {
    if (type === 'input') {
      const newInputPorts = [...inputPorts];
      newInputPorts[index] = { port: value, name: name };
      setInputPorts(newInputPorts);
    } else {
      const newOutputPorts = [...outputPorts];
      newOutputPorts[index] = { port: value, name: name };
      setOutputPorts(newOutputPorts);
    }
  };

  const validateFields = () => {
    const newErrors = {};
    if (!machineID) newErrors.machineID = 'Machine ID is required';
    if (!productName) newErrors.productName = 'Product Name is required';
    if (!modelName) newErrors.modelName = 'Model Name is required';
    if (!detectionType) newErrors.detectionType = 'Detection Type is required';
    if (!camera) newErrors.camera = 'Camera is required';
    if (!cameraIP.match(/^(\d{1,3}\.){3}\d{1,3}$/)) newErrors.cameraIP = 'Invalid Camera IP';
    if (!plcIP.match(/^(\d{1,3}\.){3}\d{1,3}$/)) newErrors.plcIP = 'Invalid PLC IP';
    if (!alertType) newErrors.alertType = 'Alert Type is required';
    if (alertStatus && (!smsChecked && !emailChecked && !buzzerChecked)) {
      newErrors.alertAction = 'At least one alert action is required';
    }
    if (smsChecked && !smsNumber) newErrors.smsNumber = 'SMS number is required';
    if (emailChecked && !email) newErrors.email = 'Email is required';
    if (buzzerChecked && !buzzer) newErrors.buzzer = 'Buzzer name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateFields()) {
      addModel({
        machineID,
        productName,
        status: 'Running',
        modelName,
        detectionType,
        camera,
        cameraIP,
        plcIP,
        inputPorts,
        outputPorts,
        alertType,
        alertStatus,
        smsNumber: smsChecked ? smsNumber : '',
        email: emailChecked ? email : '',
        buzzer: buzzerChecked ? buzzer : '',
      });
      closeModal(); // Close the modal after adding the model
    }
  };

  const handleInputChange = (setter, errorKey) => (e) => {
    setter(e.target.value);
    setErrors((prevErrors) => {
      const { [errorKey]: _, ...newErrors } = prevErrors;
      return newErrors;
    });
  };

  const handleCheckboxChange = (setter, valueSetter, errorKey) => (e) => {
    setter(e.target.checked);
    if (!e.target.checked) {
      valueSetter('');
    }
    setErrors((prevErrors) => {
      const { [errorKey]: _, ...newErrors } = prevErrors;
      return newErrors;
    });
  };

  const handlePortCountChange = (setter, countSetter, portType) => (e) => {
    const count = Math.max(0, parseInt(e.target.value, 10) || 0);
    countSetter(count);
    setter(new Array(count).fill({ port: '', name: '' }));
    setErrors((prevErrors) => {
      const { [portType]: _, ...newErrors } = prevErrors;
      return newErrors;
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-1/3 max-h-screen overflow-auto">
        <h2 className="text-2xl mb-4">{model ? 'Edit Model' : 'Add New Machine'}</h2>
        <div className="mb-4">
          <label className="block text-gray-700">Machine ID</label>
          <input 
            type="text" 
            className="w-full px-3 py-2 border rounded-lg"
            value={machineID}
            onChange={handleInputChange(setMachineID, 'machineID')}
          />
          {errors.machineID && <p className="text-red-500">{errors.machineID}</p>}
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Product Name</label>
          <select 
            className="w-full px-3 py-2 border rounded-lg"
            value={productName}
            onChange={handleInputChange(setProductName, 'productName')}
          >
            <option value="">Select a product</option>
            <option value="Product 1">Product 1</option>
            <option value="Product 2">Product 2</option>
            <option value="Product 3">Product 3</option>
          </select>
          {errors.productName && <p className="text-red-500">{errors.productName}</p>}
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Model Name</label>
          <select 
            className="w-full px-3 py-2 border rounded-lg"
            value={modelName}
            onChange={handleInputChange(setModelName, 'modelName')}
          >
            <option value="">Select a model</option>
            <option value="Model A">Model A</option>
            <option value="Model B">Model B</option>
            <option value="Model C">Model C</option>
          </select>
          {errors.modelName && <p className="text-red-500">{errors.modelName}</p>}
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Detection Type</label>
          <select 
            className="w-full px-3 py-2 border rounded-lg"
            value={detectionType}
            onChange={handleInputChange(setDetectionType, 'detectionType')}
          >
            <option value="">Select a type</option>
            <option value="Anomaly Detection">Anomaly Detection</option>
            <option value="Counting">Counting</option>
            <option value="Classification">Classification</option>
          </select>
          {errors.detectionType && <p className="text-red-500">{errors.detectionType}</p>}
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Camera</label>
          <select 
            className="w-full px-3 py-2 border rounded-lg"
            value={camera}
            onChange={handleInputChange(setCamera, 'camera')}
          >
            <option value="">Select a camera</option>
            <option value="Camera 1">Camera 1</option>
            <option value="Camera 2">Camera 2</option>
            <option value="Camera 3">Camera 3</option>
          </select>
          {errors.camera && <p className="text-red-500">{errors.camera}</p>}
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Camera IP</label>
          <input 
            type="text" 
            className="w-full px-3 py-2 border rounded-lg"
            value={cameraIP}
            onChange={handleInputChange(setCameraIP, 'cameraIP')}
          />
          {errors.cameraIP && <p className="text-red-500">{errors.cameraIP}</p>}
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">PLC IP</label>
          <input 
            type="text" 
            className="w-full px-3 py-2 border rounded-lg"
            value={plcIP}
            onChange={handleInputChange(setPlcIP, 'plcIP')}
          />
          {errors.plcIP && <p className="text-red-500">{errors.plcIP}</p>}
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Input Port Count</label>
          <input 
            type="number"
            className="w-full px-3 py-2 border rounded-lg"
            value={inputPortCount}
            onChange={handlePortCountChange(setInputPorts, setInputPortCount, 'inputPortCount')}
            min="0"
          />
        </div>
        {inputPorts.map((port, index) => (
          <div key={index} className="mb-4 flex justify-between">
            <input 
              type="text" 
              placeholder={`Input Port ${index + 1}`}
              className="w-1/2 px-3 py-2 border rounded-lg mr-2"
              value={port.port}
              onChange={(e) => handlePortChange(index, 'input', e.target.value, port.name)}
            />
            <input 
              type="text" 
              placeholder="Action Name"
              className="w-1/2 px-3 py-2 border rounded-lg"
              value={port.name}
              onChange={(e) => handlePortChange(index, 'input', port.port, e.target.value)}
            />
          </div>
        ))}
        <div className="mb-4">
          <label className="block text-gray-700">Output Port Count</label>
          <input 
            type="number"
            className="w-full px-3 py-2 border rounded-lg"
            value={outputPortCount}
            onChange={handlePortCountChange(setOutputPorts, setOutputPortCount, 'outputPortCount')}
            min="0"
          />
        </div>
        {outputPorts.map((port, index) => (
          <div key={index} className="mb-4 flex justify-between">
            <input 
              type="text" 
              placeholder={`Output Port ${index + 1}`}
              className="w-1/2 px-3 py-2 border rounded-lg mr-2"
              value={port.port}
              onChange={(e) => handlePortChange(index, 'output', e.target.value, port.name)}
            />
            <input 
              type="text" 
              placeholder="Action Name"
              className="w-1/2 px-3 py-2 border rounded-lg"
              value={port.name}
              onChange={(e) => handlePortChange(index, 'output', port.port, e.target.value)}
            />
          </div>
        ))}
        <div className="mb-4">
          <label className="block text-gray-700">Alert Type</label>
          <select 
            className="w-full px-3 py-2 border rounded-lg"
            value={alertType}
            onChange={handleInputChange(setAlertType, 'alertType')}
          >
            <option value="">Select an alert type</option>
            <option value="Defect Count">Defect Count</option>
            <option value="System Failure">System Failure</option>
          </select>
          {errors.alertType && <p className="text-red-500">{errors.alertType}</p>}
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Alert Actions</label>
          <div className="flex items-center">
            <input 
              type="checkbox" 
              className="mr-2"
              checked={smsChecked}
              onChange={handleCheckboxChange(setSmsChecked, setSmsNumber, 'smsNumber')}
            />
            <span className="mr-2">Send SMS</span>
          </div>
          {smsChecked && (
            <div className="mt-2">
              <input 
                type="text" 
                className="w-full px-3 py-2 border rounded-lg"
                value={smsNumber}
                onChange={handleInputChange(setSmsNumber, 'smsNumber')}
                placeholder="Enter phone number"
              />
              {errors.smsNumber && <p className="text-red-500">{errors.smsNumber}</p>}
            </div>
          )}
          <div className="flex items-center mt-2">
            <input 
              type="checkbox" 
              className="mr-2"
              checked={emailChecked}
              onChange={handleCheckboxChange(setEmailChecked, setEmail, 'email')}
            />
            <span className="mr-2">Send Email</span>
          </div>
          {emailChecked && (
            <div className="mt-2">
              <input 
                type="email" 
                className="w-full px-3 py-2 border rounded-lg"
                value={email}
                onChange={handleInputChange(setEmail, 'email')}
                placeholder="Enter email address"
              />
              {errors.email && <p className="text-red-500">{errors.email}</p>}
            </div>
          )}
          <div className="flex items-center mt-2">
            <input 
              type="checkbox" 
              className="mr-2"
              checked={buzzerChecked}
              onChange={handleCheckboxChange(setBuzzerChecked, setBuzzer, 'buzzer')}
            />
            <span className="mr-2">Activate Buzzer</span>
          </div>
          {buzzerChecked && (
            <div className="mt-2">
              <input 
                type="text" 
                className="w-full px-3 py-2 border rounded-lg"
                value={buzzer}
                onChange={handleInputChange(setBuzzer, 'buzzer')}
                placeholder="Enter buzzer name"
              />
              {errors.buzzer && <p className="text-red-500">{errors.buzzer}</p>}
            </div>
          )}
          {errors.alertAction && <p className="text-red-500">{errors.alertAction}</p>}
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Alert Status</label>
          <input 
            type="checkbox"
            className="mr-2"
            checked={alertStatus}
            onChange={() => setAlertStatus(!alertStatus)}
          />
          Active
        </div>
        <div className="flex justify-end">
          <button 
            className="bg-red-500 text-white py-2 px-4 rounded-lg mr-2"
            onClick={closeModal}
          >
            Cancel
          </button>
          <button 
            className="bg-green-500 text-white py-2 px-4 rounded-lg"
            onClick={handleSubmit}
          >
            {model ? 'Save Changes' : 'Add Machine'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModelModal;
