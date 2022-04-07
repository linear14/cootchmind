import { SocketContext } from 'context/socket';
import { useCallback, useContext } from 'react';
import styled from 'styled-components';

import { Room } from 'types/room';
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
  listItem: Room[];
}

const RoomList = ({ listItem }: RoomListProps) => {
  const socket = useContext(SocketContext);

  const tryEnterRoom = useCallback(
    (roomId: number) => {
      socket.emit('tryEnterGameRoom', roomId);
    },
    [socket]
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
