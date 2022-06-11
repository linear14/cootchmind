import React from 'react';
import styled from 'styled-components';
import { Chat } from 'types/chat';

const Container = styled.div`
  width: 100%;
  padding: 1rem;
  line-height: 1.2;

  span {
    font-weight: bold;
  }
`;

interface ChatProps {
  item: Chat;
}

const ChatItem = ({ item }: ChatProps) => {
  return (
    <Container>
      <span>{`${item.playerName} : `}</span>
      {item.message}
    </Container>
  );
};

export default React.memo(ChatItem);
