import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import AnswerInput from './AnswerInput';
import Palette from './Palette';
import SketchBook from './SketchBook';
import Timer from './Timer';

const Container = styled.div`
  position: relative;
  width: 60%;
  border: 1px solid black;
`;

interface GameBoardProps {
  roomId?: string;
  state?: string;
}

const GameBoard = ({ roomId, state }: GameBoardProps) => {
  const [canvasWidth, setCanvasWidth] = useState<number>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCanvasWidth(boardRef.current?.offsetWidth);
    window.onresize = () => setCanvasWidth(boardRef.current?.offsetWidth);

    return () => {
      window.onresize = null;
    };
  }, []);

  return (
    <Container ref={boardRef}>
      {roomId && <Timer playTime={10} roomId={roomId} />}
      <SketchBook canvasWidth={canvasWidth} ref={canvasRef} state={state} />
      <Palette canvasRef={canvasRef} />
      <AnswerInput />
    </Container>
  );
};

export default GameBoard;
