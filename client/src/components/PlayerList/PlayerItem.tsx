import styled, { css } from 'styled-components';

import { Player } from 'types/player';

const Container = styled.div<{ highlight: boolean }>`
  width: 100%;
  height: calc(50% / 3);

  ${({ highlight }) =>
    highlight
      ? css`
          border: 2px solid red;
        `
      : css`
          border: 1px solid black;
        `}
`;

interface PlayerItemProps {
  item: Player | null;
  turnHighlight: boolean;
}

const PlayerItem = ({ item, turnHighlight }: PlayerItemProps) => {
  return <Container highlight={turnHighlight}>{item && item.name}</Container>;
};

export default PlayerItem;
