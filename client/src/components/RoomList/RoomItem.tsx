import styled from 'styled-components';
import { RoomListItem } from 'types/room';

const Container = styled.div`
  width: calc((100% - 16px) / 2);
  height: 120px;
  border: 1px solid black;

  display: flex;
  flex-direction: column;
`;

const Title = styled.span`
  height: 24px;
  line-height: 24px;
  font-size: 18px;
  font-weight: bold;
`;

const MasterName = styled.span`
  height: 20px;
  line-height: 20px;
  font-size: 14px;
`;

const GameState = styled.div<{ state: string }>`
  width: 100px;
  line-height: 20px;
  padding-top: 4px;
  padding-bottom: 4px;
  font-size: 14px;
  font-weight: bold;
  text-align: center;

  border-radius: 10px;
  background-color: ${({ state }) => (state === 'ready' ? 'green' : 'red')};
`;

interface RoomItemProps {
  item: RoomListItem;
  onClickItem: (roomId: string) => void;
}

const mapGameState = {
  ready: '대기 중',
  start: '게임 중',
  interval: '게임 중',
  play: '게임 중',
  end: '게임 중'
};

const RoomItem = ({ item, onClickItem }: RoomItemProps) => {
  return (
    <Container onClick={() => onClickItem(item.roomId)}>
      <Title>{item.title}</Title>
      <MasterName>방장 : {item.masterName}</MasterName>
      <GameState state={item.state}>{mapGameState[item.state]}</GameState>
    </Container>
  );
};

export default RoomItem;
