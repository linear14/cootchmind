import { useCallback, useEffect, useRef, MouseEvent, useState, useMemo } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  width: 1080px;
  height: 720px;
  border: 1px solid black;
`;

const SketchBook = () => {
  const [isDrawing, setDrawing] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [defaultWidth, defaultHeight] = [useMemo(() => 1080, []), useMemo(() => 720, [])];

  const drawStart = useCallback(({ nativeEvent }: MouseEvent) => {
    const context = contextRef.current;
    if (!context) {
      initCanvasContext();
      return;
    }

    const { offsetX, offsetY } = nativeEvent;
    context.beginPath();
    context.moveTo(offsetX * 2, offsetY * 2);
    setDrawing(() => true);
  }, []);

  const draw = useCallback(
    ({ nativeEvent }: MouseEvent) => {
      if (!isDrawing) {
        return;
      }

      const context = contextRef.current;
      if (!context) {
        initCanvasContext();
        return;
      }

      const { offsetX, offsetY } = nativeEvent;
      context.lineTo(offsetX * 2, offsetY * 2);
      context.stroke();
    },
    [isDrawing]
  );

  const drawEnd = useCallback(() => {
    const context = contextRef.current;
    if (!context) {
      initCanvasContext();
      return;
    }

    context.closePath();
    setDrawing(() => false);
  }, []);

  const initCanvas = useCallback((canvas: HTMLCanvasElement | null) => {
    if (!canvas) {
      return;
    }
    // casvas의 실제 너비를 몇 칸으로 쪼갤건지 (많이 쪼갤수록 세밀한 작업이 가능할 것 같음)
    canvas.width = defaultWidth * 2;
    canvas.height = defaultHeight * 2;

    // canvas의 실제 너비 / 높이
    canvas.style.width = `${defaultWidth}px`;
    canvas.style.height = `${defaultHeight}px`;
  }, []);

  const initCanvasContext = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext('2d');

    if (context) {
      context.lineCap = 'round';
      context.strokeStyle = 'black';
      context.lineWidth = 10;
      contextRef.current = context;
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      initCanvas(canvas);
      initCanvasContext();
    }
  }, []);

  return (
    <Container>
      <canvas
        ref={canvasRef}
        onMouseDown={drawStart}
        onMouseMove={draw}
        onMouseUp={drawEnd}
      ></canvas>
    </Container>
  );
};

export default SketchBook;
