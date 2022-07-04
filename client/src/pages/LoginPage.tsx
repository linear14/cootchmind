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
  const navigate = useNavigate();

  const [isLoading, setLoading] = useState(true);
  const { setName } = useContext(UserContext);

  useEffect(() => {
    const { name } = getLocalStorageUser();
    if (name) {
      navigate('/', { replace: true });
      return;
    }
    setLoading(false);
  }, [navigate, setName]);

  if (isLoading) return null;

  return (
    <Container>
      <PlayerNameInput />
    </Container>
  );
};

export default LoginPage;
