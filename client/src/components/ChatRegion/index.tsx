import React, { useContext, useEffect, useRef, useState } from 'react';
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

    const playerName = localStorage.getItem('player-name');
    const message = inputRef.current?.value;

    if (playerName && message) {
      const newChat = { from: playerName, message };
      socket.emit('onChat', newChat);
      inputRef.current.value = '';
    }
  };

  useEffect(() => {
    socket.on('onChatReceived', (chat: Chat) => {
      setChatListItems((prev) => {
        const MAX_LIST_LENGTH = 100;
        const newListLength = prev.length + 1;

        return prev
          .concat(chat)
          .slice(newListLength > MAX_LIST_LENGTH ? newListLength - MAX_LIST_LENGTH : 0);
      });
    });

    return () => {
      socket.off('onChatReceived');
    };
  }, [socket]);

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
