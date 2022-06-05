import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { Player } from 'types/player';
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

const ROUND_NUM = 3;
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

const checkAllReady = (room: Room) => {
  const playerCount = room.players.filter((player) => player !== null).length;
  const readyUserCount = room.players.filter((player) => player !== null && player.isReady).length;

  if (playerCount <= readyUserCount) {
    console.log(`Ready!!: ${readyUserCount}/${playerCount}`);
    return true;
  } else {
    console.log(`not Ready: ${readyUserCount}/${playerCount}`);
    return false;
  }
};

const getNextPlayer = (room: Room): [number, Player | null] => {
  // 다음 턴 유저 결정
  let nextTurnDecided = false;
  let nextTurnIdx = room.turn ? (room.turn.idx + 1) % 6 : 0;
  for (let i = nextTurnIdx; i < 6; i++) {
    if (room.players[i] !== null) {
      nextTurnIdx = i;
      nextTurnDecided = true;
      break;
    }
  }
  if (!nextTurnDecided) {
    for (let i = 0; i < nextTurnIdx; i++) {
      if (room.players[i] !== null) {
        nextTurnIdx = i;
        break;
      }
    }
  }
  return [nextTurnIdx, room.players[nextTurnIdx]];
};

const setRoomStateForNextRound = (room: Room, nextTurnIdx: number, nextPlayer: Player) => {
  room.state = 'readyRound';
  room.currentRound = room.currentRound + 1;
  room.turn = { name: nextPlayer.name, uuid: nextPlayer.uuid, idx: nextTurnIdx };

  const nextPlayerUUID = nextPlayer.uuid;
  const nextPlayerSocketList = UUIDToSocketList.get(nextPlayerUUID);
  const nextPlayerSocketId = nextPlayerSocketList?.find(
    (socketId) => socketToRoomId.get(socketId) === room.roomId
  );
  const answer = quizItemList[room.quizIndices[room.currentRound - 1]].answer;

  const newGameState = {
    state: 'readyRound',
    currentRound: room.currentRound,
    turn: room.turn
  };

  return {
    nextPlayerSocketId,
    answer,
    newGameState
  };
};

const startRound = (room: Room) => {
  const [nextTurnIdx, nextPlayer] = getNextPlayer(room);
  if (nextPlayer) {
    const { nextPlayerSocketId, answer, newGameState } = setRoomStateForNextRound(
      room,
      nextTurnIdx,
      nextPlayer
    );

    if (nextPlayerSocketId) {
      io.to(nextPlayerSocketId).emit('onRoundReady', { ...newGameState, answer });
      io.to(room.roomId).except(nextPlayerSocketId).emit('onRoundReady', newGameState);

      setTimeout(() => {
        const rooom = rooms.get(room.roomId);
        if (rooom) {
          rooom.state = 'play';
          io.to(rooom.roomId).emit('onRoundStarted', {
            state: 'play',
            currentRound: rooom.currentRound,
            turn: rooom.turn
          });
        }
      }, 3000);
    } else {
      console.log('플레이어 정보가 소멸되었습니다. (startRound)');
      io.to(room.roomId).emit('onError', { message: '플레이어 정보가 소멸되었습니다.' });
      return;
    }
  } else {
    console.log('플레이어가 존재하지 않습니다. (startRound)');
    io.to(room.roomId).emit('onError', { message: '플레이어가 존재하지 않습니다.' });
    return;
  }
};

const endGame = (room: Room) => {
  const playerList = (room.players.filter((player) => player !== null) as Player[]).sort((a, b) =>
    a.answerCnt < b.answerCnt ? 1 : -1
  );
  const result = playerList.reduce<{ rank: number; name: string; answerCnt: number }[]>(
    (pre, cur, idx) => {
      if (idx === 0) {
        pre.push({ rank: 1, name: cur.name, answerCnt: cur.answerCnt });
      } else {
        if (pre[pre.length - 1].answerCnt === cur.answerCnt) {
          pre.push({ rank: pre[pre.length - 1].rank, name: cur.name, answerCnt: cur.answerCnt });
        } else {
          pre.push({ rank: idx + 1, name: cur.name, answerCnt: cur.answerCnt });
        }
      }
      return pre;
    },
    []
  );

  room.state = 'ready';
  for (let i = 0; i < 6; i++) {
    const player = room.players[i];
    if (player !== null) {
      player.answerCnt = 0;
    }
  }
  room.quizIndices = [];
  room.currentRound = 0;
  room.turn = undefined;

  const newGameState = {
    state: 'end',
    currentRound: 0,
    turn: undefined
  };

  io.to(room.roomId).emit('onGameEnded', { result, newGameState });
};

