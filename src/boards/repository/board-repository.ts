import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Board } from '../entities/board.entity';

@Injectable()
export class BoardRepository extends Repository<Board> {
  constructor(private dataSource: DataSource) {
    super(Board, dataSource.createEntityManager());
  }

  async findAllByUsername(username: string): Promise<Board[]> {
    return this.find({
      where: { username },
      order: { orderIndex: 'ASC' },
    });
  }

  async findLastByUsername(username: string): Promise<Board | null> {
    return this.findOne({
      where: { username },
      order: { orderIndex: 'DESC' },
    });
  }

  async deleteAllByUsername(username: string): Promise<void> {
    await this.delete({ username });
  }
}
