import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';

import GameBoard from 'components/GameBoard';
import PlayerList from 'components/PlayerList';
import { getUser } from 'helpers/authUtil';
import { SocketContext } from 'context/socket';
import { Player } from 'types/player';

const Container = styled.div`
  width: 100%;
  height: 100%;
  background: #203d20;

  display: flex;
`;

const GamePage = () => {
  const [isLoading, setLoading] = useState(true);
  const [playerList, setPlayerList] = useState<(Player | null)[]>([]);
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
        setPlayerList(users);
      });

      return () => {
        socket.off('onPlayerRefreshed');
      };
    }
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
      <PlayerList listItem={[playerList[0], playerList[2], playerList[4]]} />
      <GameBoard />
      <PlayerList listItem={[playerList[1], playerList[3], playerList[5]]} />
    </Container>
  );
};

export default GamePage;
