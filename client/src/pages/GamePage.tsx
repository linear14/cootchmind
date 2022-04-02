import styled from 'styled-components';
import GameBoard from 'components/GameBoard';
import PlayerList from 'components/PlayerList';

const Container = styled.div`
  width: 100%;
  height: 100%;
  background: #203d20;

  display: flex;
`;

const GamePage = () => {
  return (
    <Container>
      <PlayerList />
      <GameBoard />
      <PlayerList />
    </Container>
  );
};

export default GamePage;
