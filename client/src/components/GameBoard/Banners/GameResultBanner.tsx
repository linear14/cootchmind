import styled, { css } from 'styled-components';
import { GameResult } from 'types/result';

const Container = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: white;
  z-index: 5;

  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Title = styled.div`
  font-size: 24px;
  font-weight: bold;
`;

const ResultContainer = styled.div`
  width: 40%;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  border: 1px solid #aaaaaa;

  & > div:nth-of-type(1) {
    border-bottom: 1px solid #aaaaaa;
  }
`;

const ResultItem = styled.div<{ out?: boolean }>`
  width: 100%;
  display: flex;
  padding: 0.5rem 1rem;
  justify-content: center;
  align-items: center;

  .header {
    font-weight: bold;
  }

  span {
    text-align: center;
  }

  ${({ out }) =>
    out &&
    css`
      span {
        color: #cccccc;
      }
    `}
`;

const Rank = styled.span`
  width: 36px;
  min-width: 36px;
  font-size: 18px;
  font-weight: bold;
`;

const PlayerName = styled.span`
  flex: 1;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;

const AnswerCount = styled.span`
  width: 36px;
  min-width: 36px;
`;

interface Props {
  result: GameResult[];
}

const GameResultBanner = ({ result }: Props) => {
  return (
    <Container>
      <Title>게임 결과</Title>
      <ResultContainer>
        <ResultItem>
          <Rank className='header'>순위</Rank>
          <PlayerName className='header'>닉네임</PlayerName>
          <AnswerCount className='header'>점수</AnswerCount>
        </ResultItem>
        {result.map(
          (player) =>
            player && (
              <ResultItem out={player.isOut}>
                <Rank>{player.rank}</Rank>
                <PlayerName>{player.name}</PlayerName>
                <AnswerCount>{player.answerCnt}점</AnswerCount>
              </ResultItem>
            )
        )}
      </ResultContainer>
    </Container>
  );
};

export default GameResultBanner;
