import styled from 'styled-components';
import NavButtons from './NavButtons';
import Room from './Room';

const Container = styled.div`
  flex: 1;
  border: 1px solid black;

  display: flex;
  flex-direction: column;
`;

const ListContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
`;

const RoomList = () => {
  return (
    <Container>
      <ListContainer>
        <Room />
        <Room />
        <Room />
        <Room />
        <Room />
        <Room />
        <Room />
        <Room />
      </ListContainer>
      <NavButtons />
    </Container>
  );
};

export default RoomList;
