import CreateRoomBtn from 'components/Buttons/CreateRoomBtn';
import RoomRefreshBtn from 'components/Buttons/RoomRefreshBtn';
import RoutePrevBtn from 'components/Buttons/RoutePrevBtn';
import ChatList from 'components/ChatList';
import RoomList from 'components/RoomList';
import styled from 'styled-components';

const Container = styled.div`
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
`;

const Body = styled.div`
  flex: 1;
  display: flex;
`;

const RoomListPage = () => {
  return (
    <Container>
      <Header>
        <RoutePrevBtn />
        <CreateRoomBtn />
        <RoomRefreshBtn />
      </Header>
      <Body>
        <ChatList />
        <RoomList />
      </Body>
    </Container>
  );
};

export default RoomListPage;
