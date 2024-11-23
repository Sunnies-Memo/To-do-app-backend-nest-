import { Card } from '../entities/card.entity'; // ToDo 엔티티 import
import { IsObject, IsNumber } from 'class-validator';

export class CardUpdateRequest {
  @IsObject()
  todo: Partial<Card>;

  @IsNumber()
  gap: number;
}
