interface User {
  username: string | undefined;
  password: string;
}

interface NewUser extends User {
  email: string;
  confirmPassword: string;
}

type UserStatus = Pick<User, 'username'> & { isLoggedIn: boolean };

interface MatchUser {
  id: string;
  username: string;
  email: string;
}

interface Match {
  id: string;
  date: string; // ISO datetime string
  users: MatchUser[];
}
