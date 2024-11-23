// src/auth/repositories/refresh-token.repository.ts
import { Repository } from 'typeorm';
import { RefreshToken } from '../entities/refresh-token';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class RefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly repository: Repository<RefreshToken>,
  ) {}

  async findByMemberUsername(
    username: string,
  ): Promise<RefreshToken | undefined> {
    return this.repository.findOne({ where: { user: { username } } });
  }

  async deleteByMemberUsername(username: string): Promise<void> {
    await this.repository.delete({ user: { username } });
  }
}
