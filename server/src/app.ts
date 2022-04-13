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

const rooms = new Map<string, Room>();
const sockets = new Map<string, string | undefined>(); // socket id와 uuid 매핑 // 아직 로그인 하지 않은 유저도 포함
const sessions = new Map<string, number>(); // uuid와 session Count 매핑
const usersLoggedIn = new Set<string>(); // uuid // 로그인 한 유저만
const usersInRoom = new Set<string>(); // uuid // 게임 방에 들어있는 유저
const socketsInRoom = new Set<string>(); // socket id // 게임 방에 접속되어 있는 소켓

const removeSession = (socketId: string, uuid: string) => {
  const currentSessionCount = sessions.get(uuid);
  if (currentSessionCount) {
    if (currentSessionCount === 1) {
      sessions.delete(uuid);
      usersLoggedIn.delete(uuid);
      usersInRoom.delete(uuid);
    } else {
      if (socketsInRoom.has(socketId)) {
        usersInRoom.delete(uuid);
      }
      sessions.set(uuid, currentSessionCount - 1);
    }
  }
};

io.on('connection', (socket) => {
  sockets.set(socket.id, undefined);

  // LOG
  console.log(`[[ Hello (${socket.id}) ]]`);
  countLog(sockets.size, usersLoggedIn.size, usersInRoom.size);

  // uuid 위조 검사도 해야함
  socket.on('saveUser', (uuid) => {
    if (sockets.get(socket.id) === uuid) return;
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

  // 방 입장하기
  socket.on('tryEnterGameRoom', ({ roomId, playerName, clientUUID }) => {
    // 게임 방이 존재하는지
    const room = rooms.get(roomId);
    if (!room) {
      socket.emit('onError', { message: '해당 방이 존재하지 않습니다.' });
      return;
    }

    // 게임 방의 인원수가 가득 차있는지
    if (room.users.filter((user) => user === null).length === 0) {
      socket.emit('onError', { message: '이미 가득 찬 방입니다.' });
      return;
    }

    // 사용자의 uuid가 위조되지 않았는지
    const uuid = sockets.get(socket.id);
    if (!uuid || uuid !== clientUUID) {
      if (uuid) {
        removeSession(socket.id, uuid);
        usersLoggedIn.delete(uuid);
        usersInRoom.delete(uuid);
      }
      sockets.set(socket.id, undefined);

      socket.emit('onError', {
        message: '사용자 정보 위변조가 감지되었습니다. 닉네임 설정창으로 돌아갑니다.',
        closeConnection: true
      });
      return;
    }

    // 게임 방(전체)에 이미 존재하는 uuid가 있는지
    if (usersInRoom.has(uuid)) {
      socket.emit('onError', { message: '이미 접속 중인 방이 존재합니다.' });
      return;
    }

    usersInRoom.add(uuid);
    socketsInRoom.add(socket.id);
    const emptyIdx = room.users.findIndex((user) => user === null);
    if (emptyIdx >= 0) {
      room.users[emptyIdx] = {
        name: playerName,
        uuid,
        isMaster: room.master.uuid === uuid,
        answerCnt: 0
      };
    }
    socket.emit('onSuccessRoomConnection', roomId);
  });

  // gamePage에 접속 (url 바로 접속 / 정상 경로 접속 구분)
  socket.on('enterGameRoom', ({ roomId, uuid }) => {
    const room = rooms.get(roomId);
    if (!room) {
      socket.emit('onError', { message: '존재하지 않는 방입니다. ' });
      return;
    }
    if (!usersInRoom.has(uuid)) {
      socket.emit('onError', { message: '정상적인 경로로 입장해주세요.' });
      return;
    }
    socket.join(roomId);
    socket.emit('onEnteredGameRoom', room);
    io.to(roomId).emit('onPlayerRefreshed', room.users);
  });

  socket.on('leaveGameRoom', ({ roomId, uuid }) => {
    const room = rooms.get(roomId);
    if (!room) {
      socket.emit('onError', { message: '방장이 방을 폭파했습니다.' });
      return;
    }


    // console.log('--- before ---');
    // console.log(io.sockets.adapter.rooms.get(roomId));
    // console.log(socketsInRoom);
    // console.log(usersInRoom);
    if (room.master.uuid === uuid) {
      room.users.forEach((user) => {
        if (user) {
          usersInRoom.delete(user.uuid);
        }
      });
      io.sockets.adapter.rooms.get(roomId)?.forEach((socketId) => socketsInRoom.delete(socketId));
      rooms.delete(roomId);

      socket.to(roomId).emit('onMasterLeftRoom'); // 방장 빼고 emit
      io.socketsLeave(roomId);
    } else {
      socket.leave(roomId);
      const userIdx = room.users.findIndex((user) => user?.uuid === uuid);
      if (userIdx >= 0) {
        room.users[userIdx] = null;
      }
      usersInRoom.delete(uuid);
      socketsInRoom.delete(socket.id);
      io.to(roomId).emit('onPlayerRefreshed', room.users);
    }
    // console.log('--- after ---');
    // console.log(io.sockets.adapter.rooms.get(roomId));
    // console.log(socketsInRoom);
    // console.log(usersInRoom);
  });

  socket.on('disconnect', () => {
    const uuid = sockets.get(socket.id);
    if (uuid) {
      removeSession(socket.id, uuid);
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
    const roomId = Date.now().toString();
    const room: Room = {
      title,
      users: Array.from({ length: 6 }, () => null),
      roomId,
      master: { name: createdBy, uuid }
    };
    room.users[0] = { name: createdBy, uuid, isMaster: true, answerCnt: 0 };
    rooms.set(roomId, room);

    usersInRoom.add(uuid);
    socketsInRoom.add(socket.id);
    socket.emit('onRoomGenerated', roomId);
  });

  // 방 조회하기
  socket.on('refreshRoomList', () => {
    socket.emit('onRoomListRefreshed', Array.from(rooms.values()));
  });

  // 라운드 시작
  socket.on('roundStart', () => {
    socket.emit('onRoundStart');
  });

  socket.on('roundEnd', () => {
    socket.emit('onRoundEnd');
  });
});

server.listen('4000', () => {
  console.log('Socket server listening on port 4000');
});
