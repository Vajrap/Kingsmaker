import type { User } from "./User";

export class Room {
  id: string;
  hostID: string;
  state: "WAITING" | "PLAYING" | "FINISHED";
  player1: User | null;
  player2: User | null;
  player3: User | null;
  player4: User | null;

  constructor(id: string, host: User) {
    this.id = id;
    this.hostID = host.id;
    this.state = "WAITING";
    this.player1 = host;
    this.player2 = null;
    this.player3 = null;
    this.player4 = null;
  }
}
