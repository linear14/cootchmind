export interface Player {
  name: string;
  socketId: string;
  isMaster: boolean;
  answerCnt: number;
  isOut: boolean;
  turn: number;
}
