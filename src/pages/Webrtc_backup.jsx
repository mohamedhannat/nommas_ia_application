import React, { useEffect, useRef, useState } from 'react';

const Webrtc = () => {
  const localVideoRef = useRef(null);
  const peerConnection = useRef(null);
  const dataChannel = useRef(null);
  const dataChannelInterval = useRef(null);
	const serverUrl = 'http://ec2-13-37-238-204.eu-west-3.compute.amazonaws.com:8080/offer'; // Replace with your server's offer route
  const [isStreaming, setIsStreaming] = useState(false);
  const [detections, setDetections] = useState([]);
  const [timeStart, setTimeStart] = useState(null);

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

    dataChannel.current = peerConnection.current.createDataChannel('chat', { ordered: true });
    dataChannel.current.onclose = () => {
      clearInterval(dataChannelInterval.current);
    };
    dataChannel.current.onopen = () => {
      dataChannelInterval.current = setInterval(() => {
        const message = 'ping ' + currentStamp();
        dataChannel.current.send(message);
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
        //frameRate: { max: 10 },
      },
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
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
    } catch (err) {
      alert('Could not acquire media: ' + err);
    }
  };

  const stopVideoStream = () => {
    if (dataChannel.current) {
      dataChannel.current.close();
    }
    setDetections([]);
    if (peerConnection.current.getTransceivers) {
      peerConnection.current.getTransceivers().forEach((transceiver) => {
        if (transceiver.stop) {
          transceiver.stop();
        }
      });
    }

    peerConnection.current.getSenders().forEach((sender) => {
      sender.track.stop();
    });

    setTimeout(() => {
      peerConnection.current.close();
      peerConnection.current = null;
      setIsStreaming(false);
    }, 500);
  };

  useEffect(() => {
    return () => {
      stopVideoStream();
    };
  }, []);

  return (
    <div>
      <video ref={localVideoRef} autoPlay playsInline></video>
      <div>
        <button onClick={startVideoStream} disabled={isStreaming}>Start Streaming</button>
        <button onClick={stopVideoStream} disabled={!isStreaming}>Stop Streaming</button>
      </div>
    </div>
  );
};

export default Webrtc;

