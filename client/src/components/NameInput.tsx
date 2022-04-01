import styled from 'styled-components';

const Container = styled.div`
  width: 400px;

  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Input = styled.input`
  height: 36px;
  font-size: 16px;
  line-height: 36px;
`;

const StartButton = styled.button`
  height: 32px;
  font-size: 16px;

  &::after {
    content: '시작하기';
  }
`;

const NameInput = () => {
  return (
    <Container>
      <Input type='text' placeholder='게임에서 사용할 닉네임을 입력해주세요' />
      <StartButton />
    </Container>
  );
};

export default NameInput;
