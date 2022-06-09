import { SocketContext } from 'context/socket';
import { useContext, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import { Player } from 'types/player';

const Container = styled.div<{ highlight: boolean }>`
  position: relative;
  width: 100%;
  height: 80px;
  padding: 1rem;

  border: ${({ highlight }) => (highlight ? '2px solid red' : '1px solid black')};
  background-color: white;

  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const PlayerName = styled.div`
  font-size: 18px;
  font-weight: bold;
`;

const AnswerCount = styled.div``;

const Message = styled.span`
  position: absolute;
  max-width: 100%;
  left: 0;
  bottom: calc(100% + 8px);
  background-color: white;
  padding: 0.5rem;
  border: 1px solid black;
  border-radius: 10px;
  z-index: 10;
  white-space: pre-wrap;
  word-break: break-all;
  line-height: 18px;
`;

interface PlayerItemProps {
  player: Player | null;
  turnHighlight: boolean;
}

const PlayerItem = ({ player, turnHighlight }: PlayerItemProps) => {
  const socket = useContext(SocketContext);
  const [message, setMessage] = useState<string>();
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    socket.on('onChatInGame', ({ uuid, message }) => {
      if (uuid === player?.uuid) {
        setMessage(message);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          setMessage('');
        }, 3000);
      }
    });
  }, [socket, player?.uuid]);

  return (
    <Container highlight={turnHighlight}>
      <PlayerName>{player && player.name}</PlayerName>
      <AnswerCount>{player && `정답수 : ${player.answerCnt}`}</AnswerCount>
      {message && <Message>{message}</Message>}
    </Container>
  );
};

export default PlayerItem;
