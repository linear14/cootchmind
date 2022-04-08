import styled from 'styled-components';

import { Player } from 'types/player';

const Container = styled.div`
  width: 100%;
  height: calc(50% / 3);
  border: 1px solid black;
`;

interface PlayerItemProps {
  item: Player | null;
}

const PlayerItem = ({ item }: PlayerItemProps) => {
  return <Container>{item && item.name}</Container>;
};

export default PlayerItem;
