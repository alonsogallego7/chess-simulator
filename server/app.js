import express from 'express';
import cors from 'cors';

import { createServer } from 'node:http';
import { Server } from "socket.io";

import matchmakingRouter from './multiplayer/matchmaking.js';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:4200", // La URL de tu Angular
    methods: ["GET", "POST"]
  }
});

const port = 3000;

app.use(cors());
app.use(express.json());

// Usamos el router de matchmaking
app.use('/matchmaking', matchmakingRouter);

app.get('/', (req, res) => {
    res.send('Servidor de Ajedrez activo (ES Modules)');
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Listening for messages from the client
  socket.on('message', (msg) => {
    console.log('Received message:', msg);
    io.emit('message', msg); // Broadcasting message to all clients
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(port, () => {
    console.log(`Servidor multijugador escuchando en http://localhost:${port}`);
});