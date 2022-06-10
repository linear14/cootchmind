import { useMemo, useRef } from 'react';
import styled, { css } from 'styled-components';

const Container = styled.div`
  position: relative;
  padding: 1rem;
  border: 1px solid black;
`;

const Row = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;

  & + & {
    margin-top: 1rem;
  }
`;

const ColorItem = styled.div<{ colorHex: string }>`
  width: calc((100% - 4rem) / 5);
  aspect-ratio: 1;

  border: 1px solid black;
  background-color: ${({ colorHex }) => colorHex || 'black'};
  cursor: pointer;
`;

interface ColorListProps {
  onClickItem: (colorHex: string) => void;
}

const ColorList = ({ onClickItem }: ColorListProps) => {
  const itemList = useMemo(
    () => [
      ['#000000', '#ff0000', '#ffff00', '#008000', '#0000ff'],
      ['#800080', '#00ff00', '#964b00', '#ffffff']
    ],
    []
  );

  return (
    <Container>
      {itemList.map((row, idx) => (
        <Row key={idx}>
          {row.map((hexCode) => (
            <ColorItem key={hexCode} colorHex={hexCode} onClick={onClickItem.bind(this, hexCode)} />
          ))}
        </Row>
      ))}
    </Container>
  );
};

export default ColorList;
