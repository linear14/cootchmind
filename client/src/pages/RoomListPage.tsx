import styled from 'styled-components';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { SocketContext } from 'context/socket';
import ChatRegion from 'components/ChatRegion';
import RoomList from 'components/RoomList';
import RoomGeneratorModal from 'components/ui/RoomGeneratorModal';
import { RoomListItem } from 'types/room';
import { getLocalStorageUser, resetLocalStorageUser } from 'helpers/authUtil';
import { UserContext } from 'context/user';
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
  const navigate = useNavigate();
  const socket = useContext(SocketContext);

  const { name, setName } = useContext(UserContext);
  const [isLoading, setLoading] = useState<boolean>(true);
  const [roomList, setRoomList] = useState<(RoomListItem | null)[]>([]);
  const [roomModal, setRoomModal] = useState<boolean>(false);

  const handleRoomModal = () => {
    setRoomModal((prev) => !prev);
  };

  const refreshRoomList = useCallback(() => {
    if (socket) {
      socket.emit('refreshRoomList');
    }
  }, [socket]);

  const createRoom = useCallback(
    (title: string, level: number) => {
      if (socket && name) {
        socket.emit('createRoom', { name, title, level });
      }
    },
    [socket, name]
  );

  const moveToLoginPage = useCallback(() => {
    resetLocalStorageUser();
    setName(undefined);
    navigate('/login');
  }, [navigate, setName]);

  /**
   * ????????? ?????? ??? ????????? ?????? ??????
   * 1. ????????? ????????? ?????? ?????? -> login ???????????? ??????
   * 2. ????????? ???????????? ?????? -> ????????? ????????? uuid ?????? ??? ??????????????? ???????????? ??????
   **/
  useEffect(() => {
    const { name } = getLocalStorageUser();
    if (!name) {
      navigate('/login', { replace: true });
      return;
    }
    if (socket && isLoading) {
      setName(name);
      setLoading(false);
      socket.emit('joinChatChannel');
    }
  }, [navigate, setName, socket, isLoading]);

  // ????????? ?????? ??? ??? ?????? ?????????
  useEffect(() => {
    refreshRoomList();
  }, [refreshRoomList]);

  // [????????? ??????] ??? ????????? ??????????????? ???????????? ?????? ???????????? ?????????
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

  // [????????? ??????] ?????? ??????????????? ???????????? ????????? ???????????? ?????????
  useEffect(() => {
    socket.on('onRoomCreated', (roomId: number) => {
      navigate(`/game/${roomId}`);
    });

    return () => {
      socket.off('onRoomCreated');
    };
  }, [socket, navigate]);

  // [????????? ??????] ?????? ?????? ?????? ???????????? ????????? ????????? ???????????? ?????????
  useEffect(() => {
    socket.on('onRoomJoined', (roomId: number) => {
      navigate(`/game/${roomId}`);
    });

    return () => {
      socket.off('onRoomJoined');
    };
  }, [socket, navigate]);

  return (
    <Container>
      <Header>
        <Logo src='/images/logo.svg' />
        <HeaderRight>
          <CurrentUser onClick={moveToLoginPage}>
            <span>{name}</span>???
          </CurrentUser>
          <Button>
            <a target='_blank' href={NOTION_LINK} rel='noreferrer'>
              ????????????
            </a>
          </Button>
          <Button>
            <a target='_blank' href={GOOGLE_FORM_LINK} rel='noreferrer'>
              ??????????????? ????????????
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
