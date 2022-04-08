export interface Room {
  roomId: string;
  title: string;
  users: ({ name: string; uuid: string; isMaster: boolean; answerCnt: number } | null)[];
  master: { name: string; uuid: string };
}
