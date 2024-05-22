import React, { useState,useEffect } from 'react';
import Annotator from "./Annotator";
// import Matcher from './Matching_Sift_Knn';
import Detection from './Yolo_test';
import VideoStream from './VideoStream';  // Import the VideoStream component
import Predictor from './Predictor';

function MainArea({ selectedMenu }) {
    const [imageFiles, setImageFiles] = useState([]);
    const [imagesPreview, setImagesPreview] = useState([]);
    const [tags, setTags] = useState([]);
    const [currentComponent, setCurrentComponent] = useState(null);
    useEffect(() => {
        setCurrentComponent(renderContent());
    }, [selectedMenu]);

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
            // case 'match':
            //     return <Matcher/>;
            case 'home':
                return <div>Welcome to Nossam App</div>;
            case 'settings':
                return <div>Settings Component</div>;
            case 'test':
                return <Predictor/>;
            case 'stream':
                return <VideoStream />;
    
            default:
                return <div>Welcome to Roboflow Clone</div>;
        }
    };

    return (
        <div className="flex items-center justify-center flex-grow p-8">
            <div className="w-full max-w-5xl mx-auto mt-8">
                {renderContent()}
            </div>
        </div>
    );
}

export default MainArea;
