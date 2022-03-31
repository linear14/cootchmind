import styled from 'styled-components';
import GameBoard from 'components/GameBoard';
import PlayerList from 'components/PlayerList';

const GameContainer = styled.div`
  width: 100%;
  margin: 32px auto 0px;

  display: flex;
  justify-content: center;

  // border: 1px solid black;
`;

const GamePage = () => {
  return (
    <>
      <GameContainer>
        <PlayerList />
        <GameBoard />
        <PlayerList />
      </GameContainer>
    </>
  );
};

export default GamePage;
