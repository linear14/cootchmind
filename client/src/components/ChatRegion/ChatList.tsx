import { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import { Chat } from 'types/chat';
import ChatItem from './ChatItem';

const Container = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow-y: scroll;
  border: 1px solid black;

  ::-webkit-scrollbar {
    width: 4px;
  }

  ::-webkit-scrollbar-thumb {
    background-color: #eeeeb2;
    border-radius: 10px;
  }

  ::-webkit-scrollbar-track {
    background-color: white;
  }
`;

const MoveToBottom = styled.div`
  position: sticky;
  width: 140px;
  height: 36px;
  line-height: 36px;
  bottom: 0px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 16px;
  text-align: center;
  border: 1px solid black;

  &::after {
    content: '최근 채팅 보기';
  }
`;

interface ChatListProps {
  items: Chat[];
}

const ChatList = ({ items }: ChatListProps) => {
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const rootRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);

  const moveToBottom = useCallback(() => {
    targetRef.current?.scrollIntoView();
  }, []);

  useEffect(() => {
    if (autoScroll) {
      moveToBottom();
    }
  }, [items, autoScroll, moveToBottom]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setAutoScroll(entry.isIntersecting);
      },
      {
        root: rootRef.current
      }
    );

    if (targetRef.current) {
      observer.observe(targetRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <Container ref={rootRef}>
      {items.map((item, idx) => (
        <ChatItem key={idx} item={item} />
      ))}
      <div ref={targetRef}></div>
      {!autoScroll && <MoveToBottom onClick={() => setAutoScroll(true)} />}
    </Container>
  );
};

export default ChatList;
