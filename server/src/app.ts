import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { Player } from 'types/player';
import { Room } from 'types/room';
import { quizItemList } from './data/quiz';
import { getQuizIndices } from './helpers/gameUtil';
import cron from 'node-cron';
import dotenv from 'dotenv';

if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: '.env.production' });
} else {
  dotenv.config({ path: '.env.development' });
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN
  }
});

const ROUND_NUM = 12;
const CHAT_CHANNEL = 'chat_channel';
const rooms = new Map<string, Room>();

const playerExists = (player: Player | null) => {
  return player !== null && !player.isOut;
};

const getNextPlayer = (room: Room): [number, Player | null] => {
  // 다음 턴 유저 결정
  let nextTurnDecided = false;
  let nextTurnIdx = room.turn ? (room.turn.idx + 1) % 6 : 0;
  for (let i = nextTurnIdx; i < 6; i++) {
    if (playerExists(room.players[i])) {
      nextTurnIdx = i;
      nextTurnDecided = true;
      break;
    }
  }
  if (!nextTurnDecided) {
    for (let i = 0; i < nextTurnIdx; i++) {
      if (playerExists(room.players[i])) {
        nextTurnIdx = i;
        break;
      }
    }
  }

  return [nextTurnIdx, room.players[nextTurnIdx]];
};

const getPlayerIdx = (room: Room, socketId: string) => {
  return room.players.findIndex((player) => player?.socketId === socketId);
};

const getTurn = (room: Room, socketId: string) => {
  return room.players.find((player) => player?.socketId === socketId)?.turn;
};

const setRoomStateForNextRound = (room: Room, nextTurnIdx: number, nextPlayer: Player) => {
  room.state = 'readyRound';
  room.currentRound = room.currentRound + 1;
  room.turn = { name: nextPlayer.name, socketId: nextPlayer.socketId, idx: nextTurnIdx };

  const nextPlayerSocketId = nextPlayer.socketId;
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
        if (rooom && rooom.state === 'readyRound' && rooom.intervalReason !== 'needPlayer') {
          rooom.state = 'play';
          rooom.intervalReason = undefined;
          io.to(rooom.roomId).emit('onRoundStarted', {
            state: 'play',
            currentRound: rooom.currentRound,
            turn: rooom.turn
          });
        }
      }, 3000);
    } else {
      io.to(room.roomId).emit('onError', { message: '플레이어 정보가 소멸되었습니다.' });
      return;
    }
  } else {
    io.to(room.roomId).emit('onError', { message: '플레이어가 존재하지 않습니다.' });
    return;
  }
};

