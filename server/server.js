const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const socketIo = require('socket.io');

require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// MongoDB connection (removed deprecated options)
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/boba-leaderboard')
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// WebSocket connection
io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Routes
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Boba Tracker API is running' });
});

// Make io accessible in routes
app.set('io', io);

// Fixed: Use the PORT from .env (5001) instead of defaulting to 5000
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

