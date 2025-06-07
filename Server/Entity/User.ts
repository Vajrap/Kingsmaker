export type UserType = 'registered' | 'guest';

export class User {
  id: string;
  username: string;
  email?: string | null;
  password?: string | null;
  type: UserType;
  nameAlias?: string;
  isConfirmed: boolean;
  highestScore: number;
  totalGames: number;
  totalWins: number;
  totalLosses: number;
  totalTies: number;
  achievements: string[];
  unlockables: string[]; // array of unlockable IDs
  customizations: { part: string; value: string }[];

  constructor(
    id: string,
    username: string,
    type: UserType,
    email: string | null = null,
    password: string | null = null,
    nameAlias: string = '',
    isConfirmed: boolean = false,
    highestScore: number = 0,
    totalGames: number = 0,
    totalWins: number = 0,
    totalLosses: number = 0,
    totalTies: number = 0,
    achievements: string[] = [],
    unlockables: string[] = [],
    customizations: { part: string; value: string }[] = [],
  ) {
    this.id = id;
    this.username = username;
    this.type = type;
    this.email = email;
    this.password = password;
    this.nameAlias = nameAlias;
    this.isConfirmed = isConfirmed;
    this.highestScore = highestScore;
    this.totalGames = totalGames;
    this.totalWins = totalWins;
    this.totalLosses = totalLosses;
    this.totalTies = totalTies;
    this.achievements = achievements;
    this.unlockables = unlockables;
    this.customizations = customizations;
  }

  static createGuest(id: string, username: string): User {
    return new User(id, username, 'guest');
  }
}
