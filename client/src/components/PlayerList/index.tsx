import styled from 'styled-components';

import { Player } from 'types/player';
import PlayerItem from './PlayerItem';

const Container = styled.div`
  flex: 1;
  background: transparent;
  // border: 1px solid black;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

interface PlayerListProps {
  listItem: (Player | null)[];
  turnIndex?: number;
}

const PlayerList = ({ listItem, turnIndex }: PlayerListProps) => {
  return (
    <Container>
      {listItem.map((item, idx) => (
        <PlayerItem key={item?.uuid ?? `pi${idx}`} item={item} turnHighlight={turnIndex === idx} />
      ))}
    </Container>
  );
};

export default PlayerList;
