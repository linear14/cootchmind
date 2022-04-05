import React, { useCallback, useEffect, MouseEvent, useState, useRef } from 'react';
import styled from 'styled-components';

interface SketchBookProps {
  canvasWidth?: number;
}

const Canvas = styled.canvas`
  margin-top: 1rem;
  border: 1px solid black;
  background: white;
  cursor: crosshair;
`;

const SketchBook = React.forwardRef<HTMLCanvasElement, SketchBookProps>(
  ({ canvasWidth }, canvasRef) => {
    const [isDrawing, setDrawing] = useState<boolean>(false);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);

    const initCanvas = useCallback(
      (canvas: HTMLCanvasElement | null) => {
        if (!canvas || !canvasWidth) {
          return;
        }
        // casvas의 실제 너비를 몇 칸으로 쪼갤건지 (많이 쪼갤수록 세밀한 작업이 가능할 것 같음)
        canvas.width = 2000;
        canvas.height = 1400;

        // canvas의 실제 너비 / 높이
        canvas.style.width = `${canvasWidth}px`;
        canvas.style.height = `${canvasWidth * 0.7}px`;
      },
      [canvasWidth]
    );

    const initCanvasContext = useCallback(() => {
      if (!canvasRef) {
        return;
      }

      const canvas = (canvasRef as React.MutableRefObject<HTMLCanvasElement | null>).current;
      if (!canvas) {
        return;
      }

      contextRef.current = canvas.getContext('2d');
      const context = contextRef.current;

      if (context) {
        context.lineCap = 'round';
        context.strokeStyle = 'black';
        context.lineWidth = 10;
      }
    }, []);

    const drawStart = useCallback(
      (e: MouseEvent) => {
        e.preventDefault();

        const context = contextRef.current;
        if (!context) {
          initCanvasContext();
          return;
        }

        if (canvasWidth) {
          const { nativeEvent, button } = e;
          const { offsetX, offsetY } = nativeEvent;
          const ratio = 2000 / canvasWidth;

          if (button < 3) {
            context.lineWidth = button === 0 ? 10 : button === 1 ? 30 : 60;
            context.beginPath();
            context.moveTo(offsetX * ratio, offsetY * ratio);
            setDrawing(true);
          }
        }
      },
      [initCanvasContext, canvasWidth]
    );

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

        if (canvasWidth) {
          const { offsetX, offsetY } = nativeEvent;
          const ratio = 2000 / canvasWidth;

          context.lineTo(offsetX * ratio, offsetY * ratio);
          context.stroke();
        }
      },
      [isDrawing, initCanvasContext, canvasWidth]
    );

    const drawEnd = useCallback(() => {
      const context = contextRef.current;
      if (!context) {
        initCanvasContext();
        return;
      }

      context.closePath();
      setDrawing(false);
    }, [initCanvasContext]);

    useEffect(() => {
      if (canvasWidth && canvasRef) {
        const canvas = (canvasRef as React.MutableRefObject<HTMLCanvasElement | null>).current;
        if (canvas) {
          initCanvas(canvas);
          initCanvasContext();
        }
      }
    }, [canvasWidth]);

    if (!canvasWidth) return null;
    return (
      <Canvas
        ref={canvasRef}
        onMouseDown={drawStart}
        onContextMenu={(e) => e.preventDefault()}
        onMouseMove={draw}
        onMouseUp={drawEnd}
        onMouseLeave={drawEnd}
      />
    );
  }
);

export default SketchBook;
