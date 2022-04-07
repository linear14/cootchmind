import styled from 'styled-components';

const Container = styled.div`
  width: calc(90vh * 1.35);
  min-width: calc(660px * 1.35);
  max-width: calc(870px * 1.35);
  height: 90vh;
  min-height: 660px;
  max-height: 870px;
  margin: 36px auto 0px;
  background-color: rgba(0, 0, 0, 0.4);

  display: flex;
  justify-content: center;
  align-items: center;
`;

const Content = styled.div`
  width: 400px;
  height: 280px;
  background: white;
  border: 1px solid black;
  padding: 1rem;

  display: flex;
  flex-direction: column;
  justify-content: space-between;

  h2 {
    text-align: center;
    font-size: 1.5rem;
    line-height: 1.5rem;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  input {
    height: 2rem;
    line-height: 2rem;
  }
`;

const Buttons = styled.div`
  display: flex;
  gap: 1rem;
`;

const GenerateRoomButton = styled.button`
  flex: 1;
  height: 36px;
  line-height: 36px;
  text-align: center;
  border: 1px solid black;
  cursor: pointer;

  &::after {
    content: '방 만들기';
  }
`;

const CloseButton = styled.button`
  flex: 1;
  height: 36px;
  line-height: 36px;
  text-align: center;
  border: 1px solid black;
  cursor: pointer;

  &::after {
    content: '닫기';
  }
`;

interface RoomGeneratorProps {
  onClose: () => void;
}

const RoomGeneratorModal = ({ onClose }: RoomGeneratorProps) => {
  const generateRoom = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <Container>
      <Content>
        <h2>방 만들기</h2>
        <Form onSubmit={generateRoom}>
          <p>방 제목</p>
          <input placeholder='방 제목을 입력해주세요' />
        </Form>
        <Buttons>
          <GenerateRoomButton onClick={generateRoom} />
          <CloseButton onClick={onClose} />
        </Buttons>
      </Content>
    </Container>
  );
};

export default RoomGeneratorModal;
