import styled, { css } from 'styled-components';

/* style */

const MIN_HEIGHT = 660;
const MAX_HEIGHT = 870;

const InnerContainer = styled.div<{ initialHeight: number }>`
  position: relative;

  ${({ initialHeight }) => css`
    width: ${initialHeight * 1.35}px;
    height: ${initialHeight}px;
  `}
  margin: 48px auto 0px;
  border: 1px solid black;
  background-color: white;
`;

const Notice = styled.span`
  position: absolute;
  top: -28px;
  left: 50%;
  transform: translateX(-50%);

  font-size: 14px;
  line-height: 14px;
  color: #aaaaaa;
`;

/* Component */

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const windowInnerHeight90 = window.innerHeight * 0.9;
  const initialContainerHeight =
    windowInnerHeight90 < MIN_HEIGHT
      ? MIN_HEIGHT
      : windowInnerHeight90 > MAX_HEIGHT
      ? MAX_HEIGHT
      : windowInnerHeight90;

  return (
    <InnerContainer initialHeight={initialContainerHeight}>
      {children}
      <Notice>최상의 게임 환경을 위해 브라우저 크기를 최대로 늘리고 새로고침을 눌러주세요.</Notice>
    </InnerContainer>
  );
};

export default Layout;
