import styled from 'styled-components';

const Container = styled.div<{ hidden?: boolean }>`
  width: 100%;
  height: 80px;
  line-height: 28px;
  border: 1px solid black;
  background-color: white;
  padding: 0.5rem;

  font-size: 22px;
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
