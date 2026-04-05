/**
 * WebRTC Signaling Connection Service
 * Extracts raw peer connection handling for future WebSocket signaling layers
 */

export class WebRTCService {
    private peerConnection: RTCPeerConnection | null = null;
    private servers = {
        iceServers: [{ urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'] }]
    };

    /**
     * Initializes a new RTCPeerConnection and maps basic stream tracks
     */
    public initializeConnection(stream: MediaStream): RTCPeerConnection {
        this.peerConnection = new RTCPeerConnection(this.servers);
        
        // Map local media tracks to the peer connection
        stream.getTracks().forEach(track => {
            if (this.peerConnection) {
                this.peerConnection.addTrack(track, stream);
            }
        });

        return this.peerConnection;
    }

    /**
     * Closes the active WebRTC connection securely
     */
    public closeConnection(): void {
        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }
    }
}

export const webrtcService = new WebRTCService();
