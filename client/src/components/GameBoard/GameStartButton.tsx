import { GameStateContext } from 'context/game';
import { PlayerListContext } from 'context/playerList';
import { RoomContext } from 'context/room';
import { SocketContext } from 'context/socket';
import { UserContext } from 'context/user';
import { useCallback, useContext } from 'react';
import styled from 'styled-components';

const Container = styled.button`
  position: absolute;
  width: 240px;
  padding: 0.75rem 0;
  top: 30%;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  font-size: 16px;

  border: 1px solid black;

  display: flex;
  justify-content: center;
  align-items: center;
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
  return (
    <Container type='button' onClick={startGame}>
      게임 시작하기
    </Container>
  );
};

export default GameStartButton;
