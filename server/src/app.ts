import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { Room } from 'types/room';
import { countLog } from './helpers/logUtil';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000'
  }
});

const rooms: Room[] = [];
const sockets = new Map<string, string | undefined>(); // socket id와 uuid 매핑 // 아직 로그인 하지 않은 유저도 포함
const sessions = new Map<string, number>(); // uuid와 session Count 매핑
const usersLoggedIn = new Set<string>(); // uuid // 로그인 한 유저만
const usersInRoom = new Set<string>(); // uuid // 게임 방에 들어있는 유저
const socketsInRoom = new Set<string>(); // socket id // 게임 방에 접속되어 있는 소켓

io.on('connection', (socket) => {
  sockets.set(socket.id, undefined);

  // LOG
  console.log(`[[ Hello (${socket.id}) ]]`);
  countLog(sockets.size, usersLoggedIn.size, usersInRoom.size);

  socket.on('saveUser', (uuid) => {
    if (uuid) {
      sockets.set(socket.id, uuid);
      sessions.set(uuid, (sessions.get(uuid) || 0) + 1);
      usersLoggedIn.add(uuid);

      // LOG
      console.log(`[[ User Logged In (${socket.id}) ]]`);
      console.log(`[[ Current User Session Count : ${sessions.get(uuid)}]]`);
      countLog(sockets.size, usersLoggedIn.size, usersInRoom.size);
    }
  });

  socket.on('disconnect', () => {
    const uuid = sockets.get(socket.id);
    if (uuid) {
      const currentSessionCount = sessions.get(uuid);
      if (currentSessionCount) {
        if (currentSessionCount === 1) {
          sessions.delete(uuid);
          usersLoggedIn.delete(uuid);
          usersInRoom.delete(uuid);
        } else {
          if (socketsInRoom.has(socket.id)) {
            usersInRoom.delete(uuid);
          }
          sessions.set(uuid, currentSessionCount - 1);
        }
      }
    }
    socketsInRoom.delete(socket.id);
    sockets.delete(socket.id);

    // LOG
    console.log(`[[ Bye (${socket.id}) ]]`);
    if (uuid) {
      console.log(`[[ Current User Session Count : ${sessions.get(uuid) || 0}]]`);
    }
    countLog(sockets.size, usersLoggedIn.size, usersInRoom.size);
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

  // // 방 입장하기
  // socket.on('enterRoom', (roomId) => {
  //   const room = rooms.find((room) => room.roomNumber === roomId);
  //   if (room) {
  //     io.emit('onRoomEntered', roomId);
  //   } else {
  //     // 에러메시지 (방이 사라졌다던지)
  //   }
  // });
});

server.listen('4000', () => {
  console.log('Socket server listening on port 4000');
});
