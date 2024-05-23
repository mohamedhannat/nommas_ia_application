
var pc = null;

// data channel
var dc = null, dcInterval = null;

function createPeerConnection() {
    var config = {
        sdpSemantics: 'unified-plan'
    };

    config.iceServers = [{urls: ['stun:stun.l.google.com:19302', 'stun:stun.cloudflare.com:3478', 'stun:stun.flashdance.cx:3478']}];
    
	  pc = new RTCPeerConnection(config);

    // register some listeners to help debugging
    pc.addEventListener('icegatheringstatechange', function() {
        console.log(pc.iceGatheringState);
    }, false);

    pc.addEventListener('iceconnectionstatechange', function() {
        console.log(pc.iceConnectionState);
    }, false);

    pc.addEventListener('signalingstatechange', function() {
        console.log(pc.signalingState);
    }, false);

    // connect audio / video
    pc.addEventListener('track', function(evt) {
        //if (evt.track.kind == 'video')
        //    document.getElementById('video').srcObject = evt.streams[0];
        //else
        //    document.getElementById('audio').srcObject = evt.streams[0];
    });

    return pc;
}

function negotiate() {
    return pc.createOffer().then(function(offer) {
        return pc.setLocalDescription(offer);
    }).then(function() {
        // wait for ICE gathering to complete
        return new Promise(function(resolve) {
            if (pc.iceGatheringState === 'complete') {
                resolve();
            } else {
                function checkState() {
                    if (pc.iceGatheringState === 'complete') {
                        pc.removeEventListener('icegatheringstatechange', checkState);
                        resolve();
                    }
                }
                pc.addEventListener('icegatheringstatechange', checkState);
            }
        });
    }).then(function() {
        var offer = pc.localDescription;
        var codec;

        codec = 'default'

        console.log(offer.sdp);
        return fetch('http://ec2-13-37-238-204.eu-west-3.compute.amazonaws.com:8080/offer', {//http://localhost:8080
            body: JSON.stringify({
                sdp: offer.sdp,
                type: offer.type,
                video_transform: 'transform' 
            }),
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'POST'
        });
    }).then(function(response) {
        return response.json();
    }).then(function(answer) {
				console.log("answeeeeeeer");
				console.log(answer.sdp);
        return pc.setRemoteDescription(answer);
    }).catch(function(e) {
        alert(e);
    });
}

export function start(videoStream, setConnState, setDetections) {

    pc = createPeerConnection();

		setConnState(1);
    var time_start = null;

    function current_stamp() {
        if (time_start === null) {
            time_start = new Date().getTime();
            return 0;
        } else {
            return new Date().getTime() - time_start;
        }
    }

		var parameters = {
			"ordered": true
		}

		dc = pc.createDataChannel('chat', parameters);
		dc.onclose = function() {
				clearInterval(dcInterval);
		};
		dc.onopen = function() {
				dcInterval = setInterval(function() {
						var message = 'ping ' + current_stamp();
						dc.send(message);
				}, 5000);
		};
		dc.onmessage = function(evt) {
				if(!evt.data.startsWith('pong')){
					setDetections(JSON.parse(evt.data));
					console.log(evt.data);
				}
				else{
          var elapsed_ms = current_stamp() - parseInt(evt.data.substring(5), 10);
          console.log(evt.data + ' RTT ' + elapsed_ms + ' ms\n');
				}
		};

    var constraints = {
        audio: false,
        video: false
    };

		var resolution = '640x480';
		resolution = resolution.split('x');
		constraints.video = {
				width: parseInt(resolution[0], 0),
				height: parseInt(resolution[1], 0),
				frameRate: { max: 10 }
		};
		

    if (constraints.audio || constraints.video) {
        navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
            stream.getTracks().forEach(function(track) {
                pc.addTrack(track, stream);
								videoStream.current.srcObject= new MediaStream([track]);
								/*if (track.kind === 'video') {
									document.getElementById('video').srcObject = new MediaStream([track]);
								}*/
            });
            return negotiate();
        }, function(err) {
            alert('Could not acquire media: ' + err);
        });
    } else {
        negotiate();
    }
		setConnState(2);
}

export function stop(setConnState, setDetections) {
    // close data channel
    if (dc) {
        dc.close();
    }
		setDetections([]);
    // close transceivers
    if (pc.getTransceivers) {
        pc.getTransceivers().forEach(function(transceiver) {
            if (transceiver.stop) {
                transceiver.stop();
            }
        });
    }

    // close local audio / video
    pc.getSenders().forEach(function(sender) {
        sender.track.stop();
    });

    // close peer connection
    setTimeout(function() {
        pc.close();
    }, 500);
		setConnState(0);
}


