import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';

import GameBoard from 'components/GameBoard';
import PlayerList from 'components/PlayerList';
import { SocketContext } from 'context/socket';
import { Room } from 'types/room';
import { UserContext } from 'context/user';
import { Player } from 'types/player';
import { User } from 'types/user';
import { GameStateContext } from 'context/game';
import { RoomContext } from 'context/room';
import { PlayerListContext } from 'context/playerList';
import AnswerInput from 'components/GameBoard/AnswerInput';

const Container = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  background: white;
  padding: 1rem;

  display: flex;
  flex-direction: column;
`;

const Top = styled.div`
  position: relative;
  width: 100%;
  height: 68%;
`;

const Bottom = styled.div`
  position: relative;
  width: 100%;
  height: 32%;

  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 0.5rem;
`;

const GamePage = () => {
  const socket = useContext(SocketContext);
  const navigate = useNavigate();

  const { roomId } = useParams();
  const { name } = useContext(UserContext);
  const { setRoom } = useContext(RoomContext);
  const { setGameState } = useContext(GameStateContext);
  const { setPlayerList } = useContext(PlayerListContext);
  const [answer, setAnswer] = useState<string>();
  const [isLoading, setLoading] = useState(true);

  /**
   * 페이지 접근 시 url로 들어오는 경우 이전 페이지로 튕기도록 설정
   **/
  useEffect(() => {
    console.log('GamePage #useEffect check correct access');
    if (!name) {
      navigate('/', { replace: true });
      return;
    }
  }, [name, navigate]);

  // 방 입장 (from url / from previous page)시 정상적으로 접속했는지 여부 판단하는 이벤트 발생
  // 방 퇴장시 이벤트 발생
  useEffect(() => {
    if (socket && roomId && name) {
      socket.emit('enterRoom', { roomId });

      return () => {
        socket.emit('leaveRoom', { roomId });
      };
    }
  }, [socket, roomId, name]);

  // [이벤트 등록] 방에 성공적으로 입장했을 경우 발생하는 이벤트
  useEffect(() => {
    console.log('GamePage #useEffect listen onRoomEntered');
    if (socket) {
      socket.on('onRoomEntered', (room: Room, myTurn: number) => {
        const roomDataImmutable = {
          roomId: room.roomId,
          title: room.title,
          master: room.master as Required<User>,
          myTurn
        };
        const gameState = {
          state: room.state,
          currentRound: room.currentRound,
          turn: room.turn
        };
        setRoom(roomDataImmutable);
        setPlayerList(room.players);
        setGameState(gameState);
        setLoading(false);
      });
    }
    return () => {
      socket.off('onRoomEntered');
    };
  }, [socket, setGameState, setPlayerList, setRoom]);

  // [이벤트 등록] 플레이어 변동이 있을 경우에 발생하는 이벤트
  useEffect(() => {
    console.log('GamePage #useEffect listen onPlayerRefreshed');
    if (socket) {
      socket.on('onPlayerRefreshed', (players: (Player | null)[]) => {
        setPlayerList(players);
      });
    }
    return () => {
      socket.off('onPlayerRefreshed');
    };
  }, [socket, setPlayerList]);

  // [이벤트 등록] 새로운 게임이 시작 되었을 때 발생하는 이벤트
  useEffect(() => {
    console.log('GamePage #useEffect listen onGameStarted');
    if (socket) {
      // 요거 currentRound랑 turn은 받을 필요 없는데 억지로 받고있음..
      // (prev로 받을 수 있도록 처리하고 서버에서도 데이터 전달하지 않도록 수정하자)
      // onRoundEnded도 동일
      socket.on('onGameStarted', ({ state, currentRound, turn }) => {
        setGameState({ state, currentRound, turn });
      });
    }

    return () => {
      socket.off('onGameStart');
    };
  }, [socket, setGameState]);

  // [이벤트 등록] 새로운 라운드가 준비 되었을 때 발생하는 이벤트
  useEffect(() => {
    console.log('GamePage #useEffect listen onRoundReady');
    if (socket) {
      socket.on('onRoundReady', ({ state, currentRound, turn, answer }) => {
        setGameState({
          state,
          currentRound,
          turn
        });
        setAnswer(answer);
      });

      return () => {
        socket.off('onRoundReady');
      };
    }
  }, [socket, setGameState]);

  // [이벤트 등록] 새로운 라운드가 시작 되었을 때 발생하는 이벤트
  useEffect(() => {
    console.log('GamePage #useEffect listen onRoundStarted');
    if (socket) {
      socket.on('onRoundStarted', ({ state, currentRound, turn }) => {
        setGameState({
          state,
          currentRound,
          turn
        });
      });

      return () => {
        socket.off('onRoundStarted');
      };
    }
  }, [socket, setGameState]);

  if (isLoading) return null;

  return (
    <Container>
      <Top>
        <GameBoard answer={answer} />
      </Top>
      <Bottom>
        <PlayerList />
        <AnswerInput />
      </Bottom>
    </Container>
  );
};

export default GamePage;
