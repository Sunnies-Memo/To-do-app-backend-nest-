import {
  IsNumber,
  IsString,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BoardsDTO } from './boards-dto';

export class CardDTO {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  todoId?: number; // 선택적 필드

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  orderIndex?: number; // 선택적 필드

  @IsOptional()
  @IsString()
  text?: string; // 선택적 필드

  @IsOptional()
  @ValidateNested() // 객체 검증
  @Type(() => BoardsDTO) // 중첩된 객체 타입 명시
  board?: BoardsDTO; // 관계 필드
}
