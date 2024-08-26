const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());


const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:4200",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});

const chatDataPath = path.join('./chat-data.json');

const readChatData = () => {
  if (fs.existsSync(chatDataPath)) {
    const data = fs.readFileSync(chatDataPath, 'utf-8');
    return JSON.parse(data);
  }
  return { messages: [] };
};

const writeChatData = (data) => {
  fs.writeFileSync(chatDataPath, JSON.stringify(data, null, 2), 'utf-8');
};

let chatData = readChatData();

io.on('connection', (socket) => {
  console.log('New client connected');
  
  socket.emit('initialMessages', chatData.messages);

  socket.on('message', (data) => {
    console.log('Message received: ', data);
    chatData.messages.push(data);
    writeChatData(chatData);
    io.emit('message', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});
