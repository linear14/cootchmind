import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { Room } from 'types/room';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000'
  }
});

const rooms: Room[] = [];

io.on('connection', (socket) => {
  console.log(`a user connected (${socket.id})`);

  socket.on('disconnect', () => {
    console.log(`bye user (${socket.id})`);
  });

  // 채팅
  socket.on('chat', (chat) => {
    io.emit('onChatReceived', chat);
  });

  // 방 만들기
  socket.on('generateRoom', ({ title, createdBy, uuid }) => {
    const roomId = Date.now();
    const room: Room = {
      title,
      users: [{ name: createdBy, uuid, isMaster: true }],
      roomId,
      master: createdBy
    };
    rooms.push(room);

    socket.emit('onRoomGenerated', roomId);
  });

  // 방 조회하기
  socket.on('refreshRoomList', () => {
    socket.emit('onRoomListRefreshed', rooms);
  });
});

// app.get('/test', (req: Request, res: Response, next: NextFunction) => {
//   res.send('test success');
// });

server.listen('4000', () => {
  console.log('Socket server listening on port 4000');
});
