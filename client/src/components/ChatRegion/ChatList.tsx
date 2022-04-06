import { useEffect, useRef } from 'react';
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
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // scroll to bottom
    bottomRef.current?.scrollIntoView();
  }, [items]);

  return (
    <Container>
      {items.map((item, idx) => (
        <ChatItem key={idx} item={item} />
      ))}
      <div ref={bottomRef}></div>
    </Container>
  );
};

export default ChatList;
