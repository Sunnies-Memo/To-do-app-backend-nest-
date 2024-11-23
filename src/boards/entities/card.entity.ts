import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Board } from '../entities/board.entity';
import { Expose, Transform, Type } from 'class-transformer';

@Entity({ name: 'todo' })
export class Card {
  @PrimaryGeneratedColumn({ name: 'todo_id' })
  @Type(() => Number)
  todoId: number;

  @Column({ name: 'order_index', type: 'int', nullable: false })
  orderIndex: number;

  @Column({ type: 'varchar', nullable: false })
  text: string;

  @ManyToOne(() => Board, (board) => board.toDoList, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'board_id' })
  board: Board;

  // board를 { boardId: 값 } 형태로 변환
  @Expose({ name: 'board' })
  @Transform(({ obj }) => ({ board: { boardId: obj.board?.boardId } }), {
    toPlainOnly: true,
  })
  simplifiedBoard: { board: { boardId: number } };
}
