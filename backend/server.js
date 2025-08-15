// File: backend/server.js

const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 4000;

app.use(cors());

const io = new Server(server, {
  cors: {
    origin: "*", // In production, restrict this to your Vercel frontend URL
    methods: ["GET", "POST"]
  }
});

app.get("/", (req, res) => {
  res.send("PeerBoard Backend is running!");
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('drawing', (data) => {
    socket.broadcast.emit('drawing', data);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
