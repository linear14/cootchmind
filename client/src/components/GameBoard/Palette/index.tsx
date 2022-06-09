import { GameStateContext } from 'context/game';
import { RoomContext } from 'context/room';
import { SocketContext } from 'context/socket';
import { UserContext } from 'context/user';
import { useCallback, useContext } from 'react';
import styled from 'styled-components';

import ColorList from './ColorList';

const Container = styled.div`
  width: 100%;
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const EraseAllButton = styled.div`
  width: 120px;
  height: 36px;
  border: 1px solid black;
  font-size: 18px;
  line-height: 36px;
  text-align: center;

  &::after {
    content: '전체 지우기';
  }
`;

interface PaletteProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

const Palette = ({ canvasRef }: PaletteProps) => {
  const socket = useContext(SocketContext);
  const { roomId } = useContext(RoomContext);
  const { uuid } = useContext(UserContext);
  const { state, turn } = useContext(GameStateContext);

  const setColor = useCallback(
    (colorHex: string) => {
      const canvas = canvasRef.current;
      const context = canvas?.getContext('2d');

      if (canvas && context) {
        context.strokeStyle = colorHex;
      }
    },
    [canvasRef]
  );

  const eraseAll = useCallback(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');

    if (canvas && context && state === 'play' && turn?.uuid === uuid) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      socket.emit('clearPaint', { uuid, roomId });
    }
  }, [socket, canvasRef, roomId, state, turn?.uuid, uuid]);

  return (
    <Container>
      <ColorList onClickItem={setColor} />
      <EraseAllButton onClick={eraseAll} />
    </Container>
  );
};

export default Palette;
