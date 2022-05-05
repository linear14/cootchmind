import { Player } from './player';

export interface Room {
  roomId: string;
  title: string;
  players: (Player | null)[];
  master: { name: string; uuid: string };
  turn?: { name: string; uuid: string; idx: number };
  quizIndices: number[];
  currentRound: number;
  kickedUserUUIDList: string[];
  state: GameState;
}

// 시작 전, 게임 시작, 라운드 넘어가는 사이 중간 상태, 게임 진행중인 상태, 점수 표
type GameState = 'ready' | 'start' | 'interval' | 'play' | 'end';
