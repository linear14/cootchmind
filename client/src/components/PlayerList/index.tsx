import { GameStateContext } from 'context/game';
import { useContext, useMemo } from 'react';
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
  indices: number[];
}

const PlayerList = ({ listItem, indices }: PlayerListProps) => {
  const { state, turn } = useContext(GameStateContext);

  const turnIndex = useMemo(() => {
    if (!state || !turn) {
      return undefined;
    }

    if (state !== 'play') {
      return undefined;
    }

    for (let i = 0; i < indices.length; i++) {
      if (turn.idx === indices[i]) {
        return i;
      }
    }
    return undefined;
  }, [indices, state, turn]);

  return (
    <Container>
      {listItem.map((item, idx) => (
        <PlayerItem key={item?.uuid ?? `pi${idx}`} item={item} turnHighlight={turnIndex === idx} />
      ))}
    </Container>
  );
};

export default PlayerList;
