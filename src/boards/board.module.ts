import { Module } from '@nestjs/common';
import { BoardsController } from './boards.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from './entities/board.entity';
import { Card } from './entities/card.entity';
import { BoardService } from './service/board.service';

@Module({
  imports: [TypeOrmModule.forFeature([Board, Card])],
  controllers: [BoardsController],
  providers: [BoardService],
})
export class BoardModule {}
