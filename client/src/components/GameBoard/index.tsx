import { GameStateContext } from 'context/game';
import { PlayerListContext } from 'context/playerList';
import { RoomContext } from 'context/room';
import { SocketContext } from 'context/socket';
import { useContext, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { GameResult, RoundResult } from 'types/result';
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
  width: 100%;
  height: 100%;

  display: flex;
  justify-content: space-between;
  gap: 1rem;
`;

const Left = styled.div`
  position: relative;
  width: 70%;
  height: 100%;
  border: 1px solid black;
`;

const Right = styled.div`
  position: relative;
  flex: 1;
  height: 100%;

  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

interface GameBoardProps {
  answer?: string;
}

const GameBoard = ({ answer }: GameBoardProps) => {
  const socket = useContext(SocketContext);
  const [canvasSize, setCanvasSize] = useState<{ width?: number; height?: number }>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  const { state, currentRound, turn, setGameState } = useContext(GameStateContext);
  const { setPlayerList } = useContext(PlayerListContext);
  const [roundResult, setRoundResult] = useState<RoundResult>();
  const [gameResult, setGameResult] = useState<GameResult[]>([]);

  useEffect(() => {
    setCanvasSize({ width: boardRef.current?.offsetWidth, height: boardRef.current?.offsetHeight });
  }, []);

  // [이벤트 등록] 해당 라운드가 종료 되었을 때 발생하는 이벤트
  // prev game state가 undefined이면 어떻게하지?
  useEffect(() => {
    if (socket) {
      socket.on(
        'onRoundEnded',
        ({ answer, winPlayer, state, currentRound, turn, players, error }) => {
          if (error) {
            setGameState({ state, currentRound, turn });
            setRoundResult({ round: currentRound, error });
          } else {
            setGameState({ state, currentRound, turn });
            setPlayerList(players);
            setRoundResult({ round: currentRound, winPlayer, answer });
          }
        }
      );

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
    <Container>
      <Left ref={boardRef}>
        <SketchBook
          canvasWidth={canvasSize?.width}
          canvasHeight={canvasSize?.height}
          ref={canvasRef}
        />
        {state && state === 'ready' && <GameStartButton />}
        {state && state === 'start' && <StartGameBanner />}
        {state && state === 'readyRound' && currentRound && turn && (
          <NextGameBanner currentRound={currentRound} name={turn?.name} />
        )}
        {state && state === 'interval' && <RoundResultBanner result={roundResult} />}
        {state && state === 'end' && <GameResultBanner result={gameResult} />}
      </Left>
      <Right>
        <Timer playTime={150} />
        <CurrentWord answer={state && state === 'play' ? answer : ''} />
        <Palette canvasRef={canvasRef} />
      </Right>
    </Container>
  );
};

export default GameBoard;
