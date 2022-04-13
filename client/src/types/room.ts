import { Player } from './player';

export interface Room {
  roomId: string;
  title: string;
  users: (Player | null)[];
  master: { name: string; uuid: string };
}
