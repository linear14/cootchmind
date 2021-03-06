import { Player } from './player';

export interface Room {
  roomId: string;
  title: string;
  players: (Player | null)[];
  master: { name: string; socketId: string };
  turn?: { name: string; socketId: string; idx: number };
  quizIndices: number[];
  currentRound: number;
  state: GameState;
  intervalReason?: IntervalReason;
  level: number;
  lastUpdated: number;
  socketIdSet: Set<string>;
}

// 시작 전, 게임 시작, 라운드 넘어가는 사이 중간 상태, 게임 진행중인 상태, 점수 표
// ready -> start -> ('readyRound' - 'play' - 'interval') x 10 => 'end'
type GameState = 'ready' | 'readyRound' | 'start' | 'interval' | 'play' | 'end';
type IntervalReason = 'default' | 'needPlayer' | 'noPainter';
