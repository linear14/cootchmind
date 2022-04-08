import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';

import GameBoard from 'components/GameBoard';
import PlayerList from 'components/PlayerList';
import { getUser } from 'helpers/authUtil';
import { SocketContext } from 'context/socket';

const Container = styled.div`
  width: 100%;
  height: 100%;
  background: #203d20;

  display: flex;
`;

const GamePage = () => {
  const [isLoading, setLoading] = useState(true);
  const socket = useContext(SocketContext);
  const navigate = useNavigate();
  const { roomId } = useParams();

  useEffect(() => {
    const [playerName, uuid] = getUser();
    if (!playerName || !uuid) {
      navigate('/login', { replace: true });
      return;
    }
    setLoading(false);
  }, [navigate]);

  useEffect(() => {
    if (socket) {
      socket.on('onPlayerRefreshed', (users) => {
        console.log(users);
      });
    }
    return () => {
      socket.off('onPlayerRefreshed');
    };
  }, [socket]);

  useEffect(() => {
    const [playerName, uuid] = getUser();
    if (socket && roomId && playerName && uuid) {
      socket.emit('enterGameRoom', { roomId, playerName, uuid });

      return () => {
        socket.emit('leaveGameRoom', { roomId, playerName, uuid });
      };
    }
  }, [socket, roomId]);

  if (isLoading) return null;

  return (
    <Container>
      <PlayerList />
      <GameBoard />
      <PlayerList />
    </Container>
  );
};

export default GamePage;
