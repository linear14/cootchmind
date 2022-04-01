import styled from 'styled-components';
import NameInput from 'components/NameInput';

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
      <NameInput />
    </Container>
  );
};

export default LoginPage;
