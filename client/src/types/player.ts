export interface Player {
  socketId: string;
  name: string;
  isMaster: boolean;
  answerCnt: number;
  isOut: boolean;
  turn: number;
}
