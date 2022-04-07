import styled from 'styled-components';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import PlayerNameInput from 'components/PlayerNameInput';
import { getUser } from 'helpers/authUtil';

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
    const [playerName, uuid] = getUser();
    if (playerName && uuid) {
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
