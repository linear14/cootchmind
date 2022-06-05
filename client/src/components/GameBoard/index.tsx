import { GameStateContext } from 'context/game';
import { PlayerListContext } from 'context/playerList';
import { SocketContext } from 'context/socket';
import { useContext, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import AnswerInput from './AnswerInput';
import GameResultBanner from './Banners/GameResultBanner';
import NextGameBanner from './Banners/NextGameBanner';
import RoundResultBanner from './Banners/RoundResultBanner';
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
  const socket = useContext(SocketContext);
  const [canvasWidth, setCanvasWidth] = useState<number>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  const { state, currentRound, turn, setGameState } = useContext(GameStateContext);
  const { setPlayerList } = useContext(PlayerListContext);
  const [gameResult, setGameResult] = useState<{ rank: number; name: string; answerCnt: number }[]>(
    []
  );

  useEffect(() => {
    setCanvasWidth(boardRef.current?.offsetWidth);
    window.onresize = () => setCanvasWidth(boardRef.current?.offsetWidth);

    return () => {
      window.onresize = null;
    };
  }, []);

  // [이벤트 등록] 해당 라운드가 종료 되었을 때 발생하는 이벤트
  // prev game state가 undefined이면 어떻게하지?
  useEffect(() => {
    if (socket) {
      socket.on('onRoundEnded', ({ answer, winPlayer, state, currentRound, turn, players }) => {
        setGameState({ state, currentRound, turn });
        setPlayerList(players);
      });

      return () => {
        socket.off('onRoundEnded');
      };
    }
  }, [socket, setGameState, setPlayerList]);

  // [이벤트 등록] 전체 게임이 종료 되었을 때 발생하는 이벤트
  useEffect(() => {
    if (socket) {
      socket.on('onGameEnded', ({ result, newGameState, players }) => {
        setGameState(newGameState);
        setGameResult(result);
        setPlayerList(players);

        setTimeout(() => {
          setGameState({ state: 'ready', currentRound: 0, turn: undefined });
        }, 7000);
      });

      return () => {
        socket.off('onGameEnded');
      };
    }
  }, [socket, setGameState, setPlayerList]);

  return (
    <Container ref={boardRef}>
      {roomId && <Timer playTime={10} roomId={roomId} />}
      <BoardContainer>
        <SketchBook canvasWidth={canvasWidth} ref={canvasRef} />
        {state && state === 'ready' && <GameStartButton />}
        {answer && <CurrentWord answer={answer} />}
        {state && state === 'start' && <StartGameBanner />}
        {state && state === 'readyRound' && currentRound && turn && (
          <NextGameBanner currentRound={currentRound} name={turn?.name} />
        )}
        {state && state === 'interval' && <RoundResultBanner />}
        {state && state === 'end' && <GameResultBanner result={gameResult} />}
      </BoardContainer>
      <Palette canvasRef={canvasRef} />
      <AnswerInput />
    </Container>
  );
};

export default GameBoard;
