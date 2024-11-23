import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class RegisterRequest {
  @IsNotEmpty({ message: 'Username is required' })
  @IsString()
  @Length(4, 12, { message: 'Username must be between 4 and 12 characters' })
  @Matches(/^[A-Za-z0-9]+$/, {
    message: 'Username must not contain special characters',
  })
  username: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  @Length(7, 13, { message: 'Password must be between 7 and 13 characters' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{7,}$/, {
    message: 'Password must include letters, numbers, and special characters',
  })
  password: string;

  @IsNotEmpty({ message: 'Password2 is required' })
  @IsString()
  password2: string;
}
