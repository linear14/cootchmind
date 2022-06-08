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
  height: 70%;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
`;

const Title = styled.span`
  height: 20px;
  line-height: 20px;
  font-size: 20px;
  font-weight: bold;
`;

const MasterName = styled.span`
  height: 20px;
  line-height: 20px;
  font-size: 14px;
`;

const GameState = styled.div<{ state: string }>`
  position: absolute;
  width: 100%;
  height: 30%;
  left: 0;
  bottom: 0;
  line-height: 20px;
  padding-top: 4px;
  padding-bottom: 4px;
  font-size: 14px;
  color: white;
  background-color: ${({ state }) => (state === 'ready' ? 'green' : 'red')};

  display: flex;
  justify-content: center;
  align-items: center;
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
          <GameState state={item.state}>{mapGameState[item.state]}</GameState>
        </>
      )}
    </Container>
  );
};

export default React.memo(RoomItem);
