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
    return room.master.uuid === uuid && room.users.filter((user) => user !== null).length >= 2;
  }, [room, uuid]);

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

      return () => {
        socket.off('onPlayerRefreshed');
        socket.off('onEnteredGameRoom');
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
      {room && <PlayerList listItem={[room.users[0], room.users[2], room.users[4]]} />}
      <GameBoard />
      {isGameAvailable() && <GameStartButton />}
      {room && <PlayerList listItem={[room.users[1], room.users[3], room.users[5]]} />}
    </Container>
  );
};

export default GamePage;
