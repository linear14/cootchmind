import { GameStateContext } from 'context/game';
import { RoomContext } from 'context/room';
import { SocketContext } from 'context/socket';
import { UserContext } from 'context/user';
import { useCallback, useContext, useRef } from 'react';
import styled from 'styled-components';

const Form = styled.form`
  position: relative;
  width: 40%;
  height: 32px;
  border: 1px solid black;
  padding: 0 0.5rem;
  align-self: center;

  input {
    width: 100%;
    height: 100%;
    outline: none;
    border: none;
  }
`;

const AnswerInput = () => {
  const socket = useContext(SocketContext);
  const { roomId } = useContext(RoomContext);
  const { uuid } = useContext(UserContext);
  const { state, turn } = useContext(GameStateContext);
  const inputRef = useRef<HTMLInputElement>(null);

  const sendMessage = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const message = inputRef.current?.value;
      if (inputRef.current !== null) {
        inputRef.current.value = '';
      }

      if (state === 'play' && turn?.uuid === uuid) return;

      if (state && roomId && uuid && message) {
        if (state === 'play') {
          socket.emit('submitAnswer', { uuid, roomId, message });
        } else {
          socket.emit('chatInGame', { uuid, roomId, message });
        }
      }
    },
    [socket, roomId, uuid, state, turn]
  );

  return (
    <Form onSubmit={sendMessage}>
      <input
        type='text'
        ref={inputRef}
        placeholder='정답 입력(띄어쓰기 안하셔도 정답으로 인정됩니다!)'
        maxLength={40}
      />
    </Form>
  );
};

export default AnswerInput;
