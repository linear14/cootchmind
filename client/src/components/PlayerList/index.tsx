import { GameStateContext } from 'context/game';
import { PlayerListContext } from 'context/playerList';
import { useContext, useMemo } from 'react';
import styled from 'styled-components';

import PlayerItem from './PlayerItem';

const Container = styled.div`
  width: 100%;

  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PlayerList = () => {
  const { playerList } = useContext(PlayerListContext);
  const { state, turn } = useContext(GameStateContext);

  const turnIndex = useMemo(() => {
    if (!state || !turn || state !== 'play') {
      return undefined;
    }
    if (turn.idx !== undefined) {
      return turn.idx;
    }
    return undefined;
  }, [state, turn]);

  return (
    <Container>
      {playerList.map((item, idx) => (
        <PlayerItem
          key={item?.uuid ?? `pi${idx}`}
          player={item}
          turnHighlight={turnIndex === idx}
        />
      ))}
    </Container>
  );
};

export default PlayerList;
