import styled from 'styled-components';
import { Link } from 'react-router-dom';

const Container = styled(Link)`
  width: calc((100% - 16px) / 2);
  height: 120px;
  border: 1px solid black;
`;

const Room = () => {
  return <Container to={'/game'}></Container>;
};

export default Room;
