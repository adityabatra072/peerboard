const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 4000;
app.use(cors());

const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] } });

const boardUsers = {}; // Tracks users per board: { boardId: [ {id, email} ] }

io.on('connection', (socket) => {
  socket.on('join-board', ({ boardId, user }) => {
    socket.join(boardId);
    
    // Add user to the board's user list
    if (!boardUsers[boardId]) boardUsers[boardId] = [];
    const userExists = boardUsers[boardId].find(u => u.id === socket.id);
    if (!userExists) {
      boardUsers[boardId].push({ id: socket.id, email: user.email });
    }

    // Announce the updated user list to everyone in the room
    io.to(boardId).emit('active-users', boardUsers[boardId]);
    console.log(`User ${user.email} (${socket.id}) joined board: ${boardId}`);

    socket.on('drawing', (data) => {
      socket.to(boardId).emit('drawing', data);
    });

    socket.on('cursor-move', (cursorData) => {
      socket.to(boardId).emit('cursor-update', { ...cursorData, id: socket.id });
    });

    socket.on('disconnect', () => {
      // Remove user from the list and broadcast the update
      if (boardUsers[boardId]) {
        boardUsers[boardId] = boardUsers[boardId].filter(u => u.id !== socket.id);
        io.to(boardId).emit('active-users', boardUsers[boardId]);
      }
      console.log(`User ${socket.id} disconnected from board: ${boardId}`);
    });
  });
});

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
