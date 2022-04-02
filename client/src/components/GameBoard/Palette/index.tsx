import styled from 'styled-components';
import ColorList from './ColorList';
import EraseAllButton from './EraseAllButton';

const Container = styled.div`
  margin-top: 1rem;
  display: flex;
  gap: 1rem;
`;

const Palette = () => {
  return (
    <Container>
      <ColorList />
      <EraseAllButton />
    </Container>
  );
};

export default Palette;
