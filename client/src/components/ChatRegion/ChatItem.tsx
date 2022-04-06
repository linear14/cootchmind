import styled from 'styled-components';
import { Chat } from 'types/chat';

const Container = styled.div`
  width: 100%;
`;

interface ChatProps {
  item: Chat;
}

const ChatItem = ({ item }: ChatProps) => {
  return <Container>{`${item.from}: ${item.message}`}</Container>;
};

export default ChatItem;