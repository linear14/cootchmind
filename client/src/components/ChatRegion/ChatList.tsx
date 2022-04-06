import styled from 'styled-components';
import { Chat } from 'types/chat';

const Container = styled.div`
  width: 100%;
  flex: 1;
  overflow-y: auto;
`;

interface ChatListProps {
  items: Chat[];
}

const ChatList = ({ items }: ChatListProps) => {
  return <Container></Container>;
};

export default ChatList;
