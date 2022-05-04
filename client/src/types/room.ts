import { Player } from './player';

export interface Room {
  roomId: string;
  title: string;
  users: (Player | null)[];
  master: { name: string; uuid: string };
  turn?: { name: string; uuid: string; idx: number };
  currentRound?: number;
  state: GameState;
}

export interface RoomListItem {
  roomId: string;
  title: string;
  masterName: string;
  currentRound: number;
  state: GameState;
  kickedUserUUIDList: string[];
}

// 시작 전, 라운드 넘어가는 사이 중간 상태, 게임 진행중인 상태
type GameState = 'ready' | 'interval' | 'play';
