import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { v4 as uuid } from 'uuid';

const Container = styled.div`
  width: 400px;

  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Input = styled.input`
  height: 36px;
  font-size: 16px;
  line-height: 36px;
`;

const Button = styled.button`
  height: 32px;
  font-size: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const PlayerNameInput = () => {
  const playerNameInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const savePlayerName = () => {
    const playerName = playerNameInputRef.current?.value;
    if (!playerName || playerName.length > 10) {
      alert('닉네임 조건 (최대 10글자)');
      return;
    }
    const newUUID = uuid();
    localStorage.setItem('player-name', playerName);
    localStorage.setItem('uuid', newUUID);
    navigate('/', { replace: true });
  };

  return (
    <Container>
      <Input
        type='text'
        placeholder='게임에서 사용할 닉네임을 입력해주세요'
        ref={playerNameInputRef}
      />
      <Button type='button' onClick={savePlayerName}>
        시작하기
      </Button>
    </Container>
  );
};

export default PlayerNameInput;
