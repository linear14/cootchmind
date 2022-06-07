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
  gap: 12px;
  font-size: 36px;
  font-weight: bold;
  background-color: white;
  z-index: 5;
`;

const Title = styled.div``;

const Answer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1rem;
  border: 1px solid black;
  align-items: center;
  gap: 8px;

  span {
    font-size: 14px;
  }

  div {
    font-size: 18px;
    font-weight: bold;
  }
`;

const WinPlayer = styled.div`
  span {
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
      <Title>{`${result.round}라운드 종료!`}</Title>
      <WinPlayer>
        {result.winPlayer ? (
          <>
            <span>{result.winPlayer?.name}</span>님의 정답
          </>
        ) : (
          '제한시간 초과'
        )}
      </WinPlayer>
      <Answer>
        <span>정답</span>
        <div>{result.answer}</div>
      </Answer>
    </Container>
  );
};

export default RoundResultBanner;
