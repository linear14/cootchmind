import React, { useContext, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import { SocketContext } from 'context/socket';
import { Chat } from 'types/chat';
import ChatList from './ChatList';
import { UserContext } from 'context/user';

const Container = styled.div`
  position: relative;
  width: 33%;
  height: 100%;
  padding: 1rem 1rem 1rem 0;

  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ChatForm = styled.form`
  width: 100%;
  height: 48px;
  line-height: 48px;
  font-size: 16px;
`;

const ChatInput = styled.input`
  width: 100%;
  height: 32px;
  outline: none;
`;

const ChatRegion = () => {
  const { uuid, playerName } = useContext(UserContext);
  const [chatListItem, setChatListItems] = useState<Chat[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const socket = useContext(SocketContext);

  // 채팅 보내기 (별도의 회원 정보 위조여부 검사하지 않습니다.)
  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    const message = inputRef.current?.value;

    if (playerName && uuid && message) {
      socket.emit('chat', { playerName, message });
      inputRef.current.value = '';
    }
  };

  useEffect(() => {
    socket.on('onChat', (chat: Chat) => {
      setChatListItems((prev) => {
        const MAX_LIST_LENGTH = 100;
        const newListLength = prev.length + 1;

        return prev
          .concat(chat)
          .slice(newListLength > MAX_LIST_LENGTH ? newListLength - MAX_LIST_LENGTH : 0);
      });
    });

    return () => {
      socket.off('onChat');
    };
  }, [socket]);

  return (
    <Container>
      <ChatList items={chatListItem} />
      <ChatForm onSubmit={sendMessage}>
        <ChatInput ref={inputRef} placeholder='채팅창' />
      </ChatForm>
    </Container>
  );
};

export default React.memo(ChatRegion);
