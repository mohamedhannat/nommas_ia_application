import React, { useEffect, useRef, useState } from 'react';

function Loading(){
    return(
        <button disabled type="button" className="py-4 px-6 font-poppins font-medium text-sm text-white bg-green-600 rounded-lg focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 inline-flex items-center">
    <svg aria-hidden="true" role="status" className="inline w-4 h-4 mr-3 text-gray-200 animate-spin dark:text-gray-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="#1C64F2"/>
    </svg>
    Loading...
</button>
        
    );
}

const Box = ({ geometry, label, style }) => (
  <div
    style={{
      ...style,
      position: 'absolute',
      left: `${geometry.x1}px`,
      top: `${geometry.y1}px`,
      width: `${geometry.x2 - geometry.x1}px`,
      height: `${geometry.y2 - geometry.y1}px`,
      border: '2px solid green',
    }}
  >
    <span
      style={{
        position: 'absolute',
        top: '-20px',
        left: '0px',
        backgroundColor: 'green',
        color: 'white',
        padding: '2px 4px',
        borderRadius: '4px',
      }}
    >
      {label}
    </span>
  </div>
);

const Webrtc = () => {
  const localVideoRef = useRef(null);
  const peerConnection = useRef(null);
  const dataChannel = useRef(null);
  const dataChannelInterval = useRef(null);
  const serverUrl = 'http://ec2-13-37-238-204.eu-west-3.compute.amazonaws.com:8080/offer'; // Replace with your server's offer route
  const [isStreaming, setIsStreaming] = useState(false);
  const [detections, setDetections] = useState([]);
  const [timeStart, setTimeStart] = useState(null);
  const [connState, setConnState] = useState(0);
  const localStream = useRef(null); // Store the local stream reference

  const createPeerConnection = () => {
    const config = {
      sdpSemantics: 'unified-plan',
      iceServers: [
        { urls: ['stun:stun.l.google.com:19302', 'stun:stun.cloudflare.com:3478', 'stun:stun.flashdance.cx:3478'] }
      ]
    };

    const pc = new RTCPeerConnection(config);

    pc.addEventListener('icegatheringstatechange', () => {
      console.log(pc.iceGatheringState);
    });

    pc.addEventListener('iceconnectionstatechange', () => {
      console.log(pc.iceConnectionState);
    });

    pc.addEventListener('signalingstatechange', () => {
      console.log(pc.signalingState);
    });

    pc.addEventListener('track', (evt) => {
      // Handle track events if needed
    });

    return pc;
  };

  const negotiate = async (pc) => {
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      await new Promise((resolve) => {
        if (pc.iceGatheringState === 'complete') {
          resolve();
        } else {
          const checkState = () => {
            if (pc.iceGatheringState === 'complete') {
              pc.removeEventListener('icegatheringstatechange', checkState);
              resolve();
            }
          };
          pc.addEventListener('icegatheringstatechange', checkState);
        }
      });

      const response = await fetch(serverUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sdp: pc.localDescription.sdp,
          type: pc.localDescription.type,
          video_transform: 'transform',
        }),
      });

      const answer = await response.json();
      await pc.setRemoteDescription(answer);
    } catch (error) {
      alert(error);
    }
  };

  const currentStamp = () => {
    if (timeStart === null) {
      setTimeStart(new Date().getTime());
      return 0;
    } else {
      return new Date().getTime() - timeStart;
    }
  };

  const startVideoStream = async () => {
    peerConnection.current = createPeerConnection();
		setConnState(1);
    dataChannel.current = peerConnection.current.createDataChannel('chat', { ordered: true });
    dataChannel.current.onclose = () => {
      clearInterval(dataChannelInterval.current);
    };
    dataChannel.current.onopen = () => {
      dataChannelInterval.current = setInterval(() => {
        const message = 'ping ' + currentStamp();
        if (dataChannel.current.readyState === 'open') {
          dataChannel.current.send(message);
        }
      }, 5000);
    };
    dataChannel.current.onmessage = (evt) => {
      if (!evt.data.startsWith('pong')) {
        setDetections(JSON.parse(evt.data));
        console.log(evt.data);
      } else {
        const elapsedMs = currentStamp() - parseInt(evt.data.substring(5), 10);
        console.log(evt.data + ' RTT ' + elapsedMs + ' ms\n');
      }
    };

    const constraints = {
      audio: false,
      video: {
        width: 640,
        height: 480,
        // frameRate: { max: 10 },
      },
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStream.current = stream; // Store the local stream
      stream.getTracks().forEach((track) => {
        peerConnection.current.addTrack(track, stream);
        localVideoRef.current.srcObject = new MediaStream([track]);
      });

      peerConnection.current.addEventListener('icecandidate', event => {
        if (event.candidate) {
          console.log('New ICE candidate: ', event.candidate);
        }
      });

      peerConnection.current.addEventListener('connectionstatechange', event => {
        if (peerConnection.current.connectionState === 'connected') {
          console.log('Connected to the server');
        }
      });

      await negotiate(peerConnection.current);
      setIsStreaming(true);
			setConnState(2);
    } catch (err) {
      alert('Could not acquire media: ' + err);
    }
  };

  const stopVideoStream = () => {
		setConnState(0);
    if (dataChannel.current) {
      clearInterval(dataChannelInterval.current);
      dataChannel.current.close();
    }
    setDetections([]);
    if (peerConnection.current) {
      if (peerConnection.current.getTransceivers) {
        peerConnection.current.getTransceivers().forEach((transceiver) => {
          if (transceiver.stop) {
            transceiver.stop();
          }
        });
      }

      if (peerConnection.current.getSenders) {
        peerConnection.current.getSenders().forEach((sender) => {
          if (sender.track) {
            sender.track.stop();
          }
        });
      }

      setTimeout(() => {
        if (peerConnection.current) {
          peerConnection.current.close();
          peerConnection.current = null;
        }
        setIsStreaming(false);
      }, 500);
    }

    // Stop the local stream tracks explicitly
    if (localStream.current) {
      localStream.current.getTracks().forEach((track) => track.stop());
      localStream.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopVideoStream();
    };
  }, []);

	return(
			<div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="mb-4 text-2xl font-bold">Video Stream</h1>
      <div className="relative" style={{ width: '640px', height: '480px', border: '4px solid gray' }}>
        <video ref={localVideoRef} className="h-full w-full" controls autoPlay muted playsInline />
				{detections.map((geometry, index) => (
						<Box
							key={index}
							geometry={geometry}
							label={`${geometry.class} (${geometry.confidence.toFixed(2)})`}
						/>
					))}
      </div>
			<div className={` py-6 `}>
        { connState==0 ? (
            <button type="button" onClick={startVideoStream} className={`py-4 px-6 font-poppins font-medium text-sm text-white bg-green-600 rounded-lg outline-none hover:bg-green-700 focus:bg-green-700`}>
                Connect
            </button>
            ) : connState==1 ? 
            (
                <Loading />
            ) : 
            (
            <button type="button" onClick={stopVideoStream} className={`py-4 px-6 font-poppins font-medium text-sm text-white bg-red-600 rounded-lg outline-none hover:bg-red-700 focus:bg-red-700`}>
                Disconnect
            </button>
            ) 
        }
        </div>
    </div>
    );
  
};

export default Webrtc;
