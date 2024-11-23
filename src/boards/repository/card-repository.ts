// todo.repository.ts
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Card } from '../entities/card.entity';

@Injectable()
export class CardRepository extends Repository<Card> {
  constructor(private dataSource: DataSource) {
    super(Card, dataSource.createEntityManager());
  }

  // 커스텀 메서드
  async findByBoardIdOrderByOrderIndexAsc(boardId: number): Promise<Card[]> {
    return this.find({
      where: { board: { boardId } },
      order: { orderIndex: 'ASC' },
    });
  }

  async deleteAllByBoardId(boardId: number): Promise<void> {
    await this.delete({ board: { boardId } });
  }
}
