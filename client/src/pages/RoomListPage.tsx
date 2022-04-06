import styled from 'styled-components';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { SocketContext } from 'context/socket';
import ChatRegion from 'components/ChatRegion';
import RoomList from 'components/RoomList';

const Container = styled.div`
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
`;

const Body = styled.div`
  flex: 1;
  display: flex;
`;

const CreateRoomBtn = styled.div`
  width: 240px;
  height: 60px;
  font-size: 24px;
  line-height: 60px;
  text-align: center;

  border: 1px solid black;

  &::after {
    content: '방만들기';
  }
`;

const RoomRefreshBtn = styled.div`
  width: 240px;
  height: 60px;
  font-size: 24px;
  line-height: 60px;
  text-align: center;

  border: 1px solid black;

  &::after {
    content: '새로고침';
  }
`;

const RoomListPage = () => {
  const [playerName, setPlayerName] = useState<string>();
  const navigate = useNavigate();
  const socket = useContext(SocketContext);

  const socketString = () => {
    socket.emit('string', '이동현');
  };

  const socketObject = () => {
    socket.emit('object', {
      name: '동현',
      age: 28
    });
  };

  useEffect(() => {
    const playerName = localStorage.getItem('player-name');
    if (!playerName) {
      navigate('/login', { replace: true });
      return;
    }
    setPlayerName(playerName);
  }, [navigate]);

  useEffect(() => {
    socket.on('alert', (message) => {
      alert(message);
    });
    return () => {
      socket.off('alert');
    };
  }, [socket]);

  if (!playerName) return null;

  return (
    <Container>
      <Header>
        <CreateRoomBtn onClick={socketString} />
        <RoomRefreshBtn onClick={socketObject} />
        <div>현재 사용자: {playerName}</div>
      </Header>
      <Body>
        <ChatRegion />
        <RoomList />
      </Body>
    </Container>
  );
};

export default RoomListPage;
