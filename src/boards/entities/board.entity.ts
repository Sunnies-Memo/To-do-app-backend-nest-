import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Card } from './card.entity';
import { Type } from 'class-transformer';

@Entity({ name: 'board' })
export class Board {
  @PrimaryGeneratedColumn({ name: 'board_id' })
  @Type(() => Number)
  boardId: number;

  @Column({ name: 'order_index', type: 'int', nullable: false })
  @Type(() => Number)
  orderIndex: number;

  @Column({ type: 'varchar', nullable: false })
  title: string;

  @Column({ type: 'varchar', nullable: false })
  username: string;

  @OneToMany(() => Card, (todo) => todo.board, {
    cascade: true,
    nullable: true,
  })
  toDoList: Card[];
}
