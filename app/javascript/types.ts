export interface User {
  id: string;
  username: string;
  active: boolean;
}

export interface Credentials {
  username: string;
  password: string;
}

export interface NewUser extends Credentials {
  password_confirmation: string;
}

export interface ProfileUpdate {
  username: string;
  active: boolean;
  password?: string;
  password_confirmation?: string;
  current_password?: string;
}

export interface MatchParticipant {
  id: string;
  username: string;
}

export interface Match {
  id: string;
  matched_at: string;
  participants: MatchParticipant[];
}
