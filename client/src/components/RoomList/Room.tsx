import styled from 'styled-components';

const Container = styled.div`
  width: calc((100% - 16px) / 2);
  height: 120px;
  border: 1px solid black;
`;

const Room = () => {
  return <Container></Container>;
};

export default Room;
