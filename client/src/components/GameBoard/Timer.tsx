import { useContext, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import { SocketContext } from 'context/socket';

const Container = styled.div`
  width: 160px;
  height: 48px;
  line-height: 24px;
  border: 1px solid black;
  background-color: white;
  margin: auto;

  font-size: 24px;
  font-weight: bold;

  display: flex;
  justify-content: center;
  align-items: center;
`;

enum TimerState {
  START,
  END
}

interface TimerProps {
  playTime: number;
  roomId: string;
}

const Timer = ({ playTime, roomId }: TimerProps) => {
  const [state, setState] = useState<TimerState>(TimerState.END);
  const [remainSec, setRemainSec] = useState<number>(0);
  const [m, s] = [Math.floor(remainSec / 60), remainSec % 60];
  const timerIntervalRef = useRef<NodeJS.Timer>();
  const socket = useContext(SocketContext);

  useEffect(() => {
    if (state === TimerState.END) {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    } else if (state === TimerState.START) {
      timerIntervalRef.current = setInterval(() => setRemainSec((prev) => prev - 1), 1000);
    }
  }, [state]);

  useEffect(() => {
    if (socket) {
      socket.on('onRoundStart', () => {
        setRemainSec(playTime);
        setState(TimerState.START);
      });

      socket.on('onRoundEnd', () => {
        setRemainSec(0);
        setState(TimerState.END);
      });

      return () => {
        socket.off('onRoundStart');
        socket.off('onRoundEnd');
      };
    }
  }, [socket, playTime]);

  if (state === TimerState.START && remainSec === 0) {
    setState(TimerState.END);

    // // 이렇게 하면 안되고 그냥 전역으로 관리하던지 방식을 바꾸자
    // // (모든 유저들이 끝났음을 알릴 때 방장이 emit하던지)
    // socket.emit('roundEnd', { roomId, uuid });
  }

  return (
    <Container>
      {m.toString().padStart(2, '0')} : {s.toString().padStart(2, '0')}
    </Container>
  );
};

export default Timer;
