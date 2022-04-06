import styled from 'styled-components';

import { Chat } from 'types/chat';
import ChatItem from './ChatItem';

const Container = styled.div`
  width: 100%;
  height: 100%;
  overflow-y: scroll;
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
