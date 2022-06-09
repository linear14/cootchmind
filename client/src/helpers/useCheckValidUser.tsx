import { UserContext } from 'context/user';
import { useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLocalStorageUser } from './authUtil';

const useCheckValidUser = () => {
  const { uuid, playerName, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const initializeUser = useCallback(() => {
    window.localStorage.removeItem('uuid');
    window.localStorage.removeItem('player-name');
    setUser({ uuid: undefined, playerName: undefined });
    navigate('/login', { replace: true });
  }, [navigate, setUser]);

  const check = useCallback(() => {
    const { uuid: localUUID, playerName: localPlayerName } = getLocalStorageUser();
    if (uuid !== localUUID || playerName !== localPlayerName) {
      initializeUser();
      return false;
    }
    return true;
  }, [uuid, playerName, initializeUser]);

  return { check, initializeUser };
};

export default useCheckValidUser;
