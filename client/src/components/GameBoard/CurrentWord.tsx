import styled from 'styled-components';

const Container = styled.div<{ hidden?: boolean }>`
  width: 100%;
  height: 60px;
  line-height: 24px;
  border: 1px solid black;
  background-color: white;

  font-size: 24px;
  font-weight: bold;

  display: flex;
  justify-content: center;
  align-items: center;
`;

interface CurrentWordProps {
  answer?: string;
}

const CurrentWord = ({ answer }: CurrentWordProps) => {
  return <Container>{answer}</Container>;
};

export default CurrentWord;
