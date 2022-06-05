import { GameStateContext } from 'context/game';
import { RoomContext } from 'context/room';
import { SocketContext } from 'context/socket';
import { UserContext } from 'context/user';
import React, {
  useCallback,
  useEffect,
  MouseEvent,
  useState,
  useRef,
  useContext,
  useMemo
} from 'react';
import styled from 'styled-components';

interface SketchBookProps {
  canvasWidth?: number;
}

const Container = styled.div`
  margin-top: 1rem;
  position: relative;
`;

const Canvas = styled.canvas`
  border: 1px solid black;
  background: white;
  cursor: crosshair;
`;

interface PointList {
  offsetX: number;
  offsetY: number;
  width: number;
  color: string;
}

const MAX_TIME = 2000;
const THROTTLING_TIME = 1000;

const SketchBook = React.forwardRef<HTMLCanvasElement, SketchBookProps>(
  ({ canvasWidth }, canvasRef) => {
    const socket = useContext(SocketContext);
    const { uuid } = useContext(UserContext);
    const { roomId } = useContext(RoomContext);
    const { state, turn } = useContext(GameStateContext);
    const [isDrawing, setDrawing] = useState<boolean>(false);
    const [startDrawingTime, setStartDrawingTime] = useState<number>(0);
    const [fromServerPointList, setFromServerPointList] = useState<
      {
        time: number;
        pointList: PointList[];
        pointer: number;
        size: number;
      }[]
    >([]);
    const pointerToDrawingServerItems = useRef<number>(0);
    const toServerPointListRef = useRef<PointList[]>([]);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);
    const animationRef = useRef<number>();

    const canDraw = useMemo(
      () => state === 'play' && turn?.uuid === uuid,
      [state, turn?.uuid, uuid]
    );

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
    }, [canvasRef]);

    const drawStart = useCallback(
      (e: MouseEvent) => {
        e.preventDefault();

        const context = contextRef.current;
        if (!context) {
          initCanvasContext();
          return;
        }

        if (!canDraw) {
          return;
        }

        if (canvasWidth) {
          const { nativeEvent, button } = e;
          const { offsetX, offsetY } = nativeEvent;
          const ratio = 2000 / canvasWidth;

          if (button < 3) {
            const width = button === 0 ? 10 : button === 1 ? 30 : 60;
            context.lineWidth = width;
            context.beginPath();
            context.moveTo(offsetX * ratio, offsetY * ratio);
            setDrawing(true);
            setStartDrawingTime(Date.now());

            toServerPointListRef.current = toServerPointListRef.current.concat({
              offsetX,
              offsetY,
              width: context.lineWidth,
              color: context.strokeStyle as string
            });
          }
        }
      },
      [initCanvasContext, canvasWidth, canDraw]
    );

    const draw = useCallback(
      ({ nativeEvent }: MouseEvent) => {
        if (!isDrawing || !canDraw) {
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

          toServerPointListRef.current = toServerPointListRef.current.concat({
            offsetX,
            offsetY,
            width: context.lineWidth,
            color: context.strokeStyle as string
          });
        }
      },
      [isDrawing, initCanvasContext, canvasWidth, canDraw]
    );

    const drawServerItem = useCallback(
      ({ offsetX, offsetY, width, color }, isStart: boolean, isEnd: boolean) => {
        const context = contextRef.current;
        if (context && canvasWidth) {
          if (context.lineWidth !== width) {
            context.lineWidth = width;
          }
          if (context.strokeStyle !== color) {
            context.strokeStyle = color;
          }
          const ratio = 2000 / canvasWidth;
          if (isStart) {
            context.beginPath();
            context.moveTo(offsetX * ratio, offsetY * ratio);
          }
          context.lineTo(offsetX * ratio, offsetY * ratio);
          context.stroke();
          if (isEnd) {
            context.closePath();
          }
        }
      },
      [canvasWidth]
    );

    const drawEnd = useCallback(() => {
      const context = contextRef.current;
      if (!context) {
        initCanvasContext();
        return;
      }

      if (uuid && isDrawing && canDraw) {
        const drawingTime = Date.now() - startDrawingTime;
        socket.emit('submitPaint', {
          uuid,
          roomId,
          time: drawingTime,
          pointList: toServerPointListRef.current
        });
      }

      context.closePath();
      setDrawing(false);
      setStartDrawingTime(0);
      toServerPointListRef.current = [];
    }, [socket, roomId, uuid, startDrawingTime, initCanvasContext, isDrawing, canDraw]);

    useEffect(() => {
      if (canvasWidth && canvasRef) {
        const canvas = (canvasRef as React.MutableRefObject<HTMLCanvasElement | null>).current;
        if (canvas) {
          initCanvas(canvas);
          initCanvasContext();
        }
      }
    }, [canvasWidth, canvasRef, initCanvas, initCanvasContext]);

    useEffect(() => {
      if (socket) {
        socket.on('onDraw', ({ time, pointList }) => {
          setFromServerPointList((prev) =>
            prev.concat({ time, pointList, pointer: 0, size: pointList.length })
          );
        });

        return () => {
          socket.off('onDraw');
        };
      }
    }, [socket]);

    useEffect(() => {
      const isWaitingServerDrawingData = state === 'play' && turn?.uuid !== uuid;

      function drawFromServer() {
        if (isWaitingServerDrawingData) {
          const pointer = pointerToDrawingServerItems.current;
          if (fromServerPointList.length > pointer) {
            const pointGroup = fromServerPointList[pointer];
            const nextItem = pointGroup.pointList[pointGroup.pointer];
            const isStart = pointGroup.pointer === 0;
            const isEnd = pointGroup.size - 1 === pointGroup.pointer;

            drawServerItem(
              {
                offsetX: nextItem.offsetX,
                offsetY: nextItem.offsetY,
                width: nextItem.width,
                color: nextItem.color
              },
              isStart,
              isEnd
            );

            pointGroup.pointer = pointGroup.pointer + 1;

            // 해당 그룹을 모두 돌았다면 다음 그룹을 순회하기 위한 조건 변경
            if (pointGroup.size <= pointGroup.pointer) {
              pointerToDrawingServerItems.current = pointerToDrawingServerItems.current + 1;
            }
          }
          animationRef.current = requestAnimationFrame(drawFromServer);
        } else {
          if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
          }
        }
      }
      animationRef.current = requestAnimationFrame(drawFromServer);
    }, [state, turn, uuid, fromServerPointList, pointerToDrawingServerItems, drawServerItem]);

    if (!canvasWidth) return null;
    return (
      <Container>
        <Canvas
          ref={canvasRef}
          onMouseDown={drawStart}
          onContextMenu={(e) => e.preventDefault()}
          onMouseMove={draw}
          onMouseUp={drawEnd}
          onMouseLeave={drawEnd}
        />
      </Container>
    );
  }
);

export default SketchBook;
