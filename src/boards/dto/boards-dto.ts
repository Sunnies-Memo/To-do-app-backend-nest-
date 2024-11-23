import { IsNumber, IsString, IsArray, IsOptional } from 'class-validator';
import { Card } from '../entities/card.entity';
import { Type } from 'class-transformer';

export class BoardsDTO {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  boardId?: number;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  orderIndex?: number;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsArray()
  toDoList?: Card[];
}
