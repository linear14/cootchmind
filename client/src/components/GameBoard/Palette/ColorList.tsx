import styled from 'styled-components';
import ColorItem from './ColorItem';

const Container = styled.div`
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

const ColorList = () => {
  return (
    <Container>
      <Row>
        <ColorItem />
        <ColorItem />
        <ColorItem />
        <ColorItem />
        <ColorItem />
      </Row>
      <Row>
        <ColorItem />
        <ColorItem />
        <ColorItem />
        <ColorItem />
      </Row>
    </Container>
  );
};

export default ColorList;
