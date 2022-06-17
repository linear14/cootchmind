import { useEffect, useRef } from 'react';
import styled from 'styled-components';

import ModalPortal from 'wrapper/ModalPortal';

const Container = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

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
    font-weight: bold;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  p {
    font-size: 14px;
  }

  input {
    height: 2rem;
    line-height: 2rem;
  }
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 1rem;
`;

const Button = styled.button`
  flex: 1;
  height: 36px;
  text-align: center;
  border: 1px solid black;
  cursor: pointer;

  display: flex;
  justify-content: center;
  align-items: center;
`;

interface RoomGeneratorProps {
  onGenerate: (title?: string) => void;
  onClose: () => void;
}

const RoomGeneratorModal = ({ onGenerate, onClose }: RoomGeneratorProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const generateRoom = (e: React.FormEvent) => {
    e.preventDefault();

    const title = inputRef.current?.value;
    if (title && title.trim()) {
      onGenerate(title.trim());
    }
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <ModalPortal>
      <Container>
        <Content>
          <h2>방 만들기</h2>
          <Form onSubmit={generateRoom}>
            <p>방 제목</p>
            <input ref={inputRef} placeholder='방 제목을 입력해주세요' />
          </Form>
          <ButtonsContainer>
            <Button type='button' onClick={generateRoom}>
              방 만들기
            </Button>
            <Button type='button' onClick={onClose}>
              닫기
            </Button>
          </ButtonsContainer>
        </Content>
      </Container>
    </ModalPortal>
  );
};

export default RoomGeneratorModal;