const endGame = (room: Room) => {
  const playerList = (room.players.filter((player) => player !== null) as Player[]).sort((a, b) =>
    a.answerCnt < b.answerCnt ? 1 : -1
  );
  const result = playerList.reduce<
    { rank: number; name: string; answerCnt: number; isOut: boolean }[]
  >((pre, cur, idx) => {
    if (idx === 0) {
      pre.push({ rank: 1, name: cur.name, answerCnt: cur.answerCnt, isOut: cur.isOut });
    } else {
      if (pre[pre.length - 1].answerCnt === cur.answerCnt) {
        pre.push({
          rank: pre[pre.length - 1].rank,
          name: cur.name,
          answerCnt: cur.answerCnt,
          isOut: cur.isOut
        });
      } else {
        pre.push({ rank: idx + 1, name: cur.name, answerCnt: cur.answerCnt, isOut: cur.isOut });
      }
    }
    return pre;
  }, []);

  room.state = 'ready';
  room.intervalReason = undefined;
  for (let i = 0; i < 6; i++) {
    const player = room.players[i];
    if (player !== null) {
      player.answerCnt = 0;

      if (player.isOut) {
        room.players[i] = null;
      }
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

  io.to(room.roomId).emit('onGameEnded', { result, newGameState, players: room.players });
};

const updateGameStateIfNowPlaying = (socketId: string, roomId: string, room: Room) => {
  if (
    room.state === 'readyRound' ||
    room.state === 'interval' ||
    room.state === 'play' ||
    room.state === 'start'
  ) {
    // 게임 참여 인원이 1명이라면?
    if (room.players.filter((player) => playerExists(player)).length < 2) {
      room.lastUpdated = Date.now();
      room.state = 'interval';
      room.intervalReason = 'needPlayer';

      io.to(roomId).emit('onRoundEnded', {
        state: 'interval',
        currentRound: room.currentRound,
        turn: room.turn,
        error: '게임에 참여하는 인원이 2명 미만이기 때문에 게임을 종료합니다.'
      });
      setTimeout(() => {
        const room = rooms.get(roomId);
        if (room && room.state === 'interval' && room.intervalReason === 'needPlayer') {
          endGame(room);
        }
      }, 3000);
    }
    // 그림 그리고 있던 사람이 나가는 경우?
    else if (
      (room.state === 'readyRound' || room.state === 'play') &&
      room.turn?.socketId === socketId
    ) {
      room.lastUpdated = Date.now();
      room.state = 'interval';
      room.intervalReason = 'noPainter';

      io.to(roomId).emit('onRoundEnded', {
        state: 'interval',
        currentRound: room.currentRound,
        turn: room.turn,
        error: '그림을 그려야하는 유저가 게임을 나갔습니다. 다음 라운드를 준비합니다.'
      });
      setTimeout(() => {
        const room = rooms.get(roomId);
        if (room && room.state === 'interval' && room.intervalReason === 'noPainter') {
          if (room.currentRound === ROUND_NUM) {
            endGame(room);
          } else {
            startRound(room);
          }
        }
      }, 3000);
    }
  }
};

const deleteRoom = (room: Room, masterSocketId: string) => {
  const roomId = room.roomId;

  rooms.delete(roomId);
  io.to(roomId).except(masterSocketId).emit('onError', {
    message: '방장이 방을 나가 방이 제거되었습니다.',
    navigatePath: '/'
  });
  io.socketsLeave(roomId);
};

const leaveRoom = (room: Room, userSocketId: string) => {
  room.socketIdSet.delete(userSocketId);
  const playerIdx = getPlayerIdx(room, userSocketId);
  if (playerIdx >= 0) {
    const player = room.players[playerIdx];
    if (player) {
      if (room.state === 'ready') {
        room.players[playerIdx] = null;
      } else {
        player.isOut = true;
      }
    }
  }
  io.to(room.roomId).emit('onPlayerRefreshed', room.players);
};

io.on('connection', (socket) => {
  // 1. 사용자 정보 저장
  socket.on('joinChatChannel', () => {
    socket.join(CHAT_CHANNEL);

    const room = rooms.get(socket.id);
    if (room) {
      socket.leave(room.roomId);
    }
  });

  // 2. 대기실 채팅
  socket.on('chat', ({ name, message }) => {
    io.to(CHAT_CHANNEL).emit('onChat', { name, message });
  });

  // 3. 방 생성
  socket.on('createRoom', ({ name, title, level }) => {
    if (rooms.size >= 10) {
      socket.emit('onError', {
        message: '더이상 생성할 수 있는 방이 없습니다.\n(서버 내에서 최대 10개)'
      });
      return;
    }

    const roomId = Date.now().toString();
    const room: Room = {
      roomId,
      title,
      players: Array.from({ length: 6 }, () => null),
      master: { name, socketId: socket.id },
      quizIndices: [],
      currentRound: 0,
      state: 'ready',
      level,
      lastUpdated: Date.now(),
      socketIdSet: new Set<string>()
    };

    room.players[0] = {
      name,
      socketId: socket.id,
      isMaster: true,
      answerCnt: 0,
      isOut: false,
      turn: 1
    };
    room.socketIdSet.add(socket.id);
    rooms.set(roomId, room);
    socket.emit('onRoomCreated', roomId);
  });

  // 4. 방 조회
  socket.on('refreshRoomList', () => {
    const currentRoom = Array.from(rooms.values());
    const parsedRoom = currentRoom.map((room) => ({
      roomId: room.roomId,
      title: room.title,
      masterName: room.master.name,
      currentRound: room.currentRound,
      level: room.level,
      state: room.state,
      userCount: room.players.filter((player) => playerExists(player)).length
    }));
    socket.emit('onRoomListRefreshed', parsedRoom);
  });

  // 5. 방 입장 시도
  socket.on('tryEnterRoom', ({ name, roomId }) => {
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

    // 동일 닉네임 유저 존재여부
    if (room.players.filter((player) => player?.name === name).length > 0) {
      socket.emit('onError', { message: '동일 닉네임의 유저가 이미 접속중입니다.' });
      return;
    }

    // 게임 방의 인원수가 가득 차있는지
    if (room.players.filter((player) => playerExists(player)).length === 6) {
      socket.emit('onError', { message: '이미 가득 찬 방입니다.' });
      return;
    }

    const emptyIdx = room.players.findIndex((player) => player === null);
    if (emptyIdx >= 0 && emptyIdx < 6) {
      room.players[emptyIdx] = {
        name,
        socketId: socket.id,
        isMaster: room.master.socketId === socket.id,
        answerCnt: 0,
        isOut: false,
        turn: emptyIdx + 1
      };

      room.socketIdSet.add(socket.id);
      socket.emit('onRoomJoined', roomId);
    } else {
      socket.emit('onError', { message: '이미 가득 찬 방입니다.' });
      return;
    }
  });

  // 6. 방 입장
  socket.on('enterRoom', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room) {
      socket.emit('onError', { message: '존재하지 않는 방입니다.' });
      return;
    }

    const myTurn = getTurn(room, socket.id);
    if (myTurn) {
      room.lastUpdated = Date.now();
      socket.leave(CHAT_CHANNEL);
      socket.join(roomId);

      socket.emit(
        'onRoomEntered',
        {
          roomId: room.roomId,
          title: room.title,
          master: room.master,
          players: room.players,
          currentRound: room.currentRound,
          state: room.state,
          turn: room.turn
        },
        myTurn
      );

      socket.to(roomId).emit('onPlayerRefreshed', room.players);
    }
  });

  // 7. 방 퇴장
  socket.on('leaveRoom', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (room) {
      socket.leave(roomId);
      socket.join(CHAT_CHANNEL);

      // 방장인 경우
      if (room.master.socketId === socket.id) {
        deleteRoom(room, socket.id);
      }
      // 방장이 아닌경우
      else {
        leaveRoom(room, socket.id);
        updateGameStateIfNowPlaying(socket.id, roomId, room);
      }
    }
  });

  // 8. 게임 시작
  socket.on('startGame', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room) {
      socket.emit('onError', { message: '존재하지 않는 방입니다.' });
      return;
    }
    room.lastUpdated = Date.now();
    room.state = 'start';
    room.quizIndices = getQuizIndices(room.level);

    io.to(roomId).emit('onGameStarted', {
      state: room.state,
      currentRound: room.currentRound,
      turn: room.turn
    });

    setTimeout(() => {
      const room = rooms.get(roomId);
      if (room && room.state === 'start') {
        startRound(room);
      }
    }, 3000);
  });

  // 9. 정답 전송
  socket.on('submitAnswer', ({ turn, roomId, message }) => {
    const room = rooms.get(roomId);
    if (!room) {
      socket.emit('onError', { message: '존재하지 않는 방입니다.' });
      return;
    }

    io.to(roomId).emit('onChatInGame', { turn, message });

    if (room.state === 'play') {
      const currentRound = room.currentRound;
      const question = quizItemList[room.quizIndices[currentRound - 1]];

      if (
        question.answer.replace(/(\s*)/g, '').toLowerCase() ===
        message.replace(/(\s*)/g, '').toLowerCase()
      ) {
        const player = room.players.find((player) => player?.socketId === socket.id);
        if (player && !player.isOut) {
          player.answerCnt++;
        }
        room.lastUpdated = Date.now();
        room.state = 'interval';
        room.intervalReason = 'default';
        io.to(roomId).emit('onRoundEnded', {
          answer: question.answer,
          winPlayer: player,
          state: room.state,
          currentRound: room.currentRound,
          turn: room.turn,
          players: room.players
        });

        setTimeout(() => {
          const room = rooms.get(roomId);
          if (room && room.state === 'interval' && room.intervalReason === 'default') {
            room.lastUpdated = Date.now();
            if (room.currentRound === ROUND_NUM) {
              endGame(room);
            } else {
              startRound(room);
            }
          }
        }, 3000);
      }
    }
  });

  // 10. 타이머 시간 초과 - 라운드 강제 종료
  socket.on('forceStopRound', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room) {
      socket.emit('onError', { message: '존재하지 않는 방입니다.' });
      return;
    }

    if (room.state === 'play') {
      const currentRound = room.currentRound;
      const question = quizItemList[room.quizIndices[currentRound - 1]];

      room.lastUpdated = Date.now();
      room.state = 'interval';
      room.intervalReason = 'default';

      io.to(roomId).emit('onRoundEnded', {
        answer: question.answer,
        winPlayer: null,
        state: room.state,
        currentRound: room.currentRound,
        turn: room.turn,
        players: room.players
      });

      setTimeout(() => {
        const room = rooms.get(roomId);
        if (room && room.state === 'interval' && room.intervalReason === 'default') {
          room.lastUpdated = Date.now();
          if (room.currentRound === ROUND_NUM) {
            endGame(room);
          } else {
            startRound(room);
          }
        }
      }, 3000);
    }
  });

  // 11. 게임 내 채팅
  socket.on('chatInGame', ({ turn, roomId, message }) => {
    const room = rooms.get(roomId);
    if (!room) {
      socket.emit('onError', { message: '존재하지 않는 방입니다.' });
      return;
    }
    io.to(roomId).emit('onChatInGame', { turn, message });
  });

  // 12. 그림 데이터 전송
  socket.on('submitPaint', ({ roomId, time, pointList }) => {
    const room = rooms.get(roomId);
    if (!room) {
      socket.emit('onError', { message: '존재하지 않는 방입니다.' });
      return;
    }

    if (room.turn?.socketId !== socket.id) {
      return;
    }

    if (room.state !== 'play') {
      return;
    }

    io.to(roomId).emit('onDraw', { time, pointList });
  });

  // 13. 그림 전체 지우기
  socket.on('clearPaint', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room) {
      socket.emit('onError', { message: '존재하지 않는 방입니다.' });
      return;
    }

    if (room.turn?.socketId !== socket.id) {
      return;
    }

    if (room.state !== 'play') {
      return;
    }

    io.to(roomId).except(socket.id).emit('onClearPaint');
  });

  // 14. disconnect
  socket.on('disconnect', () => {
    const room = rooms.get(socket.id);

    // 게임 중에 접속을 종료했다.
    if (room) {
      const roomId = room.roomId;
      socket.leave(roomId);
      socket.join(CHAT_CHANNEL);

      // 방장인 경우
      if (room.master.socketId === socket.id) {
        deleteRoom(room, socket.id);
      }
      // 방장이 아닌경우
      else {
        leaveRoom(room, socket.id);
        updateGameStateIfNowPlaying(socket.id, roomId, room);
      }
    }
  });

  server.listen('4000', () => {
    console.log('Socket server listening on port 4000');
  });

  cron.schedule('* * * * *', () => {
    const deleteRooms: Room[] = [];
    const now = Date.now();
    rooms.forEach((room) => {
      if (room.state === 'ready' && now - room.lastUpdated > 2 * 60 * 1000) {
        deleteRooms.push(room);
      }
    });

    deleteRooms.forEach((room) => {
      rooms.delete(room.roomId);
      io.to(room.roomId).emit('onError', {
        message: '일정 시간동안 방의 상태가 변하지 않아 방이 제거되었습니다.',
        navigatePath: '/'
      });
    });
  });
});
