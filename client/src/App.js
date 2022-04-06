import { GlobalStyle } from 'styles/global-style';
import { Route, Routes } from 'react-router-dom';

import SocketContextProvider from 'context/socket';
import Layout from 'pages/_layout';
import GamePage from 'pages/GamePage';
import LoginPage from 'pages/LoginPage';
import RoomListPage from 'pages/RoomListPage';

function App() {
  return (
    <>
      <GlobalStyle />
      <SocketContextProvider>
        <Layout>
          <Routes>
            <Route path='/' element={<RoomListPage />} />
            <Route path='/login' element={<LoginPage />} />
            <Route path='/game' element={<GamePage />} />
            <Route path='*' element={<div>Not Found</div>} />
          </Routes>
        </Layout>
      </SocketContextProvider>
    </>
  );
}

export default App;
