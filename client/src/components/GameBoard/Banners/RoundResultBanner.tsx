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

const RoundResultBanner = () => {
  return <Container>{'라운드 종료!'}</Container>;
};

export default RoundResultBanner;
