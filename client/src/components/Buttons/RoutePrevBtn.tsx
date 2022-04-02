import styled from 'styled-components';

const Container = styled.div`
  width: 240px;
  height: 60px;
  font-size: 24px;
  line-height: 60px;
  text-align: center;

  border: 1px solid black;

  &::after {
    content: '뒤로가기';
  }
`;
const RoutePrevBtn = () => {
  return <Container />;
};

export default RoutePrevBtn;
