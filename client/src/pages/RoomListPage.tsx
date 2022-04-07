import styled from 'styled-components';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { SocketContext } from 'context/socket';
import ChatRegion from 'components/ChatRegion';
import RoomList from 'components/RoomList';
import ModalPortal from 'components/ui/ModalPortal';
import RoomGeneratorModal from 'components/ui/RoomGeneratorModal';
import { Room } from 'types/room';
import { getUser } from 'helpers/authUtil';

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
  const [roomList, setRoomList] = useState<Room[]>([]);
  const [roomModal, setRoomModal] = useState<boolean>(false);
  const navigate = useNavigate();
  const socket = useContext(SocketContext);

  const generateRoom = (title?: string) => {
    const [playerName, uuid] = getUser();
    if (socket && title && playerName && uuid) {
      socket.emit('generateRoom', { title, createdBy: playerName, uuid });
    } else {
      // 예외 처리
    }
  };

  const handleModal = () => {
    setRoomModal((prev) => !prev);
  };

  const refreshRoomList = useCallback(() => {
    if (socket) {
      socket.emit('refreshRoomList');
    }
  }, [socket]);

  useEffect(() => {
    const [playerName, uuid] = getUser();
    if (!playerName || !uuid) {
      navigate('/login', { replace: true });
      return;
    }
    setPlayerName(playerName);
  }, [navigate]);

  useEffect(() => {
    socket.on('onRoomGenerated', (roomId: number) => {
      navigate(`/game/${roomId}`);
    });

    socket.on('onSuccessRoomConnection', (roomId: number) => {
      navigate(`/game/${roomId}`);
    });

    return () => {
      socket.off('onRoomGenerated');
      socket.off('onSuccessRoomConnection');
    };
  }, [socket, navigate]);

  useEffect(() => {
    if (socket) {
      socket.on('onRoomListRefreshed', (roomList: Room[]) => {
        setRoomList(roomList);
      });
    }
    return () => {
      socket.off('onRoomListRefreshed');
    };
  }, [socket]);

  useEffect(() => {
    if (socket) {
      refreshRoomList();
    }
  }, [socket, refreshRoomList]);

  useEffect(() => {
    const [playerName, uuid] = getUser();
    if (playerName && uuid) {
      socket.emit('saveUser', uuid);
    }
  }, [socket]);

  if (!playerName) return null;

  return (
    <Container>
      <Header>
        <CreateRoomBtn onClick={handleModal} />
        <RoomRefreshBtn onClick={refreshRoomList} />
        <div>현재 사용자: {playerName}</div>
      </Header>
      <Body>
        <ChatRegion />
        <RoomList listItem={roomList} />
      </Body>
      <ModalPortal>
        {roomModal && <RoomGeneratorModal onGenerate={generateRoom} onClose={handleModal} />}
      </ModalPortal>
    </Container>
  );
};

export default RoomListPage;
