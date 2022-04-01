import styled from 'styled-components';

/* style */

const InnerContainer = styled.div`
  position: relative;
  width: calc(90vh * 1.28);
  min-width: calc(660px * 1.28);
  max-width: calc(870px * 1.28);
  height: 90vh;
  min-height: 660px;
  max-height: 870px;
  margin: 36px auto 0px;
  border: 1px solid black;
`;

/* Component */

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return <InnerContainer>{children}</InnerContainer>;
};

export default Layout;
