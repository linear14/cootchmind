import styled from 'styled-components';

import { Player } from 'types/player';

const Container = styled.div<{ highlight: boolean }>`
  width: 100%;
  height: 80px;
  padding: 1rem;

  border: ${({ highlight }) => (highlight ? '2px solid red' : '1px solid black')};
  background-color: white;

  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const PlayerName = styled.div`
  font-size: 18px;
  font-weight: bold;
`;

const AnswerCount = styled.div``;

interface PlayerItemProps {
  player: Player | null;
  turnHighlight: boolean;
}

const PlayerItem = ({ player, turnHighlight }: PlayerItemProps) => {
  return (
    <Container highlight={turnHighlight}>
      <PlayerName>{player && player.name}</PlayerName>
      <AnswerCount>{player && `정답수 : ${player.answerCnt}`}</AnswerCount>
    </Container>
  );
};

export default PlayerItem;
