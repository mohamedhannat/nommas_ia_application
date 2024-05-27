import React, { useState, useEffect } from 'react';
import Annotator from "./Annotator";
import Detection from './Yolo_test';
import VideoStream from './VideoStream';
import Predictor from './Predictor';
import WebrtcVideoStream from './WebrtcVideoStream';
import Webrtc from './Webrtc';
import Config from './Config';
import Workspace from './workspace';
import Result from './Result';

function MainArea({ selectedMenu }) {
    const [imageFiles, setImageFiles] = useState([]);
    const [imagesPreview, setImagesPreview] = useState([]);
    const [tags, setTags] = useState([]);
    const [models, setModels] = useState([]);
    const [selectedModelIndex, setSelectedModelIndex] = useState(null);

    const renderContent = () => {
        switch (selectedMenu) {
            case 'train':
                return <Annotator 
                         imageFiles={imageFiles} 
                         setImageFiles={setImageFiles} 
                         imagesPreview={imagesPreview} 
                         setImagesPreview={setImagesPreview}
                         tags={tags}
                         setTags={setTags} />;
            case 'home':
                return selectedModelIndex === null ? (
                    <Workspace models={models} setSelectedModelIndex={setSelectedModelIndex} />
                ) : (
                    <Result model={models[selectedModelIndex]} setSelectedModelIndex={setSelectedModelIndex} />
                );
            case 'settings':
                return <Config models={models} setModels={setModels} />;
            case 'test':
                return <Predictor />;
            case 'stream':
                return <VideoStream />;
            case 'WebrtcStream':
                return <Webrtc />;
            default:
                return <div>Welcome to Roboflow Clone</div>;
        }
    };

    return (
        <div className="flex-grow p-8">
            <div className="w-full max-w-6xl mx-auto">
                {renderContent()}
            </div>
        </div>
    );
}

export default MainArea;
