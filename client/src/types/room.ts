import { Player } from './player';
import { User } from './user';

export interface Room {
  roomId: string;
  title: string;
  master: User;
  players: (Player | null)[];
  currentRound: number;
  state: GameState;
  turn?: { name: string; uuid: string; idx: number };
}

export interface RoomListItem {
  roomId: string;
  title: string;
  masterName: string;
  currentRound: number;
  state: GameState;
  kickedUserUUIDList: string[];
}

export interface RoomDataImmutable {
  roomId: string;
  title: string;
  master: Required<User>;
}

export interface RoomGameState {
  state: GameState;
  currentRound: number;
  turn?: { name: string; uuid: string; idx: number };
}

// 시작 전, 라운드 넘어가는 사이 중간 상태, 게임 진행중인 상태
type GameState = 'ready' | 'start' | 'readyRound' | 'interval' | 'play' | 'end';
