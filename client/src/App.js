import { GlobalStyle } from 'styles/global-style';
import { Route, Routes } from 'react-router-dom';

import SocketContextProvider from 'context/socket';
import Layout from 'pages/_layout';
import GamePage from 'pages/GamePage';
import LoginPage from 'pages/LoginPage';
import RoomListPage from 'pages/RoomListPage';
import { UserContextProvider } from 'context/user';
import { GameStateContextProvider } from 'context/game';
import { RoomContextProvider } from 'context/room';
import { PlayerListContextProvider } from 'context/playerList';

function App() {
  return (
    <>
      <GlobalStyle />
      <UserContextProvider>
        <SocketContextProvider>
          <Layout>
            <Routes>
              <Route path='/' element={<RoomListPage />} />
              <Route path='/login' element={<LoginPage />} />
              <Route
                path='/game/:roomId'
                element={
                  <RoomContextProvider>
                    <PlayerListContextProvider>
                      <GameStateContextProvider>
                        <GamePage />
                      </GameStateContextProvider>
                    </PlayerListContextProvider>
                  </RoomContextProvider>
                }
              />
              <Route path='*' element={<div>Not Found</div>} />
            </Routes>
            <div id='modal'></div>
          </Layout>
        </SocketContextProvider>
      </UserContextProvider>
    </>
  );
}

export default App;
