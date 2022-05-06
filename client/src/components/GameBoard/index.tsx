import { GameStateContext } from 'context/game';
import { useContext, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import AnswerInput from './AnswerInput';
import GameStartButton from './GameStartButton';
import Palette from './Palette';
import SketchBook from './SketchBook';
import Timer from './Timer';

const Container = styled.div`
  position: relative;
  width: 60%;
  border: 1px solid black;
`;

const BoardContainer = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const StartGameBanner = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 36px;
  font-weight: bold;
  background-color: white;
  z-index: 5;

  &::after {
    content: '게임 시작!';
  }
`;

interface GameBoardProps {
  roomId?: string;
}

const GameBoard = ({ roomId }: GameBoardProps) => {
  const [canvasWidth, setCanvasWidth] = useState<number>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  const { state } = useContext(GameStateContext);

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
      <BoardContainer>
        <SketchBook canvasWidth={canvasWidth} ref={canvasRef} />
        <GameStartButton />
        {state && state === 'start' && <StartGameBanner />}
      </BoardContainer>
      <Palette canvasRef={canvasRef} />
      <AnswerInput />
    </Container>
  );
};

export default GameBoard;
