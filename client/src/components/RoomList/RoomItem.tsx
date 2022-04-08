import styled from 'styled-components';
import { Room } from 'types/room';

const Container = styled.div`
  width: calc((100% - 16px) / 2);
  height: 120px;
  border: 1px solid black;
`;

interface RoomItemProps {
  item: Room;
  onClickItem: (roomId: string) => void;
}

const RoomItem = ({ item, onClickItem }: RoomItemProps) => {
  return <Container onClick={() => onClickItem(item.roomId)}>{item.title}</Container>;
};

export default RoomItem;
