export interface User {
  username: string | undefined;
  password: string;
}

export interface NewUser extends User {
  email: string;
  confirmPassword: string;
}

export type UserStatus = Pick<User, 'username'> & { isLoggedIn: boolean };

export interface MatchUser {
  id: string;
  username: string;
  email: string;
}

export interface Match {
  id: string;
  date: string; // ISO datetime string
  users: MatchUser[];
}
