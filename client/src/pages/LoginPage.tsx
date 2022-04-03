import styled from 'styled-components';
import PlayerNameInput from 'components/PlayerNameInput';

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const LoginPage = () => {
  return (
    <Container>
      <PlayerNameInput />
    </Container>
  );
};

export default LoginPage;
