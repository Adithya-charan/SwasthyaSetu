console.log("Signaling Server Starting...");
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection - Disabled for Dev to avoid connection errors
/*
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/swasthyasetu')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// Mongoose Schemas (Simplified for WebRTC/Chat)
const chatMessageSchema = new mongoose.Schema({
    roomId: String,
    senderId: String,
    senderRole: String,
    message: String,
    fileData: String,
    extractedText: String,
    type: String, // text, image, file
    timestamp: Date
});
const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);
*/

// Routes Placeholder
app.get('/', (req, res) => {
    res.send('SwasthyaSetu Node.js Microservice Running');
});

// Start Server
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});

// WebRTC & Chat Socket.io Setup
const io = require('socket.io')(server, {
    cors: {
        origin: "*", // Allows any origin, adjust in production
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join Room
    socket.on('join-room', ({ roomName, userRole, userName }) => {
        socket.join(roomName);
        console.log(`User ${userName} (${userRole}) joined room ${roomName}`);
        
        const clients = io.sockets.adapter.rooms.get(roomName);
        const numClients = clients ? clients.size : 0;
        
        // Notify the joiner
        socket.emit('joined-room', { numClients });

        // Notify others in room
        socket.to(roomName).emit('user-joined', { socketId: socket.id, userRole, userName });
    });

    // WebRTC Signaling (Offer, Answer, ICE Candidates)
    socket.on('webrtc-signal', (data) => {
        console.log(`[Signal] ${data.type} from ${socket.id} in ${data.roomName}`);
        // Broadcast signal to everyone else in the room
        socket.to(data.roomName).emit('webrtc-signal', data);
    });

    // Chat Messages
    socket.on('chat-message', async (msg) => {
        // Save to MongoDB - Disabled for Dev
        /*
        try {
            const newMsg = new ChatMessage(msg);
            await newMsg.save();
        } catch (err) {
            console.error("Failed to save chat message:", err);
        }
        */
        
        // Broadcast to others in the room
        socket.to(msg.roomId).emit('chat-message', msg);
    });

    // Admin Real-time Tracking
    socket.on("user_login", (userData) => {
        io.emit("new_login", {
            ...userData,
            timestamp: new Date().toISOString(),
            socketId: socket.id
        });
    });

    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
        // Can emit logout event for Admin tracking
        io.emit("user_logout", { socketId: socket.id, timestamp: new Date().toISOString() });
    });
});
