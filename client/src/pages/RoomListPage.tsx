import styled from 'styled-components';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { SocketContext } from 'context/socket';
import ChatRegion from 'components/ChatRegion';
import RoomList from 'components/RoomList';
import RoomGeneratorModal from 'components/ui/RoomGeneratorModal';
import { RoomListItem } from 'types/room';
import { getLocalStorageUser } from 'helpers/authUtil';
import { UserContext } from 'context/user';
import useCheckValidUser from 'helpers/useCheckValidUser';
import { GOOGLE_FORM_LINK, NOTION_LINK } from 'helpers/constants';

const Container = styled.div`
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  position: relative;
  height: 60px;
  padding-right: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid black;
`;

const HeaderRight = styled.div`
  height: 100%;
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const Body = styled.div`
  height: calc(100% - 60px);
  display: flex;
`;

const Logo = styled.img`
  height: 100%;
`;

const CurrentUser = styled.button.attrs({
  type: 'button'
})`
  height: 36px;
  padding-left: 1rem;
  padding-right: 1rem;
  border: 1px solid black;
  border-radius: 10px;
  font-size: 14px;

  span {
    font-size: 16px;
    font-weight: bold;
  }

  display: flex;
  align-items: center;
  justify-content: center;
`;

const Button = styled.button.attrs({
  type: 'button'
})`
  position: relative;
  height: 40px;
  line-height: 40px;
  padding-left: 1rem;
  padding-right: 1rem;
  border: 1px solid black;
  display: flex;
  align-items: center;
  justify-content: center;

  a {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const RoomListPage = () => {
  const { uuid, playerName, setUser } = useContext(UserContext);
  const [roomList, setRoomList] = useState<(RoomListItem | null)[]>([]);
  const [roomModal, setRoomModal] = useState<boolean>(false);

  const navigate = useNavigate();
  const socket = useContext(SocketContext);
  const { check, initializeUser } = useCheckValidUser();

  const createRoom = useCallback(
    (title: string, level: number) => {
      if (check() && socket && uuid && playerName) {
        socket.emit('createRoom', { uuid, playerName, title, level });
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
    if (socket && uuid !== localStorageUUID && playerName !== localStoragePN) {
      socket.emit('saveUser', { uuid: localStorageUUID });
      setUser({ uuid: localStorageUUID, playerName: localStoragePN });
    }
  }, [navigate, setUser, socket, uuid, playerName]);

  // 페이지 접근 시 방 목록 초기화
  useEffect(() => {
    refreshRoomList();
  }, [refreshRoomList]);

  // [이벤트 등록] 방 목록을 성공적으로 갱신했을 경우 발생하는 이벤트
  useEffect(() => {
    if (socket) {
      socket.on('onRoomListRefreshed', (roomList: RoomListItem[]) => {
        setRoomList([...roomList, ...Array(10 - roomList.length).fill(null)]);
      });
    }
    return () => {
      socket.off('onRoomListRefreshed');
    };
  }, [socket]);

  // [이벤트 등록] 방을 성공적으로 생성했을 경우에 발생하는 이벤트
  useEffect(() => {
    socket.on('onRoomCreated', (roomId: number) => {
      navigate(`/game/${roomId}`);
    });

    return () => {
      socket.off('onRoomCreated');
    };
  }, [socket, navigate]);

  // [이벤트 등록] 게임 방에 입장 가능함이 확인된 경우에 발생하는 이벤트
  useEffect(() => {
    socket.on('onRoomJoined', (roomId: number) => {
      navigate(`/game/${roomId}`);
    });

    return () => {
      socket.off('onRoomJoined');
    };
  }, [socket, navigate]);

  if (!uuid && !playerName) return null;

  return (
    <Container>
      <Header>
        <Logo src='/images/logo.svg' />
        <HeaderRight>
          <CurrentUser onClick={initializeUser}>
            <span>{playerName}</span>님
          </CurrentUser>
          <Button>
            <a target='_blank' href={NOTION_LINK} rel='noreferrer'>
              공지사항
            </a>
          </Button>
          <Button>
            <a target='_blank' href={GOOGLE_FORM_LINK} rel='noreferrer'>
              개발자에게 문의하기
            </a>
          </Button>
        </HeaderRight>
      </Header>
      <Body>
        <RoomList
          listItem={roomList}
          onShowCreateRoomModal={handleRoomModal}
          onRefreshRoomList={refreshRoomList}
        />
        <ChatRegion />
      </Body>
      {roomModal && <RoomGeneratorModal onGenerate={createRoom} onClose={handleRoomModal} />}
    </Container>
  );
};

export default RoomListPage;
