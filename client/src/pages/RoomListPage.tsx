import styled from 'styled-components';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import ChatList from 'components/ChatList';
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

  useEffect(() => {
    const playerName = localStorage.getItem('player-name');
    if (!playerName) {
      navigate('/login', { replace: true });
      return;
    }
    setPlayerName(playerName);
  }, [navigate]);

  if (!playerName) return null;

  return (
    <Container>
      <Header>
        <CreateRoomBtn />
        <RoomRefreshBtn />
        <div>현재 사용자: {playerName}</div>
      </Header>
      <Body>
        <ChatList />
        <RoomList />
      </Body>
    </Container>
  );
};

export default RoomListPage;
