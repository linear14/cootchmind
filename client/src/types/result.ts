import { Player } from './player';

export interface RoundResult {
  round: number;
  winPlayer?: Player | null;
  answer?: string;
  error?: string;
}

export interface GameResult {
  rank: number;
  name: string;
  answerCnt: number;
}
