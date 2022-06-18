import styled from 'styled-components';
import { RoundResult } from 'types/result';

const Container = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 24px;

  background-color: white;
  z-index: 5;
`;

const AnswerContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1rem;
  align-items: center;
  gap: 8px;
`;

const AnswerHeader = styled.div`
  font-size: 14px;
  span {
    font-size: 16px;
    font-weight: bold;
  }
`;

const Answer = styled.div`
  font-size: 20px;
  font-weight: bold;
  white-space: pre-wrap;
  border: 2px solid #aaaaaa;
  padding: 0.5rem 1rem;
`;

const WinPlayerContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 8px;
  font-size: 16px;
`;

const WinPlayer = styled.div`
  span {
    font-size: 18px;
    font-weight: bold;
  }
`;

interface Props {
  result?: RoundResult;
}

const RoundResultBanner = ({ result }: Props) => {
  if (!result) {
    return <Container>??</Container>;
  }

  return (
    <Container>
      <AnswerContainer>
        <AnswerHeader>
          <span>Round {result.round}</span> 정답은...
        </AnswerHeader>
        <Answer>{result.answer}</Answer>
      </AnswerContainer>
      <WinPlayerContainer>
        {result.winPlayer ? (
          <>
            <WinPlayer>
              <span>{result.winPlayer?.name}</span>님이
            </WinPlayer>
            <div>정답을 맞추어 점수를 획득합니다!</div>
          </>
        ) : (
          <div>제한시간동안 아무도 정답을 맞추지 못했어요!</div>
        )}
      </WinPlayerContainer>
    </Container>
  );
};

export default RoundResultBanner;
