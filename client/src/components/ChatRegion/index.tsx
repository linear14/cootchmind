import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
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
  const socket = useContext(SocketContext);

  const { name } = useContext(UserContext);
  const [chatListItem, setChatListItems] = useState<Chat[]>([]);
  const [chatAvailable, setChatAvailalbe] = useState<boolean>(true);
  const [userChatTime, setUserChatTime] = useState<number[]>([]);
  const [chatBlocking, setChatBlocking] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const sendMessage = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const message = inputRef.current?.value;

      if (name && message && chatAvailable && !chatBlocking) {
        socket.emit('chat', { name, message });
        inputRef.current.value = '';
        setChatAvailalbe(false);

        setTimeout(() => {
          setChatAvailalbe(true);
        }, 350);

        // 너무 많이 보냈는지 체크~
        if (userChatTime.length < 4) {
          setUserChatTime(userChatTime.concat(Date.now()));
        } else {
          const currentChatTime = Date.now();
          const oldestChatTime = userChatTime[0];
          if (currentChatTime - oldestChatTime <= 3500) {
            setUserChatTime([]);
            setChatBlocking(true);
            setTimeout(() => {
              setChatBlocking(false);
            }, 10 * 1000);
          } else {
            setUserChatTime([...userChatTime.slice(1), currentChatTime]);
          }
        }
      }
    },
    [socket, name, chatAvailable, chatBlocking, userChatTime]
  );

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
        <ChatInput
          type='text'
          ref={inputRef}
          placeholder={chatBlocking ? '채팅이 너무 빨라요ㅜㅜ 10초만 쉬고 오세요' : '채팅창'}
          disabled={chatBlocking}
          maxLength={50}
        />
      </ChatForm>
    </Container>
  );
};

export default React.memo(ChatRegion);
