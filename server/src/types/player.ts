export interface Player {
  name: string;
  // uuid: string;
  socketId: string;
  isMaster: boolean;
  answerCnt: number;
  isOut: boolean;
  // isReady: boolean;
}
