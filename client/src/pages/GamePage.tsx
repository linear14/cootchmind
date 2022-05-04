import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useContext, useCallback } from 'react';

import GameBoard from 'components/GameBoard';
import PlayerList from 'components/PlayerList';
import { getLocalStorageUser } from 'helpers/authUtil';
import { SocketContext } from 'context/socket';
import { Room, RoomDataImmutable, RoomGameState } from 'types/room';
import { UserContext } from 'context/user';
import { Player } from 'types/player';
import { User } from 'types/user';

const Container = styled.div`
  width: 100%;
  height: 100%;
  background: #203d20;

  display: flex;
`;

const GameStartButton = styled.div`
  position: absolute;
  width: 240px;
  height: 48px;
  line-height: 48px;
  top: 30%;
  left: 50%;
  transform: translateX(-50%);

  text-align: center;
  border: 1px solid black;
  cursor: pointer;

  &::after {
    content: '게임 시작하기';
  }
`;

const GamePage = () => {
  const { roomId } = useParams();
  const [playerList, setPlayerList] = useState<(Player | null)[]>(
    Array.from({ length: 6 }, () => null)
  );
  const [gameState, setGameState] = useState<RoomGameState>();
  const [room, setRoom] = useState<RoomDataImmutable>();
  const [answer, setAnswer] = useState<string>();

  const { uuid, playerName } = useContext(UserContext);
  const [isLoading, setLoading] = useState(true);
  const socket = useContext(SocketContext);
  const navigate = useNavigate();

  const isGameAvailable = useCallback(() => {
    if (!room) return false;
    return (
      gameState?.state === 'ready' &&
      room.master.uuid === uuid &&
      playerList.filter((player) => player !== null).length >= 2
    );
  }, [room, uuid, gameState, playerList]);

  const startGame = useCallback(() => {
    if (socket && roomId) {
      socket.emit('startGame', { roomId });
    }
  }, [socket, roomId]);

  const getTurnIndex = useCallback(
    (indices: number[]): number | undefined => {
      if (!gameState || !gameState.turn) {
        return undefined;
      }

      for (let i = 0; i < indices.length; i++) {
        if (gameState.turn.idx === indices[i]) {
          return i;
        }
      }
      return undefined;
    },
    [gameState]
  );

  /**
   * 페이지 접근 시 로그인 상태 확인
   * 1. 로그인 안되어 있는 경우 -> login 페이지로 이동
   * 2. 로그인 되어있는 경우 -> Loading 플래그를 false로 바꿔주기
   **/
  useEffect(() => {
    const { uuid, playerName } = getLocalStorageUser();
    if (!playerName || !uuid) {
      navigate('/login', { replace: true });
      return;
    }
  }, [navigate, playerName, uuid]);

  // 방 입장 (from url / from previous page)시 정상적으로 접속했는지 여부 판단하는 이벤트 발생
  // 방 퇴장시 이벤트 발생
  useEffect(() => {
    if (socket && roomId && playerName && uuid) {
      socket.emit('enterRoom', { uuid, roomId });

      return () => {
        socket.emit('leaveRoom', { uuid, roomId });
      };
    }
  }, [socket, roomId, playerName, uuid]);

  // [이벤트 등록] 방에 성공적으로 입장했을 경우 발생하는 이벤트
  useEffect(() => {
    if (socket) {
      socket.on('onRoomEntered', (room: Room) => {
        const roomDataImmutable = {
          roomId: room.roomId,
          title: room.title,
          master: room.master as Required<User>
        };
        const gameState = {
          state: room.state,
          currentRound: room.currentRound,
          turn: room.turn
        };
        setRoom(roomDataImmutable);
        setGameState(gameState);
        setLoading(false);
      });
    }
    return () => {
      socket.off('onRoomEntered');
    };
  }, [socket]);

  // [이벤트 등록] 플레이어 변동이 있을 경우에 발생하는 이벤트
  useEffect(() => {
    if (socket) {
      socket.on('onPlayerRefreshed', (players: (Player | null)[]) => {
        setPlayerList(players);
      });
    }
    return () => {
      socket.off('onPlayerRefreshed');
    };
  }, [socket]);

  // [이벤트 등록] 새로운 게임이 시작 되었을 때 발생하는 이벤트
  // prev game state가 undefined이면 어떻게하지?
  useEffect(() => {
    if (socket) {
      socket.on('onGameStarted', ({ state }) => {
        setGameState((prev) => {
          if (prev) {
            return { ...prev, state };
          }
        });
      });
    }

    return () => {
      socket.off('onGameStart');
    };
  }, [socket]);

  // [이벤트 등록] 새로운 라운드가 시작 되었을 때 발생하는 이벤트
  useEffect(() => {
    if (socket) {
      socket.on('onRoundStarted', ({ state, currentRound, turn, answer }) => {
        setGameState({
          state,
          currentRound,
          turn
        });
        setAnswer(answer);
      });

      return () => {
        socket.off('onRoundStarted');
      };
    }
  }, [socket]);

  // [이벤트 등록] 해당 라운드가 종료 되었을 때 발생하는 이벤트
  // prev game state가 undefined이면 어떻게하지?
  useEffect(() => {
    if (socket) {
      socket.on('onRoundEnded', ({ answer, winPlayer, state }) => {
        setGameState((prev) => {
          if (prev) {
            return { ...prev, state };
          }
        });
        // if (room.master.uuid === uuid) {
        //   setTimeout(() => {
        //     socket.emit('roundStart', { roomId });
        //   }, 3000);
        // }
      });

      return () => {
        socket.off('onRoundEnd');
      };
    }
  }, [socket]);

  // [이벤트 등록] 방장이 방을 나가는 경우 - 방 폭파
  useEffect(() => {
    if (socket) {
      socket.on('onMasterLeftRoom', () => {
        navigate('/', { replace: true });
      });

      return () => {
        socket.off('onMasterLeftRoom');
      };
    }
  }, [socket, navigate]);

  if (isLoading) return null;

  return (
    <Container>
      {room && (
        <PlayerList
          listItem={[playerList[0], playerList[2], playerList[4]]}
          turnIndex={
            gameState?.state === 'play' && gameState?.turn ? getTurnIndex([0, 2, 4]) : undefined
          }
        />
      )}
      <GameBoard roomId={roomId} />
      {isGameAvailable() && <GameStartButton onClick={startGame} />}
      {room && (
        <PlayerList
          listItem={[playerList[1], playerList[3], playerList[5]]}
          turnIndex={
            gameState?.state === 'play' && gameState?.turn ? getTurnIndex([1, 3, 5]) : undefined
          }
        />
      )}
    </Container>
  );
};

export default GamePage;
