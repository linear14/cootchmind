import styled from 'styled-components';
import AnswerInput from './AnswerInput';
import Palette from './Palette';
import SketchBook from './SketchBook';
import Timer from './Timer';

const Container = styled.div`
  padding: 1rem 2rem;
  border: 1px solid black;
`;

const Flex = styled.div`
  margin-top: 4rem;
  display: flex;
  justify-content: space-between;
`;

const GameBoard = () => {
  return (
    <Container>
      <SketchBook />
      <Palette />
      <Flex>
        <Timer />
        <AnswerInput />
      </Flex>
    </Container>
  );
};

export default GameBoard;
