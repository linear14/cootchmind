import styled from 'styled-components';

const Container = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: white;
  z-index: 5;

  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Round = styled.div`
  margin-top: 100px;
  font-size: 36px;
  font-weight: bold;
`;

const Player = styled.div`
  margin-top: 24px;
  font-size: 22px;
  font-weight: bold;

  &::before {
    font-size: 18px;
    font-weight: normal;
    content: '이번 그림은 ';
    white-space: pre;
  }

  &::after {
    font-size: 18px;
    font-weight: normal;
    content: '님이 그립니다!';
    white-space: pre;
  }
`;

interface NextGameBannerProps {
  currentRound?: number;
  name?: string;
}

const NextGameBanner = ({ currentRound, name }: NextGameBannerProps) => {
  return (
    <Container>
      <Round>Round {currentRound}</Round>
      <Player>{name}</Player>
    </Container>
  );
};

export default NextGameBanner;
