import styled from 'styled-components';
import Player from './Player';

const Container = styled.div`
  width: 480px;
  // border: 1px solid black;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

const PlayerList = () => {
  return (
    <Container>
      <Player />
      <Player />
      <Player />
    </Container>
  );
};

export default PlayerList;
