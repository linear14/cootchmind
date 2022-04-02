import styled from 'styled-components';

const Container = styled.div`
  height: 48px;
  margin: 1rem auto;

  display: flex;
  gap: 1rem;
`;

const PrevButton = styled.button`
  width: 48px;
  height: 48px;
`;

const NextButton = styled.button`
  width: 48px;
  height: 48px;
`;

const Page = styled.div`
  font-size: 16px;
  line-height: 48px;
`;

const NavButtons = () => {
  return (
    <Container>
      <PrevButton />
      <Page>1/3</Page>
      <NextButton />
    </Container>
  );
};

export default NavButtons;
