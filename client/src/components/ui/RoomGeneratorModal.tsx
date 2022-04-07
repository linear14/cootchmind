import styled from 'styled-components';

const Container = styled.div`
  width: calc(90vh * 1.35);
  min-width: calc(660px * 1.35);
  max-width: calc(870px * 1.35);
  height: 90vh;
  min-height: 660px;
  max-height: 870px;
  margin: 36px auto 0px;
  background: black;

  display: flex;
  justify-content: center;
  align-items: center;
`;

const Content = styled.div`
  width: 300px;
  height: 200px;
  background: yellow;
`;

interface RoomGeneratorProps {
  onClose: () => void;
}
const RoomGeneratorModal = ({ onClose }: RoomGeneratorProps) => {
  return (
    <Container>
      <Content onClick={onClose} />
    </Container>
  );
};

export default RoomGeneratorModal;
