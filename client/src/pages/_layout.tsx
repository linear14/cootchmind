import { useContext, useEffect, useMemo, useState } from 'react';
import styled, { css } from 'styled-components';
import ErrorModal from 'components/ui/ErrorModal';
import { SocketContext } from 'context/socket';
import { useNavigate } from 'react-router-dom';

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

interface SocketError {
  message: string;
  callback: () => void;
}
/* Component */

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const windowInnerHeight90 = useMemo(() => window.innerHeight * 0.9, []);
  const initialContainerHeight = useMemo(() => {
    return windowInnerHeight90 < MIN_HEIGHT
      ? MIN_HEIGHT
      : windowInnerHeight90 > MAX_HEIGHT
      ? MAX_HEIGHT
      : windowInnerHeight90;
  }, [windowInnerHeight90]);

  const [error, setError] = useState<SocketError | null>(null);
  const socket = useContext(SocketContext);
  const navigate = useNavigate();

  useEffect(() => {
    socket.on(
      'onError',
      ({
        message,
        navigatePath,
        wrongAccess
      }: {
        message: string;
        navigatePath?: string;
        wrongAccess?: boolean;
      }) => {
        if (navigatePath) {
          navigate(navigatePath, { replace: true });
        }
        if (wrongAccess) {
          setError({
            message,
            callback: () => {
              window.localStorage.removeItem('uuid');
              window.localStorage.removeItem('player-name');
              navigate(`/login`, { replace: true });
            }
          });
        } else {
          setError({ message, callback: () => setError(null) });
        }
      }
    );

    return () => {
      socket.off('onError');
    };
  }, [socket, navigate]);

  return (
    <InnerContainer initialHeight={initialContainerHeight}>
      {children}
      <Notice>최상의 게임 환경을 위해 브라우저 크기를 최대로 늘리고 새로고침을 눌러주세요.</Notice>
      {error && <ErrorModal message={error.message} onClose={error.callback} />}
    </InnerContainer>
  );
};

export default Layout;
