import React from 'react';

const ConfirmationModal = ({ message, confirmAction, cancelAction }) => {
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
        <h2 className="text-2xl mb-4">Confirmation</h2>
        <p className="mb-4">{message}</p>
        <div className="flex justify-end">
          <button 
            className="bg-red-500 text-white py-2 px-4 rounded-lg mr-2"
            onClick={cancelAction}
          >
            Cancel
          </button>
          <button 
            className="bg-green-500 text-white py-2 px-4 rounded-lg"
            onClick={confirmAction}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
