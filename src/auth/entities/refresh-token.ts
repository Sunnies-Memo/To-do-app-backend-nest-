import { User } from 'src/user/entities/user';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('refresh_token')
export class RefreshToken {
  @PrimaryGeneratedColumn({ name: 'token_id' })
  tokenId: string;

  @Column({
    name: 'refresh_token',
    type: 'varchar',
    nullable: false,
    unique: true,
  })
  refreshToken: string;

  @OneToOne(() => User, { eager: true })
  @JoinColumn({ name: 'username', referencedColumnName: 'username' })
  user: User;
}
