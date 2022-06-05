import { UserContext } from 'context/user';
import { useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLocalStorageUser } from './authUtil';

const useCheckValidUser = () => {
  const { uuid, playerName, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const check = useCallback(() => {
    const { uuid: localUUID, playerName: localPlayerName } = getLocalStorageUser();
    // console.log(uuid, localUUID);
    if (uuid !== localUUID || playerName !== localPlayerName) {
      window.localStorage.removeItem('uuid');
      window.localStorage.removeItem('player-name');
      setUser({ uuid: undefined, playerName: undefined });
      navigate('/login', { replace: true });
      return false;
    }
    return true;
  }, [navigate, uuid, playerName, setUser]);

  return check;
};

export default useCheckValidUser;
