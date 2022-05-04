import styled from 'styled-components';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { SocketContext } from 'context/socket';
import ChatRegion from 'components/ChatRegion';
import RoomList from 'components/RoomList';
import RoomGeneratorModal from 'components/ui/RoomGeneratorModal';
import { Room } from 'types/room';
import { getLocalStorageUser } from 'helpers/authUtil';
import ErrorModal from 'components/ui/ErrorModal';
import { UserContext } from 'context/user';
import useCheckValidUser from 'helpers/useCheckValidUser';

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

interface SocketError {
  message: string;
  callback: () => void;
}

const RoomListPage = () => {
  const { uuid, playerName, setUser } = useContext(UserContext);
  const [roomList, setRoomList] = useState<Room[]>([]);
  const [roomModal, setRoomModal] = useState<boolean>(false);
  const [error, setError] = useState<SocketError | null>(null);
  const navigate = useNavigate();
  const socket = useContext(SocketContext);
  const check = useCheckValidUser();

  const createRoom = useCallback(
    (title?: string) => {
      if (check() && socket && title && uuid && playerName) {
        socket.emit('createRoom', { uuid, playerName, title });
      }
    },
    [socket, check, uuid, playerName]
  );

  const handleRoomModal = () => {
    setRoomModal((prev) => !prev);
  };

  const refreshRoomList = useCallback(() => {
    if (socket) {
      socket.emit('refreshRoomList');
    }
  }, [socket]);

  /**
   * 페이지 접근 시 로그인 상태 확인
   * 1. 로그인 안되어 있는 경우 -> login 페이지로 이동
   * 2. 로그인 되어있는 경우 -> 서버에 로그인 uuid 저장 및 클라이언트 회원정보 저장
   **/
  useEffect(() => {
    const { uuid: localStorageUUID, playerName: localStoragePN } = getLocalStorageUser();
    if (!localStorageUUID || !localStoragePN) {
      navigate('/login', { replace: true });
      return;
    }
    if (uuid !== localStorageUUID && playerName !== localStoragePN) {
      socket.emit('saveUser', { uuid });
      setUser({ uuid: localStorageUUID, playerName: localStoragePN });
    }
  }, [navigate, setUser, socket, uuid, playerName]);

  useEffect(() => {
    socket.on('onRoomGenerated', (roomId: number) => {
      navigate(`/game/${roomId}`);
    });

    socket.on('onSuccessRoomConnection', (roomId: number) => {
      navigate(`/game/${roomId}`);
    });

    socket.on(
      'onError',
      ({ message, closeConnection }: { message: string; closeConnection: boolean | undefined }) => {
        if (closeConnection) {
          setError({
            message,
            callback: () => {
              window.localStorage.removeItem('uuid');
              window.localStorage.removeItem('player-name');
              navigate(`/login`, { replace: true });
            }
          });
        } else {
          setError({ message, callback: () => setError(null) });
        }
      }
    );

    return () => {
      socket.off('onRoomGenerated');
      socket.off('onSuccessRoomConnection');
      socket.off('onError');
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

  if (!playerName) return null;

  return (
    <Container>
      <Header>
        <CreateRoomBtn onClick={handleRoomModal} />
        <RoomRefreshBtn onClick={refreshRoomList} />
        <div>현재 사용자: {playerName}</div>
      </Header>
      <Body>
        <ChatRegion />
        <RoomList listItem={roomList} />
      </Body>
      {roomModal && <RoomGeneratorModal onGenerate={createRoom} onClose={handleRoomModal} />}
      {error && <ErrorModal message={error.message} onClose={error.callback} />}
    </Container>
  );
};

export default RoomListPage;
