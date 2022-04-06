import React, { useContext, useRef, useState } from 'react';
import styled from 'styled-components';

import { SocketContext } from 'context/socket';
import { Chat } from 'types/chat';
import ChatList from './ChatList';

const Container = styled.div`
  width: 33%;
  height: 100%;
  border: 1px soild black;

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

const ChatRegion = () => {
  const [chatListItem, setChatListItems] = useState<Chat[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const socket = useContext(SocketContext);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    const message = inputRef.current?.value;
    if (message) {
      console.log(message);
      inputRef.current.value = '';
    }
  };

  return (
    <Container>
      <ChatList items={chatListItem} />
      <ChatForm onSubmit={sendMessage}>
        <input ref={inputRef} />
      </ChatForm>
    </Container>
  );
};

export default ChatRegion;
