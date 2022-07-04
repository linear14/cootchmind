import { GameStateContext } from 'context/game';
import { RoomContext } from 'context/room';
import { SocketContext } from 'context/socket';
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

const EraseAllButton = styled.button`
  width: 120px;
  height: 36px;
  border: 1px solid black;
  font-size: 14px;
  line-height: 36px;

  display: flex;
  justify-content: center;
  align-items: center;
`;

interface PaletteProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

const Palette = ({ canvasRef }: PaletteProps) => {
  const socket = useContext(SocketContext);
  const { roomId, myTurn } = useContext(RoomContext);
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

    if (canvas && context && state === 'play' && myTurn && turn?.idx === myTurn - 1) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      socket.emit('clearPaint', { roomId });
    }
  }, [socket, canvasRef, roomId, state, turn?.idx, myTurn]);

  return (
    <Container>
      <ColorList onClickItem={setColor} />
      <EraseAllButton type='button' onClick={eraseAll}>
        전체 지우기
      </EraseAllButton>
    </Container>
  );
};

export default Palette;
