import styled, { css } from 'styled-components';

const Container = styled.div<{ hidden?: boolean }>`
  height: 30px;
  line-height: 30px;
  margin: 1rem auto 0px;
  text-align: center;

  display: flex;
  justify-content: center;

  ${({ hidden }) =>
    hidden &&
    css`
      display: hidden;
    `}

  div {
    background: white;
    padding: ${({ hidden }) => (hidden ? 0 : '0 1rem')};
    font-size: 18px;
  }
`;

interface CurrentWordProps {
  answer?: string;
}

const CurrentWord = ({ answer }: CurrentWordProps) => {
  return (
    <Container hidden={answer === undefined}>
      <div>{answer}</div>
    </Container>
  );
};

export default CurrentWord;
