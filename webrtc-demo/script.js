// DOM Elements
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const localPlaceholder = document.getElementById('localPlaceholder');
const remotePlaceholder = document.getElementById('remotePlaceholder');
const localStatus = document.getElementById('localStatus');
const remoteStatus = document.getElementById('remoteStatus');

const startCameraBtn = document.getElementById('startCameraBtn');
const createOfferBtn = document.getElementById('createOfferBtn');
const createAnswerBtn = document.getElementById('createAnswerBtn');
const addAnswerBtn = document.getElementById('addAnswerBtn');
const offerDataTextarea = document.getElementById('offerData');
const copyBtn = document.getElementById('copyBtn');

// WebRTC State
let localStream;
let remoteStream;
let peerConnection;

// STUN server configuration for NAT traversal
const servers = {
    iceServers: [
        {
            urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302']
        }
    ]
};

// 1. Initialize Media Devices
const initMedia = async () => {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideo.srcObject = localStream;
        
        // Update UI
        localVideo.style.display = 'block';
        localPlaceholder.style.display = 'none';
        localStatus.textContent = 'Camera Active';
        localStatus.className = 'status-indicator online';
        
        // Enable next steps
        createOfferBtn.disabled = false;
        createAnswerBtn.disabled = false;
        
        // Update button
        startCameraBtn.className = 'btn success-btn';
        startCameraBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> Camera active';
    } catch (error) {
        console.error('Error accessing media devices:', error);
        alert('Could not access camera and microphone. Please ensure you have granted permissions.');
    }
};

// Base connection setup used by both caller and callee
const createPeerConnection = () => {
    peerConnection = new RTCPeerConnection(servers);

    remoteStream = new MediaStream();
    remoteVideo.srcObject = remoteStream;
    
    remoteVideo.style.display = 'block';
    remotePlaceholder.style.display = 'none';

    // Add local tracks to connection
    if (localStream) {
        localStream.getTracks().forEach((track) => {
            peerConnection.addTrack(track, localStream);
        });
    }

    // Listen for remote tracks
    peerConnection.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
            remoteStream.addTrack(track);
        });
        remoteStatus.textContent = 'Connected';
        remoteStatus.className = 'status-indicator online';
    };

    // When an ICE candidate is found, log the updated description to the textarea
    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            offerDataTextarea.value = JSON.stringify(peerConnection.localDescription);
        }
    };
    
    peerConnection.onconnectionstatechange = () => {
        console.log("Connection state:", peerConnection.connectionState);
        if (peerConnection.connectionState === 'connected') {
            remoteStatus.textContent = 'Connected (Live)';
            remoteStatus.className = 'status-indicator online';
        } else if (peerConnection.connectionState === 'disconnected' || peerConnection.connectionState === 'failed') {
            remoteStatus.textContent = 'Disconnected';
            remoteStatus.className = 'status-indicator offline';
        }
    };
};

// 2. Doctor: Create Offer
const createOffer = async () => {
    createPeerConnection();
    
    // Create and set local description (the offer)
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    
    // Wait for ICE candidates to gather. 
    // They will automatically populate the textarea via onicecandidate.
    offerDataTextarea.value = JSON.stringify(offer);
    
    addAnswerBtn.disabled = false;
    alert("Offer created. Wait a few seconds for ICE candidates to gather, then copy the data and send it to the Patient.");
};

// 3. Patient: Create Answer based on Offer
const createAnswer = async () => {
    const offerData = offerDataTextarea.value.trim();
    if (!offerData) {
        alert('Please paste the Doctor\'s offer data first!');
        return;
    }

    try {
        createPeerConnection();
        
        const offer = JSON.parse(offerData);
        await peerConnection.setRemoteDescription(offer);
        
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        
        // Wait for ICE candidates.
        offerDataTextarea.value = JSON.stringify(answer);
        
        alert("Answer created! Wait a few seconds for ICE candidates to gather, then copy the data and send it back to the Doctor.");
    } catch (err) {
        alert('Invalid offer data. Please ensure you copied the entire JSON string exactly.');
        console.error(err);
    }
};

// 4. Doctor: Add Patient's Answer
const addAnswer = async () => {
    const answerData = offerDataTextarea.value.trim();
    if (!answerData) {
        alert('Please paste the Patient\'s answer data first!');
        return;
    }

    try {
        const answer = JSON.parse(answerData);
        if (!peerConnection.currentRemoteDescription) {
            await peerConnection.setRemoteDescription(answer);
        }
        offerDataTextarea.value = "";
    } catch (err) {
        alert('Invalid answer data. Please ensure you copied the entire JSON string exactly.');
        console.error(err);
    }
};

// Copy to clipboard utility
const copyData = () => {
    offerDataTextarea.select();
    document.execCommand('copy');
    
    // Visual feedback
    const originalText = copyBtn.innerHTML;
    copyBtn.innerHTML = 'Copied!';
    setTimeout(() => {
        copyBtn.innerHTML = originalText;
    }, 2000);
};

// Event Listeners
startCameraBtn.addEventListener('click', initMedia);
createOfferBtn.addEventListener('click', createOffer);
createAnswerBtn.addEventListener('click', createAnswer);
addAnswerBtn.addEventListener('click', addAnswer);
copyBtn.addEventListener('click', copyData);
