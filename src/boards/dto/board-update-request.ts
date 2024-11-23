import { IsInt, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { Board } from '../entities/board.entity';

export class BoardUpdateRequest {
  @IsObject()
  @Type(() => Board)
  board: Partial<Board>;

  @IsInt()
  gap: number;
}
