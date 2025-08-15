// File: backend/server.js

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Port configuration: use environment variable if available
const PORT = process.env.PORT || 4000;

// Enable CORS for HTTP requests
// In production, restrict `origin` to your frontend domain
app.use(cors());

// Initialize Socket.IO with CORS settings
const io = new Server(server, {
  cors: {
    origin: "*", // Change to your frontend URL in production
    methods: ["GET", "POST"]
  }
});

// Basic health check route
app.get('/', (req, res) => {
  res.send('PeerBoard Backend is running');
});

// Handle Socket.IO connections
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
