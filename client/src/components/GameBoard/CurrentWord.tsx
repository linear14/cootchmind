import styled from 'styled-components';

const Container = styled.div<{ hidden?: boolean }>`
  position: absolute;
  padding: 1rem;
  bottom: 0;
  right: 0;
  border: 1px solid black;

  line-height: 18px;
  font-size: 18px;
  font-weight: bold;

  display: flex;
  justify-content: center;
  align-items: center;
`;

interface CurrentWordProps {
  answer: string;
}

const CurrentWord = ({ answer }: CurrentWordProps) => {
  return <Container>{answer}</Container>;
};

export default CurrentWord;
