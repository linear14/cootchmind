import { GlobalStyle } from 'styles/global-style';
import GamePage from 'pages/GamePage';
import LoginPage from 'pages/LoginPage';
import Layout from 'pages/_layout';
import RoomListPage from 'pages/RoomListPage';

function App() {
  return (
    <>
      <GlobalStyle />
      <Layout>
        {/* <LoginPage/> */}
        <RoomListPage />
      </Layout>
    </>
  );
}

export default App;
