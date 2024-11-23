import { RefreshToken } from 'src/auth/entities/refresh-token';
import { Column, Entity, OneToOne, PrimaryColumn } from 'typeorm';

@Entity({ name: 'member' })
export class User {
  @PrimaryColumn({ type: 'varchar', nullable: false, unique: true })
  username: string;

  @Column({ type: 'varchar', nullable: false })
  password: string;

  @Column({ name: 'profile_img', type: 'varchar', nullable: true })
  profileImg: string;

  @Column({ name: 'bg_img', type: 'varchar', nullable: true })
  bgImg: string;

  @OneToOne(() => RefreshToken, (refreshToken) => refreshToken.user, {
    onDelete: 'CASCADE',
  })
  refreshToken: RefreshToken;
}
