import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

import GameBoard from 'components/GameBoard';
import PlayerList from 'components/PlayerList';

const Container = styled.div`
  width: 100%;
  height: 100%;
  background: #203d20;

  display: flex;
`;

const GamePage = () => {
  const [isLoading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const playerName = localStorage.getItem('player-name');
    if (!playerName) {
      navigate('/login', { replace: true });
      return;
    }
    setLoading(false);
  }, [navigate]);

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
