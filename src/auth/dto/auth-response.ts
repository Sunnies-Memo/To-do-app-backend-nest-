import { User } from 'src/user/entities/user';

export class AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
