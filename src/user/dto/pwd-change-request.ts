import { IsNotEmpty, IsString, Matches, Length } from 'class-validator';

export class PwdChangeRequest {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  @Length(7, 13, { message: 'Password must be between 7 and 13 characters' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{7,}$/, {
    message: 'Password must include letters, numbers, and special characters',
  })
  oldPassword: string;

  @IsString()
  @IsNotEmpty()
  @Length(7, 13, { message: 'Password must be between 7 and 13 characters' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{7,}$/, {
    message: 'Password must include letters, numbers, and special characters',
  })
  newPassword: string;
}
