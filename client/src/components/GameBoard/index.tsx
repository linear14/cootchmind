import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import AnswerInput from './AnswerInput';
import Palette from './Palette';
import SketchBook from './SketchBook';
import Timer from './Timer';

const Container = styled.div`
  position: relative;
  width: 60%;
  border: 1px solid black;
`;

const Flex = styled.div`
  margin-top: 4rem;
  display: flex;
  justify-content: space-between;
`;

const GameBoard = () => {
  const [canvasWidth, setCanvasWidth] = useState<number>();
  const board = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCanvasWidth(board.current?.offsetWidth);
    window.onresize = () => setCanvasWidth(board.current?.offsetWidth);

    return () => {
      window.onresize = null;
    };
  }, []);

  return (
    <Container ref={board}>
      <SketchBook canvasWidth={canvasWidth} />
      <Palette />
      <Flex>
        <Timer />
        <AnswerInput />
      </Flex>
    </Container>
  );
};

export default GameBoard;
