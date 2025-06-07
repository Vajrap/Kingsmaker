export class User {
  username: string;
  nameAlias: string;
  highestScore: number;
  totalGames: number;
  totalWins: number;
  totalLosses: number;
  totalTies: number;
  sessionID: string;

  constructor(
    username: string,
    nameAlias: string,
    highestScore: number,
    totalGames: number,
    totalWins: number,
    totalLosses: number,
    totalTies: number,
    sessionID: string,
  ) {
    this.username = username;
    this.nameAlias = nameAlias;
    this.highestScore = highestScore;
    this.totalGames = totalGames;
    this.totalWins = totalWins;
    this.totalLosses = totalLosses;
    this.totalTies = totalTies;
    this.sessionID = sessionID;
  }
}
