import { SocketContext } from 'context/socket';
import { UserContext } from 'context/user';
import useCheckValidUser from 'helpers/useCheckValidUser';
import { useCallback, useContext } from 'react';
import styled from 'styled-components';

import { RoomListItem } from 'types/room';
import NavButtons from './NavButtons';
import RoomItem from './RoomItem';

const Container = styled.div`
  flex: 1;
  border: 1px solid black;

  display: flex;
  flex-direction: column;
`;

const ListContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
`;

interface RoomListProps {
  listItem: RoomListItem[];
}

const RoomList = ({ listItem }: RoomListProps) => {
  const { uuid, playerName } = useContext(UserContext);
  const socket = useContext(SocketContext);
  const check = useCheckValidUser();

  const tryEnterRoom = useCallback(
    (roomId: string) => {
      if (check()) {
        socket.emit('tryEnterRoom', { uuid, playerName, roomId });
      }
    },
    [check, socket, uuid, playerName]
  );

  return (
    <Container>
      <ListContainer>
        {listItem.map((room) => (
          <RoomItem key={room.roomId} item={room} onClickItem={tryEnterRoom} />
        ))}
      </ListContainer>
      <NavButtons />
    </Container>
  );
};

export default RoomList;
