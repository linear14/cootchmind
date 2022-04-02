import styled from 'styled-components';

const Container = styled.div`
  width: 120px;
  height: 36px;
  border: 1px solid black;
  font-size: 18px;
  line-height: 36px;
  text-align: center;

  &::after {
    content: '전체 지우기';
  }
`;

const EraseAllButton = () => {
  return <Container />;
};

export default EraseAllButton;
