import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import { SocketContext } from 'context/socket';
import { RoomContext } from 'context/room';
import { GameStateContext } from 'context/game';

const Container = styled.div`
  width: 160px;
  height: 48px;
  line-height: 24px;
  border: 1px solid black;
  background-color: white;

  font-size: 24px;
  font-weight: bold;

  display: flex;
  justify-content: center;
  align-items: center;
`;

enum TimerState {
  RUNNING,
  END
}

interface TimerProps {
  playTime: number;
}

const Timer = ({ playTime }: TimerProps) => {
  const socket = useContext(SocketContext);
  const { roomId, myTurn } = useContext(RoomContext);
  const { state: gameState, turn } = useContext(GameStateContext);
  const [timerState, setTimerState] = useState<TimerState>(TimerState.END);

  const [remainSec, setRemainSec] = useState<number>(0);
  const [m, s] = [Math.floor(remainSec / 60), remainSec % 60];
  const timerIntervalRef = useRef<NodeJS.Timer>();

  const startTimer = useCallback(() => {
    setRemainSec(playTime);
    setTimerState(TimerState.RUNNING);
    timerIntervalRef.current = setInterval(() => setRemainSec((prev) => prev - 1), 1000);
  }, [playTime]);

  const stopTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      setTimerState(TimerState.END);
      setRemainSec(0);
    }
  }, []);

  useEffect(() => {
    if (gameState === 'play') {
      startTimer();
    } else {
      stopTimer();
    }
  }, [gameState, startTimer, stopTimer]);

  useEffect(() => {
    if (gameState === 'play' && timerState === TimerState.RUNNING && remainSec === 0) {
      stopTimer();
      if (myTurn && turn?.idx === myTurn - 1) {
        socket.emit('forceStopRound', { roomId });
      }
    }
  }, [gameState, remainSec, roomId, socket, timerState, turn?.idx, stopTimer, myTurn]);

  return (
    <Container>
      {m.toString().padStart(2, '0')} : {s.toString().padStart(2, '0')}
    </Container>
  );
};

export default Timer;
