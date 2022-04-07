import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Room } from 'types/room';

const Container = styled(Link)`
  width: calc((100% - 16px) / 2);
  height: 120px;
  border: 1px solid black;
`;

interface RoomItemProps {
  item: Room;
}

const RoomItem = ({ item }: RoomItemProps) => {
  return <Container to={`/game/${item.roomId}`}>{item.title}</Container>;
};

export default RoomItem;
