import React, { useCallback } from 'react';
import styled, { css } from 'styled-components';
import { RoomListItem } from 'types/room';

const Container = styled.div<{ isActive: boolean }>`
  position: relative;
  width: calc((100% - 1rem) / 2);
  height: calc((100% - 4rem) / 5);
  border: 1px solid black;

  display: flex;
  flex-direction: column;
  cursor: pointer;

  ${({ isActive }) =>
    !isActive &&
    css`
      background-color: #eeeeee;
      cursor: auto;
    `}
`;

const Top = styled.div`
  width: 100%;
  height: 65%;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
`;

const Title = styled.span`
  line-height: 1.15;
  font-size: 18px;
  font-weight: bold;

  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;

const MasterName = styled.span`
  height: 20px;
  line-height: 20px;
  font-size: 14px;

  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;

const Bottom = styled.div<{ state: string }>`
  position: absolute;
  width: 100%;
  height: 35%;
  left: 0;
  bottom: 0;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  background-color: ${({ state }) => (state === 'ready' ? '#a8e4a0' : '#f69794')};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Right = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const GameState = styled.div`
  font-size: 14px;
  color: black;
`;

const Level = styled.span<{ level: number }>`
  background-color: ${({ level }) =>
    level === 1 ? '#009460' : level === 2 ? '#fdb913' : '#c1272d'};
  border-radius: 10px;
  padding: 0.25rem 0.5rem;
  color: white;
  font-size: 14px;
`;

const Round = styled.span`
  font-size: 14px;
  font-weight: bold;
`;

interface RoomItemProps {
  item?: RoomListItem;
  onClickItem?: (roomId: string) => void;
}

const mapGameState = {
  ready: '대기 중',
  start: '게임 중',
  readyRound: '게임 중',
  interval: '게임 중',
  play: '게임 중',
  end: '게임 중'
};

const level = ['쉬움', '보통', '어려움'];

const RoomItem = ({ item, onClickItem }: RoomItemProps) => {
  const handleItemClick = useCallback(() => {
    if (item && onClickItem) {
      onClickItem(item.roomId);
    }
  }, [item, onClickItem]);

  return (
    <Container onClick={handleItemClick} isActive={item !== undefined}>
      {item && (
        <>
          <Top>
            <Title>{item.title}</Title>
            <MasterName>방장 : {item.masterName}</MasterName>
          </Top>
          <Bottom state={item.state}>
            <GameState>
              {mapGameState[item.state]} ({item.userCount}/6)
            </GameState>
            <Right>
              {item.state !== 'ready' && <Round>ROUND{item.currentRound}</Round>}
              <Level level={item.level}>{level[item.level - 1]}</Level>
            </Right>
          </Bottom>
        </>
      )}
    </Container>
  );
};

export default React.memo(RoomItem);
