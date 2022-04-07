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
  return (
    <Container>
      <ListContainer>
        {listItem.map((room) => (
          <RoomItem key={room.roomId} item={room} />
        ))}
      </ListContainer>
      <NavButtons />
    </Container>
  );
};

export default RoomList;
