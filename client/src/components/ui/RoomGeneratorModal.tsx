import { useCallback, useEffect, useRef, useState } from 'react';
import styled, { css } from 'styled-components';

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
  height: 320px;
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

const LevelWrap = styled.div`
  margin-top: 0.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
`;

const Level = styled.div<{ active: boolean }>`
  padding: 0.5rem;
  border: 1px solid black;
  cursor: pointer;

  ${({ active }) =>
    active
      ? css`
          color: white;
          background-color: black;
        `
      : css`
          color: black;
          background-color: white;
        `}
`;

const Description = styled.div`
  font-size: 14px;
  color: #aaaaaa;
  justify-self: center;
  white-space: pre-wrap;
  line-height: 1.25;
  text-align: center;
`;

interface RoomGeneratorProps {
  onGenerate: (title: string, level: number) => void;
  onClose: () => void;
}

const RoomGeneratorModal = ({ onGenerate, onClose }: RoomGeneratorProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [level, setLevel] = useState<number>(1);

  const generateRoom = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const title = inputRef.current?.value;
      if (title && title.trim()) {
        onGenerate(title.trim(), level);
      }
    },
    [level, onGenerate]
  );

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <ModalPortal>
      <Container>
        <Content>
          <h2>??? ?????????</h2>
          <Form onSubmit={generateRoom}>
            <p>??? ??????</p>
            <input type='text' ref={inputRef} placeholder='??? ????????? ??????????????????' maxLength={20} />
            <LevelWrap>
              <Level active={level === 1} onClick={() => setLevel(1)}>
                ??????
              </Level>
              <Level active={level === 2} onClick={() => setLevel(2)}>
                ??????
              </Level>
              <Level active={level === 3} onClick={() => setLevel(3)}>
                ?????????
              </Level>
            </LevelWrap>
            <Description>
              {level === 1
                ? `?????????, ?????? ?????? ?????? ???????????? ???????????????.\n??? 200??? ????????? ?????????`
                : level === 2
                ? '(??????) ???, ????????? ???????????????.\n??? 400??? ????????? ?????????'
                : `??? ????????? ???????????????.\n??? 600??? ????????? ?????????`}
            </Description>
          </Form>
          <ButtonsContainer>
            <Button type='button' onClick={generateRoom}>
              ??? ?????????
            </Button>
            <Button type='button' onClick={onClose}>
              ??????
            </Button>
          </ButtonsContainer>
        </Content>
      </Container>
    </ModalPortal>
  );
};

export default RoomGeneratorModal;
