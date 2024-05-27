import React from 'react';

const CameraFeed = ({ cameraIP }) => {
  return (
    <div className="flex justify-center items-center">
      <video src={`http://${cameraIP}/video`} autoPlay controls className="rounded-lg shadow-lg"></video>
    </div>
  );
};

export default CameraFeed;
