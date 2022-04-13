import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useContext, useMemo, useCallback } from 'react';

import GameBoard from 'components/GameBoard';
import PlayerList from 'components/PlayerList';
import { getUser } from 'helpers/authUtil';
import { SocketContext } from 'context/socket';
import { Room } from 'types/room';

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

// useMemo쓰면 uuid가 고정 아닐까?
const GamePage = () => {
  const [isLoading, setLoading] = useState(true);
  const [room, setRoom] = useState<Room>();
  const socket = useContext(SocketContext);
  const navigate = useNavigate();
  const { roomId } = useParams();
  const [playerName, uuid] = useMemo(() => getUser(), []);

  const isGameAvailable = useCallback(() => {
    if (!room) return false;
    return (
      room.state === 'ready' &&
      room.master.uuid === uuid &&
      room.users.filter((user) => user !== null).length >= 2
    );
  }, [room, uuid]);

  const startGame = useCallback(() => {
    if (socket && roomId) {
      socket.emit('gameStart', { roomId });
    }
  }, [socket, roomId]);

  const getTurnIndex = useCallback(
    (indices: number[]): number | undefined => {
      if (!room || !room.turn) {
        return undefined;
      }

      for (let i = 0; i < indices.length; i++) {
        if (room.turn.idx === indices[i]) {
          return i;
        }
      }
      return undefined;
    },
    [room]
  );

  useEffect(() => {
    if (!playerName || !uuid) {
      navigate('/login', { replace: true });
      return;
    }
    setLoading(false);
  }, [navigate, playerName, uuid]);

  useEffect(() => {
    if (socket) {
      socket.on('onPlayerRefreshed', (users) => {
        setRoom((prev) => {
          if (prev) {
            return { ...prev, users };
          } else {
            return prev;
          }
        });
      });

      socket.on('onEnteredGameRoom', (room) => {
        setRoom(room);
      });

      socket.on('onRoundStart', (room) => {
        setRoom(room);
      });

      return () => {
        socket.off('onPlayerRefreshed');
        socket.off('onEnteredGameRoom');
        socket.off('onRoundStart');
      };
    }
  }, [socket]);

  useEffect(() => {
    if (socket && roomId && playerName && uuid) {
      socket.emit('enterGameRoom', { roomId, playerName, uuid });

      return () => {
        socket.emit('leaveGameRoom', { roomId, playerName, uuid });
      };
    }
  }, [socket, roomId, playerName, uuid]);

  useEffect(() => {
    if (socket && uuid && roomId) {
      socket.on('onGameStart', (room: Room) => {
        setRoom(room);

        // 원래는 시작 전 출제자를 보여주기를 요청하는 socket이 필요함 (prepareRound)
        if (room.master.uuid === uuid) {
          socket.emit('roundStart', { roomId });
        }
      });

      socket.on('onRoundEnd', (room: Room) => {
        setRoom(room);

        if (room.master.uuid === uuid) {
          setTimeout(() => {
            socket.emit('roundStart', { roomId });
          }, 3000);
        }
      });

      return () => {
        socket.off('onGameStart');
        socket.off('onRoundEnd');
      };
    }
  }, [socket, uuid, roomId]);

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
          listItem={[room.users[0], room.users[2], room.users[4]]}
          turnIndex={room.state === 'play' && room.turn ? getTurnIndex([0, 2, 4]) : undefined}
        />
      )}
      <GameBoard roomId={roomId} />
      {isGameAvailable() && <GameStartButton onClick={startGame} />}
      {room && (
        <PlayerList
          listItem={[room.users[1], room.users[3], room.users[5]]}
          turnIndex={room.state === 'play' && room.turn ? getTurnIndex([1, 3, 5]) : undefined}
        />
      )}
    </Container>
  );
};

export default GamePage;
