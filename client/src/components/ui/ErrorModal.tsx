import styled from 'styled-components';

import ModalPortal from 'wrapper/ModalPortal';

const Container = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  background-color: rgba(0, 0, 0, 0.4);

  display: flex;
  justify-content: center;
  align-items: center;
`;

const Content = styled.div`
  width: 400px;
  height: 280px;
  background: white;
  border: 1px solid black;
  padding: 1rem;
  white-space: pre-wrap;
  line-height: 1.5;

  display: flex;
  flex-direction: column;
  justify-content: space-between;

  h2 {
    text-align: center;
    font-size: 1.5rem;
    line-height: 1.5rem;
  }
`;

const Buttons = styled.div`
  display: flex;
  gap: 1rem;
`;

const ConfirmButton = styled.button`
  flex: 1;
  height: 36px;
  line-height: 36px;
  text-align: center;
  border: 1px solid black;
  cursor: pointer;

  &::after {
    content: '확인';
  }
`;

interface ErrorModalProps {
  message: string;
  onClose: () => void;
}

const ErrorModal = ({ message, onClose }: ErrorModalProps) => {
  return (
    <ModalPortal>
      <Container>
        <Content>
          <h2>알림</h2>
          <p>{message}</p>
          <Buttons>
            <ConfirmButton onClick={onClose} />
          </Buttons>
        </Content>
      </Container>
    </ModalPortal>
  );
};

export default ErrorModal;
