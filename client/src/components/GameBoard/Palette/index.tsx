import { useCallback } from 'react';
import styled from 'styled-components';

import ColorList from './ColorList';
import EraseAllButton from './EraseAllButton';

const Container = styled.div`
  margin-top: 1rem;
  display: flex;
  gap: 1rem;
`;


interface PaletteProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

const Palette = ({ canvasRef }: PaletteProps) => {
  return (
    <Container>
      <ColorList />
      <EraseAllButton onClick={eraseAll} />
    </Container>
  );
};

export default Palette;
