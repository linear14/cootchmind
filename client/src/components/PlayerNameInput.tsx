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

const StartButton = styled.button`
  height: 32px;
  font-size: 16px;

  &::after {
    content: '시작하기';
  }
`;

const PlayerNameInput = () => {
  const playerNameInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const savePlayerName = () => {
    const playerName = playerNameInputRef.current?.value;
    if (!playerName || playerName.length > 12) {
      alert('닉네임 조건 (최대 12글자)');
      return;
    }
    localStorage.setItem('player-name', playerName);
    localStorage.setItem('uuid', uuid());
    navigate('/', { replace: true });
  };

  return (
    <Container>
      <Input
        type='text'
        placeholder='게임에서 사용할 닉네임을 입력해주세요'
        ref={playerNameInputRef}
      />
      <StartButton onClick={savePlayerName} />
    </Container>
  );
};

export default PlayerNameInput;
