export interface Room {
  roomId: string;
  title: string;
  users: { name: string; uuid: string; isMaster: boolean }[];
  master: { name: string; uuid: string };
}
