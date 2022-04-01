import { GlobalStyle } from 'styles/global-style';
import GamePage from 'pages/GamePage';
import LoginPage from 'pages/LoginPage';
import Layout from 'pages/_layout';

function App() {
  return (
    <>
      <GlobalStyle />
      <Layout>
        <LoginPage />
      </Layout>
    </>
  );
}

export default App;
