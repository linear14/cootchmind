export interface Room {
  roomId: number;
  title: string;
  users: { name: string; isMaster: boolean }[];
  master: string;
}
