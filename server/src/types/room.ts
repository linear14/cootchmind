export interface Room {
  roomId: number;
  title: string;
  users: { name: string; uuid: string; isMaster: boolean }[];
  master: string;
}
