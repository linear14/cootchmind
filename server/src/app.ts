import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000'
  }
});

io.on('connection', (socket) => {
  console.log(`a user connected (${socket.id})`);

  socket.on('disconnect', () => {
    console.log(`bye user (${socket.id})`);
  });

  socket.on('string', (args) => {
    console.log(args);
    socket.emit('alert', 'Server Received Message Successfully');
  });

  socket.on('object', (args) => {
    console.log(args);
    io.emit('alert', 'Object Message To All User Connected');
  });
});

// app.get('/test', (req: Request, res: Response, next: NextFunction) => {
//   res.send('test success');
// });

server.listen('4000', () => {
  console.log('Socket server listening on port 4000');
});
