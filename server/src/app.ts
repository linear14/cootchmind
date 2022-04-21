import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
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

  // 추가 필요: 게임 진행중인 방은 입장할 수 없도록
  // 6. 방 입장 시도 - 완료
  socket.on('tryEnterRoom', ({ uuid, playerName, roomId }) => {
    // 게임 방이 존재하는지
    const room = rooms.get(roomId);
    if (!room) {
      socket.emit('onError', { message: '존재하지 않는 방입니다.' });
      return;
    }

    // 게임 방의 인원수가 가득 차있는지
    if (room.users.filter((user) => user === null).length === 0) {
      socket.emit('onError', { message: '이미 가득 찬 방입니다.' });
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
    socket.emit('onRoomJoined', roomId);
  });

  // 7. 방 입장 - 완료
  socket.on('enterRoom', ({ uuid, roomId }) => {
    if (!uuidToRoomId.has(uuid) || !socketToRoomId.has(socket.id)) {
      socket.emit('onError', { message: '정상적인 경로로 입장해주세요.' });
      return;
    }

    const room = rooms.get(roomId);
    if (!room) {
      socket.emit('onError', { message: '존재하지 않는 방입니다.' });
      return;
    }

    socket.join(roomId);
    socket.emit('onRoomEntered', {
      roomId: room.roomId,
      title: room.title,
      users: room.users,
      currentRound: room.currentRound,
      state: room.state,
      turn: room.turn
    }); // 받으면 클라이언트에서 알아서 잘 쓰기
    socket.to(roomId).emit('onPlayerRefreshed', room.users);
    socket.leave(CHAT_CHANNEL);
  });

  // 8. 방 퇴장 - 완료
  socket.on('leaveRoom', ({ uuid, roomId }) => {
    socket.leave(roomId);
    uuidToRoomId.delete(uuid);
    socketToRoomId.delete(socket.id);
    socket.join(CHAT_CHANNEL);

    const room = rooms.get(roomId);
    if (!room) {
      socket.emit('onError', { message: '방장이 방을 폭파했습니다.' });
      return;
    }

    const userIdx = room.users.findIndex((user) => user?.uuid === uuid);
    if (userIdx >= 0) {
      room.users[userIdx] = null;
    }
    io.to(roomId).emit('onPlayerRefreshed', room.users);
  });

  // 9. 방 폭파 - 완료
  socket.on('deleteRoom', ({ uuid, roomId }) => {
    const room = rooms.get(roomId);
    if (room && room.master.uuid === uuid) {
      rooms.delete(roomId);
      uuidToRoomId.delete(uuid);
      socketToRoomId.delete(socket.id);
      socket.join(CHAT_CHANNEL);

      socket.to(roomId).emit('onMasterLeftRoom'); // 방장 빼고 emit
      io.socketsLeave(roomId);
    }
  });

  // 추가 필요: 모든 사용자가 준비 완료 되었을 때 시작 가능하도록
  // 10. 게임 시작 - 완료
  socket.on('startGame', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room) {
      socket.emit('onError', { message: '존재하지 않는 방입니다.' });
      return;
    }
    room.state = 'interval';
    room.quizIndices = getQuizIndices(quizItemList.length);
    io.to(roomId).emit('onGameStarted', room);
  });

  // 추가 필요: 모든 플레이어의 ready 신호가 떨어지면 시작할 수 있도록
  // 11. 라운드 시작 - 완료
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
      room.currentRound = room.currentRound + 1;
      room.turn = { name: nextUser.name, uuid: nextUser.uuid, idx: nextTurnIdx };

      const nextUserUUID = nextUser.uuid;
      const nextUserSocketList = UUIDToSocketList.get(nextUserUUID);
      const nextUserSocketId = nextUserSocketList?.find(
        (socketId) => socketToRoomId.get(socketId) === roomId
      );
      const answer = quizItemList[room.quizIndices[room.currentRound - 1]].answer;

      if (nextUserSocketId) {
        io.to(nextUserSocketId).emit('onRoundStarted', { turn: room.turn, answer });
        io.to(roomId).except(nextUserSocketId).emit('onRoundStarted', { turn: room.turn });
      } else {
        io.to(roomId).emit('onError', { message: '플레이어 정보가 소멸되었습니다.' });
        return;
      }
    } else {
      io.to(roomId).emit('onError', { message: '플레이어가 존재하지 않습니다.' });
      return;
    }
  });

  // 12. 정답 전송 - 완료
  socket.on('submitAnswer', ({ uuid, roomId, message }) => {
    const room = rooms.get(roomId);
    if (!room) {
      socket.emit('onError', { message: '존재하지 않는 방입니다.' });
      return;
    }

    io.to(roomId).emit('onChatInGame', { uuid, message });

    if (room.state === 'play') {
      const currentRound = room.currentRound;
      const answer = quizItemList[room.quizIndices[currentRound - 1]];

      if (answer === message) {
        const user = room.users.find((user) => user?.uuid === uuid);
        if (user && user !== null) {
          user.answerCnt++;
        }
        room.state = 'interval';
        io.to(roomId).emit('onRoundEnded', { answer, winPlayer: user });
      }
    }
  });

  // 13. 게임 내 채팅 - 완료
  socket.on('chatInGame', ({ uuid, roomId, message }) => {
    const room = rooms.get(roomId);
    if (!room) {
      socket.emit('onError', { message: '존재하지 않는 방입니다.' });
      return;
    }
    io.to(roomId).emit('onChatInGame', { uuid, message });
  });

  // 14. 그림 데이터 전송
  socket.on('submitPaint', () => {});

  // 15. 게임 종료
  socket.on('endGame', () => {});

  // 16. 사용자 추방
  socket.on('kickUser', () => {});

  // 17. disconnect - 완료
  socket.on('disconnect', () => {
    const uuid = socketToUUID.get(socket.id);
    const roomIdOfSocket = socketToRoomId.get(socket.id);

    // 게임 중에 접속을 종료했다.
    if (uuid && roomIdOfSocket) {
      const room = rooms.get(roomIdOfSocket);

      // 방장인 경우
      if (room) {
        if (room.master.uuid === uuid) {
          rooms.delete(room.roomId);
          socket.to(room.roomId).emit('onMasterLeftRoom');
          io.socketsLeave(room.roomId);
        }
        // 방장이 아닌경우
        else {
          const userIdx = room.users.findIndex((user) => user?.uuid === uuid);
          if (userIdx >= 0) {
            room.users[userIdx] = null;
          }
          io.to(room.roomId).emit('onPlayerRefreshed', room.users);
        }
      }
    }

    if (uuid) {
      removeSession(socket.id, uuid);
    }
    socketToUUID.delete(socket.id);
    socketToRoomId.delete(socket.id);
  });
});

server.listen('4000', () => {
  console.log('Socket server listening on port 4000');
});
