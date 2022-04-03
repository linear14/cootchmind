import styled from 'styled-components';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import PlayerNameInput from 'components/PlayerNameInput';

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const LoginPage = () => {
  const [isLoading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const playerName = localStorage.getItem('player-name');
    if (playerName) {
      navigate('/', { replace: true });
      return;
    }
    setLoading(false);
  }, [navigate]);

  if (isLoading) return null;

  return (
    <Container>
      <PlayerNameInput />
    </Container>
  );
};

export default LoginPage;
