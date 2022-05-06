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
`;

const StartGameBanner = () => {
  return <Container>{'게임 시작!'}</Container>;
};

export default StartGameBanner;
