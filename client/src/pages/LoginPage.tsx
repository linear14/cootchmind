import styled from 'styled-components';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import PlayerNameInput from 'components/PlayerNameInput';
import { getLocalStorageUser } from 'helpers/authUtil';
import { UserContext } from 'context/user';

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
  const { setUser } = useContext(UserContext);

  useEffect(() => {
    const { playerName, uuid } = getLocalStorageUser();
    if (playerName && uuid) {
      setUser({ uuid, playerName });
      navigate('/', { replace: true });
      return;
    }
    setLoading(false);
  }, [navigate, setUser]);

  if (isLoading) return null;

  return (
    <Container>
      <PlayerNameInput />
    </Container>
  );
};

export default LoginPage;
