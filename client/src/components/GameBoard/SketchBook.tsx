import { useEffect, useRef } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  width: 1080px;
  height: 720px;
  border: 1px solid black;
`;

const SketchBook = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, 1080, 720);
      }
    }
  }, []);

  return (
    <Container>
      <canvas ref={canvasRef} width={1080} height={720}></canvas>
    </Container>
  );
};

export default SketchBook;
