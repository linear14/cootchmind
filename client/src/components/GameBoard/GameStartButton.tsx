import { GameStateContext } from 'context/game';
import { PlayerListContext } from 'context/playerList';
import { RoomContext } from 'context/room';
import { SocketContext } from 'context/socket';
import { UserContext } from 'context/user';
import { useCallback, useContext } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  position: absolute;
  width: 240px;
  height: 48px;
  line-height: 48px;
  top: 30%;
  left: 50%;
  transform: translateX(-50%);
  background: white;

  text-align: center;
  border: 1px solid black;
  cursor: pointer;

  &::after {
    content: '게임 시작하기';
  }
`;

const GameStartButton = () => {
  const socket = useContext(SocketContext);
  const { uuid } = useContext(UserContext);
  const { roomId, master } = useContext(RoomContext);
  const { state } = useContext(GameStateContext);
  const { playerList } = useContext(PlayerListContext);

  const startGame = useCallback(() => {
    if (socket) {
      socket.emit('startGame', { roomId });
    }
  }, [socket, roomId]);

  const isGameAvailable = useCallback(() => {
    if (!uuid || !roomId || !master || !state) return false;
    return (
      state === 'ready' &&
      master.uuid === uuid &&
      playerList.filter((player) => player !== null).length >= 2
    );
  }, [uuid, roomId, master, state, playerList]);

  if (!isGameAvailable()) return null;
  return <Container onClick={startGame} />;
};

export default GameStartButton;
