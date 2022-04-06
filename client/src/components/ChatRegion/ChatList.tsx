import styled from 'styled-components';

import { Chat } from 'types/chat';
import ChatItem from './ChatItem';

const Container = styled.div`
  width: 100%;
  flex: 1;
`;

interface ChatListProps {
  items: Chat[];
}

const ChatList = ({ items }: ChatListProps) => {
  return (
    <Container>
      {items.map((item) => (
        <ChatItem item={item} />
      ))}
    </Container>
  );
};

export default ChatList;
