import styled from 'styled-components';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import ChatRegion from 'components/ChatRegion';
import RoomList from 'components/RoomList';
import ModalPortal from 'components/ui/ModalPortal';
import RoomGeneratorModal from 'components/ui/RoomGeneratorModal';

const Container = styled.div`
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  height: 60px;
  display: flex;
`;

const Body = styled.div`
  height: calc(100% - 60px);
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
  const [roomModal, setRoomModal] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleModal = () => {
    setRoomModal((prev) => !prev);
  };

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
        <CreateRoomBtn onClick={handleModal} />
        <RoomRefreshBtn />
        <div>현재 사용자: {playerName}</div>
      </Header>
      <Body>
        <ChatRegion />
        <RoomList />
      </Body>
      <ModalPortal>{roomModal && <RoomGeneratorModal onClose={handleModal} />}</ModalPortal>
    </Container>
  );
};

export default RoomListPage;
