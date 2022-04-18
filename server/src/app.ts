import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { Room } from 'types/room';
import { quizItemList } from './data/quiz';
import { getQuizIndices } from './helpers/gameUtil';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000'
  }
});

const CHAT_CHANNEL = 'chat_channel';
const rooms = new Map<string, Room>();
const socketToUUID = new Map<string, string | undefined>(); // socketId - uuid, undefined
const UUIDToSocketList = new Map<string, string[]>(); // uuid - socketId[]
const uuidToRoomId = new Map<string, string>(); // uuid - roomId
const socketToRoomId = new Map<string, string>(); // socketId - roomId

const removeSession = (socketId: string, uuid: string) => {
  const currentSession = UUIDToSocketList.get(uuid);
  if (currentSession) {
    if (currentSession.length <= 1) {
      UUIDToSocketList.delete(uuid);
      uuidToRoomId.delete(uuid);
      socketToRoomId.delete(socketId);
    } else {
      if (socketToRoomId.has(socketId)) {
        uuidToRoomId.delete(uuid);
      }
      const idx = currentSession.indexOf(socketId);
      currentSession.splice(idx, 1);
      UUIDToSocketList.set(uuid, currentSession);
      socketToRoomId.delete(socketId);
    }
  }
};

io.on('connection', (socket) => {
  socketToUUID.set(socket.id, undefined);

  // 1. 비정상 접근
  socket.on('initUserState', () => {});

  // 2. 사용자 정보 저장 - 완료
  socket.on('saveUser', (uuid) => {
    if (socketToUUID.get(socket.id) === uuid) return;
    if (uuid) {
      socketToUUID.set(socket.id, uuid);

      const socketList = UUIDToSocketList.get(uuid) ?? [];
      UUIDToSocketList.set(uuid, socketList.concat(socket.id));
      socket.join(CHAT_CHANNEL);
    }
  });

  // 3. 대기실 채팅 - 완료
  socket.on('chat', ({ playerName, message }) => {
    io.to(CHAT_CHANNEL).emit('onChat', { playerName, message });
  });

  // 4. 방 생성 - 완료
  socket.on('createRoom', ({ uuid, playerName, title }) => {
    if (uuidToRoomId.get(uuid)) {
      socket.emit('onError', { message: '이미 접속중인 방이 존재합니다.' });
      return;
    }

    const roomId = Date.now().toString();
    const room: Room = {
      roomId,
      title,
      users: Array.from({ length: 6 }, () => null),
      master: { name: playerName, uuid },
      quizIndices: [],
      currentRound: 0,
      kickedUserUUIDList: [],
      state: 'ready'
    };

    room.users[0] = { name: playerName, uuid, isMaster: true, answerCnt: 0 };
    rooms.set(roomId, room);

    uuidToRoomId.set(uuid, roomId);
    socketToRoomId.set(socket.id, roomId);
    socket.emit('onRoomGenerated', roomId);
  });

  // 5. 방 조회 - 완료
  socket.on('refreshRoomList', () => {
    const currentRoom = Array.from(rooms.values());
    const parsedRoom = currentRoom.map((room) => ({
      roomId: room.roomId,
      title: room.title,
      masterName: room.master.name,
      currentRound: room.currentRound,
      state: room.state,
      kickedUserUUIDList: room.kickedUserUUIDList
    }));
    socket.emit('onRoomListRefreshed', parsedRoom);
  });

  // 6. 방 입장 시도
  socket.on('tryEnterRoom', ({ roomId, playerName, clientUUID }) => {
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
    const uuid = socketToUUID.get(socket.id);
    if (!uuid || uuid !== clientUUID) {
      if (uuid) {
        removeSession(socket.id, uuid);
        uuidToRoomId.delete(uuid);
      }
      socketToUUID.set(socket.id, undefined);

      socket.emit('onError', {
        message: '사용자 정보 위변조가 감지되었습니다. 닉네임 설정창으로 돌아갑니다.',
        closeConnection: true
      });
      return;
    }

    // 게임 방(전체)에 이미 존재하는 uuid가 있는지
    if (uuidToRoomId.has(uuid)) {
      socket.emit('onError', { message: '이미 접속 중인 방이 존재합니다.' });
      return;
    }

    uuidToRoomId.set(uuid, roomId);
    socketToRoomId.set(socket.id, roomId);
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

  // 7. 방 입장 (url로 직접 접근 시 오류)
  socket.on('enterRoom', ({ roomId, uuid }) => {
    const room = rooms.get(roomId);
    if (!room) {
      socket.emit('onError', { message: '존재하지 않는 방입니다. ' });
      return;
    }
    if (!uuidToRoomId.has(uuid)) {
      socket.emit('onError', { message: '정상적인 경로로 입장해주세요.' });
      return;
    }
    socket.join(roomId);
    socket.emit('onEnteredGameRoom', room);
    io.to(roomId).emit('onPlayerRefreshed', room.users);
  });

  // 8. 방 퇴장
  socket.on('leaveRoom', ({ roomId, uuid }) => {
    const room = rooms.get(roomId);
    if (!room) {
      socket.emit('onError', { message: '방장이 방을 폭파했습니다.' });
      return;
    }

    if (room.master.uuid === uuid) {
      room.users.forEach((user) => {
        if (user) {
          uuidToRoomId.delete(user.uuid);
        }
      });
      io.sockets.adapter.rooms.get(roomId)?.forEach((socketId) => socketToRoomId.delete(socketId));
      rooms.delete(roomId);

      socket.to(roomId).emit('onMasterLeftRoom'); // 방장 빼고 emit
      io.socketsLeave(roomId);
    } else {
      socket.leave(roomId);
      const userIdx = room.users.findIndex((user) => user?.uuid === uuid);
      if (userIdx >= 0) {
        room.users[userIdx] = null;
      }
      uuidToRoomId.delete(uuid);
      socketToRoomId.delete(socket.id);
      io.to(roomId).emit('onPlayerRefreshed', room.users);
    }
  });

  // 9. 방 폭파
  socket.on('deleteRoom', () => {});

  // 10. 게임 시작
  socket.on('startGame', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room) {
      socket.emit('onError', { message: '존재하지 않는 방입니다.' });
      return;
    }
    room.state = 'interval';
    io.to(roomId).emit('onGameStart', room);
  });

  // 11. 라운드 시작
  socket.on('startRound', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room) {
      socket.emit('onError', { message: '존재하지 않는 방입니다.' });
      return;
    }

    // 다음 턴 유저 결정
    let nextTurnDecided = false;
    let nextTurnIdx = room.turn ? (room.turn.idx + 1) % 6 : 0;
    for (let i = nextTurnIdx; i < 6; i++) {
      if (room.users[i] !== null) {
        nextTurnIdx = i;
        nextTurnDecided = true;
        break;
      }
    }
    if (!nextTurnDecided) {
      for (let i = 0; i < nextTurnIdx; i++) {
        if (room.users[i] !== null) {
          nextTurnIdx = i;
          break;
        }
      }
    }

    const nextUser = room.users[nextTurnIdx];
    if (nextUser) {
      room.state = 'play';
      room.currentRound = room.currentRound ? room.currentRound + 1 : 0;
      room.turn = { name: nextUser?.name, uuid: nextUser?.uuid, idx: nextTurnIdx };

      const answer = quizItemList[room.quizIndices[room.currentRound]].answer;
      io.to(roomId).emit('onRoundStart', { room, answer });
    }
  });

  // 12. 정답 전송
  socket.on('submitAnswer', () => {});

  // 13. 게임 내 채팅
  socket.on('chatInGame', () => {});

  // 14. 그림 데이터 전송
  socket.on('submitPaint', () => {});

  // 15. 게임 종료
  socket.on('endGame', () => {});

  // 16. 사용자 추방
  socket.on('kickUser', () => {});

  // 17. disconnect
  socket.on('disconnect', () => {
    const uuid = socketToUUID.get(socket.id);
    if (uuid) {
      removeSession(socket.id, uuid);
    }
    socketToRoomId.delete(socket.id);
    socketToUUID.delete(socket.id);
  });
});

server.listen('4000', () => {
  console.log('Socket server listening on port 4000');
});
