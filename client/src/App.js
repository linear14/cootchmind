import { GlobalStyle } from 'styles/global-style';
import { Route, Routes } from 'react-router-dom';

import Layout from 'pages/_layout';
import GamePage from 'pages/GamePage';
import LoginPage from 'pages/LoginPage';
import RoomListPage from 'pages/RoomListPage';

function App() {
  return (
    <>
      <GlobalStyle />
      <Layout>
        <Routes>
          <Route path='/' element={<LoginPage />} />
          <Route path='/game' element={<GamePage />} />
          <Route path='/game-list' element={<RoomListPage />} />
          <Route path='*' element={<div>Not Found</div>} />
        </Routes>
      </Layout>
    </>
  );
}

export default App;
