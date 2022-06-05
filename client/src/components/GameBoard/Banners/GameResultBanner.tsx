import styled from 'styled-components';

const Container = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 36px;
  font-weight: bold;
  background-color: white;
  z-index: 5;

  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Title = styled.div``;

const ResultContainer = styled.div`
  display: flex;
  gap: 16px;
`;

const Rank = styled.span``;

const PlayerName = styled.span``;

const AnswerCount = styled.span``;

const GameResultBanner = ({
  result
}: {
  result: { rank: number; name: string; answerCnt: number }[];
}) => {
  return (
    <Container>
      <Title>게임 결과</Title>
      {result.map(
        (player) =>
          player && (
            <ResultContainer>
              <Rank>{player.rank}</Rank>
              <PlayerName>{player.name}</PlayerName>
              <AnswerCount>{player.answerCnt}</AnswerCount>
            </ResultContainer>
          )
      )}
    </Container>
  );
};

export default GameResultBanner;
