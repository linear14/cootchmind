import { SocketContext } from 'context/socket';
import { UserContext } from 'context/user';
import useCheckValidUser from 'helpers/useCheckValidUser';
import React, { useCallback, useContext, useRef, useState } from 'react';
import styled from 'styled-components';

import { RoomListItem } from 'types/room';
import RoomItem from './RoomItem';

const Container = styled.div`
  flex: 1;
  padding: 1rem;

  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ListContainer = styled.div`
  position: relative;
  height: 80%;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
`;

const BottomContainer = styled.div`
  position: relative;
  height: 12%;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Button = styled.button.attrs({
  type: 'button'
})`
  width: 84px;
  height: 100%;
  border: 1px solid black;
  cursor: pointer;
`;

const Notice = styled.div`
  font-size: 14px;
  line-height: 1.25;
`;

interface RoomListProps {
  listItem: (RoomListItem | null)[];
  onShowCreateRoomModal: () => void;
  onRefreshRoomList: () => void;
}

const RoomList = ({ listItem, onShowCreateRoomModal, onRefreshRoomList }: RoomListProps) => {
  const socket = useContext(SocketContext);

  const { name } = useContext(UserContext);
  const [canRefreshRoomList, setCanRefreshRoomList] = useState<boolean>(true);

  const tryEnterRoom = useCallback(
    (roomId: string) => {
      if (name) {
        socket.emit('tryEnterRoom', { name, roomId });
      }
    },
    [socket, name]
  );

  const handleRefreshRoomList = useCallback(() => {
    if (canRefreshRoomList) {
      onRefreshRoomList();
      setCanRefreshRoomList(false);

      setTimeout(() => {
        setCanRefreshRoomList(true);
      }, 3000);
    }
  }, [canRefreshRoomList, onRefreshRoomList]);

  return (
    <Container>
      <ListContainer>
        {listItem.map((room, idx) => {
          if (room) {
            return <RoomItem key={room.roomId} item={room} onClickItem={tryEnterRoom} />;
          } else {
            return <RoomItem key={`ri${idx}`} />;
          }
        })}
      </ListContainer>
      <BottomContainer>
        <Button onClick={onShowCreateRoomModal}>????????????</Button>
        <Button onClick={handleRefreshRoomList}>????????????</Button>
        <Notice>{`?????? ???????????? ?????? ????????? ?????? ?????? 10?????? ?????? ????????? ??? ????????????.`}</Notice>
      </BottomContainer>
    </Container>
  );
};

export default React.memo(RoomList);