io.on('connection', (socket) => {
  socketToUUID.set(socket.id, undefined);

  // 1. 비정상 접근
  socket.on('initUserState', () => {});

  // 2. 사용자 정보 저장 - 완료
  socket.on('saveUser', ({ uuid }) => {
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
      players: Array.from({ length: 6 }, () => null),
      master: { name: playerName, uuid },
      quizIndices: [],
      currentRound: 0,
      kickedUserUUIDList: [],
      state: 'ready'
    };

    room.players[0] = { name: playerName, uuid, isMaster: true, answerCnt: 0, isReady: true };
    rooms.set(roomId, room);

    uuidToRoomId.set(uuid, roomId);
    socketToRoomId.set(socket.id, roomId);
    socket.emit('onRoomCreated', roomId);
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

  // 6. 방 입장 시도 - 완료
  socket.on('tryEnterRoom', ({ uuid, playerName, roomId }) => {
    // 게임 방이 존재하는지
    const room = rooms.get(roomId);
    if (!room) {
      socket.emit('onError', { message: '존재하지 않는 방입니다.' });
      return;
    }

    // 게임 진행중인 방
    if (room.state !== 'ready') {
      socket.emit('onError', { message: '이미 게임이 진행되고 있는 방입니다.' });
      return;
    }

    // 게임 방의 인원수가 가득 차있는지
    if (room.players.filter((player) => player === null).length === 0) {
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
    const emptyIdx = room.players.findIndex((player) => player === null);
    if (emptyIdx >= 0) {
      room.players[emptyIdx] = {
        name: playerName,
        uuid,
        isMaster: room.master.uuid === uuid,
        answerCnt: 0,
        isReady: false
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
      master: room.master,
      players: room.players,
      currentRound: room.currentRound,
      state: room.state,
      turn: room.turn
    }); // 받으면 클라이언트에서 알아서 잘 쓰기
    socket.to(roomId).emit('onPlayerRefreshed', room.players);
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

    // 방장이면 - 방 폭파
    if (room.master.uuid === uuid) {
      rooms.delete(roomId);
      uuidToRoomId.delete(uuid);
      socketToRoomId.delete(socket.id);
      socket.join(CHAT_CHANNEL);

      socket.to(roomId).emit('onMasterLeftRoom'); // 방장 빼고 emit
      io.socketsLeave(roomId);
    }
    // 방장 아니면 - 플레이어 최신화
    else {
      const playerIdx = room.players.findIndex((player) => player?.uuid === uuid);
      if (playerIdx >= 0) {
        room.players[playerIdx] = null;
      }
      io.to(roomId).emit('onPlayerRefreshed', room.players);
    }
  });

  // 추가 필요: 모든 사용자가 준비 완료 되었을 때 시작 가능하도록
  // 9. 게임 시작 - 완료
  socket.on('startGame', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room) {
      socket.emit('onError', { message: '존재하지 않는 방입니다.' });
      return;
    }
    room.state = 'start';
    room.quizIndices = getQuizIndices(quizItemList.length);
    for (let i = 0; i < 6; i++) {
      const player = room.players[i];
      if (player) {
        player.isReady = false;
      }
    }
    io.to(roomId).emit('onGameStarted', {
      state: room.state,
      currentRound: room.currentRound,
      turn: room.turn
    });

    setTimeout(() => {
      const room = rooms.get(roomId);
      if (!room) {
        console.log('방이 없어요 - startGame (timeout)');
        socket.emit('onError', { message: '존재하지 않는 방입니다.' });
        return;
      }
      startRound(room);
    }, 3000);
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
      const question = quizItemList[room.quizIndices[currentRound - 1]];

      if (question.answer === message) {
        const player = room.players.find((player) => player?.uuid === uuid);
        if (player && player !== null) {
          player.answerCnt++;
        }
        room.state = 'interval';
        io.to(roomId).emit('onRoundEnded', {
          answer: question.answer,
          winPlayer: player,
          state: room.state,
          currentRound: room.currentRound,
          turn: room.turn
        });

        setTimeout(() => {
          const room = rooms.get(roomId);
          if (!room) {
            socket.emit('onError', { message: '존재하지 않는 방입니다.' });
            return;
          }
          if (room.currentRound === ROUND_NUM) {
            endGame(room);
          } else {
            startRound(room);
          }
        }, 3000);
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

  // 14. 그림 데이터 전송 - 완료
  socket.on('submitPaint', ({ uuid, roomId, pointList }) => {
    const room = rooms.get(roomId);
    if (!room) {
      socket.emit('onError', { message: '존재하지 않는 방입니다.' });
      return;
    }

    if (room.turn?.uuid !== uuid) {
      return;
    }

    if (room.state !== 'play') {
      return;
    }

    io.to(roomId).emit('onDraw', pointList);
  });

  // 16. 사용자 추방 - 완료
  socket.on('kickUser', ({ roomId, kicekdUUID }) => {
    const room = rooms.get(roomId);
    if (!room) {
      socket.emit('onError', { message: '존재하지 않는 방입니다.' });
      return;
    }

    const kickedUserSocketList = UUIDToSocketList.get(kicekdUUID);
    const kickedUserSocketId = kickedUserSocketList?.find(
      (socketId) => socketToRoomId.get(socketId) === roomId
    );

    if (kickedUserSocketId) {
      room.kickedUserUUIDList.push(kicekdUUID);
      io.to(kickedUserSocketId).emit('onKicked');
    }
  });

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
          const playerIdx = room.players.findIndex((player) => player?.uuid === uuid);
          if (playerIdx >= 0) {
            room.players[playerIdx] = null;
          }
          io.to(room.roomId).emit('onPlayerRefreshed', room.players);
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
