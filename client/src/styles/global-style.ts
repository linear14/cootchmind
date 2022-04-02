import { createGlobalStyle } from 'styled-components';
import { reset } from 'styled-reset';

export const GlobalStyle = createGlobalStyle`
  ${reset}

  body {
    box-sizing: border-box;
  }

  * {
    box-sizing: inherit;
  }
`;
