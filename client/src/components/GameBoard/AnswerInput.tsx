import styled from 'styled-components';

const Container = styled.input`
  width: calc(100% - 2rem);
  height: 32px;
  display: block;
  margin: 1rem auto;
  border: 1px solid black;
`;

const AnswerInput = () => {
  return <Container placeholder='채팅창' />;
};

export default AnswerInput;
