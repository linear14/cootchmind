import { useCallback } from 'react';
import styled from 'styled-components';

import ColorList from './ColorList';

const Container = styled.div`
  margin-top: 1rem;
  display: flex;
  gap: 1rem;
`;

const EraseAllButton = styled.div`
  width: 120px;
  height: 36px;
  border: 1px solid black;
  font-size: 18px;
  line-height: 36px;
  text-align: center;

  &::after {
    content: '전체 지우기';
  }
`;

interface PaletteProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

const Palette = ({ canvasRef }: PaletteProps) => {
  const setColor = useCallback(
    (colorHex: string) => {
      const canvas = canvasRef.current;
      const context = canvas?.getContext('2d');

      if (canvas && context) {
        context.strokeStyle = colorHex;
      }
    },
    [canvasRef]
  );

  const eraseAll = useCallback(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');

    if (canvas && context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [canvasRef]);

  return (
    <Container>
      <ColorList onClickItem={setColor} />
      <EraseAllButton onClick={eraseAll} />
    </Container>
  );
};

export default Palette;
