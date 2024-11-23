// src/auth/dto/user-profile-update-request.dto.ts
import { IsOptional, IsString, IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserProfileRequest {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'The username of the user', example: 'john_doe' })
  username: string;

  @IsOptional()
  @IsString()
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{7,}$/, {
    message:
      'Password must include letters, numbers, and special characters and be between 7 and 13 characters.',
  })
  @ApiProperty({
    description: 'New password for the user (optional)',
    example: 'NewP@ssw0rd',
  })
  password?: string;

  @IsOptional()
  @ApiProperty({
    description: 'Profile image file (optional)',
    type: 'string',
    format: 'binary',
  })
  profileImg?: Buffer; // Using Buffer to handle file data in a generic way

  @IsOptional()
  @ApiProperty({
    description: 'Background image file (optional)',
    type: 'string',
    format: 'binary',
  })
  bgImg?: Buffer; // Using Buffer to handle file data in a generic way
}
