import { GameStateContext } from 'context/game';
import { RoomContext } from 'context/room';
import { SocketContext } from 'context/socket';
import { UserContext } from 'context/user';
import { useCallback, useContext, useRef } from 'react';
import styled from 'styled-components';

const Form = styled.form`
  width: calc(100% - 2rem);
  height: 32px;
  display: block;
  margin: 1rem auto;
  border: 1px solid black;
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
        console.log(message);
        if (state === 'play') {
          console.log('played');
          socket.emit('submitAnswer', { uuid, roomId, message });
        } else {
          console.log('chat');
          socket.emit('chatInGame', { uuid, roomId, message });
        }
      }
    },
    [socket, roomId, uuid, state, turn]
  );

  return (
    <Form onSubmit={sendMessage}>
      <input ref={inputRef} placeholder='채팅 창' />
    </Form>
  );
};

export default AnswerInput;
