import { GameStateContext } from 'context/game';
import { useContext, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import AnswerInput from './AnswerInput';
import NextGameBanner from './Banners/NextGameBanner';
import StartGameBanner from './Banners/StartGameBanner';
import CurrentWord from './CurrentWord';
import GameStartButton from './GameStartButton';
import Palette from './Palette';
import SketchBook from './SketchBook';
import Timer from './Timer';

const Container = styled.div`
  position: relative;
  width: 65%;
  border: 1px solid black;
`;

const BoardContainer = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
`;

interface GameBoardProps {
  roomId?: string;
  answer?: string;
}

const GameBoard = ({ roomId, answer }: GameBoardProps) => {
  const [canvasWidth, setCanvasWidth] = useState<number>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  const { state, currentRound, turn } = useContext(GameStateContext);

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
        {answer && <CurrentWord answer={answer} />}
        {state && state === 'start' && <StartGameBanner />}
        {state && state === 'readyRound' && currentRound && turn && (
          <NextGameBanner currentRound={currentRound} name={turn?.name} />
        )}
      </BoardContainer>
      <Palette canvasRef={canvasRef} />
      <AnswerInput />
    </Container>
  );
};

export default GameBoard;
