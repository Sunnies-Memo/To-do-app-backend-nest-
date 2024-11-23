import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Put,
  UseInterceptors,
} from '@nestjs/common';
import { BoardUpdateRequest } from './dto/board-update-request';
import { CardUpdateRequest } from './dto/card-update-request';
import { BoardService } from './service/board.service';
import { Board } from './entities/board.entity';
import { Card } from './entities/card.entity';
import { CurrentUser } from 'src/global/decorators/current-user';
import { todo } from 'node:test';
import { LogRequestInterceptor } from 'src/global/intercepter/log-request.intercepter';
import { BoardsDTO } from './dto/boards-dto';
import { CardDTO } from './dto/card-dto';

@Controller('boards')
@UseInterceptors(LogRequestInterceptor)
export class BoardsController {
  constructor(private readonly boardService: BoardService) {}

  @Get()
  async getAll(
    @CurrentUser() { username }: { username: string },
  ): Promise<any> {
    console.log('-=-=--=-calling get all');
    if (!username) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    const data = await this.boardService.getAllBoards(username);
    console.log('||||||||||||||||getAll data', data);
    return data;
  }

  @Post()
  async createBoard(
    @Body() board: BoardsDTO,
    @CurrentUser() { username }: { username?: string } | undefined,
  ): Promise<any> {
    console.log('///////////////createBoard//////////////////');
    console.log('create board============', board);
    console.log('in create board', username);
    if (!username || username !== board.username) {
      console.log('username in token', username);
      console.log('username in board', board.username);
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    const newBoard: Partial<Board> = {
      orderIndex: board.orderIndex,
      title: board.title,
      username: username,
      toDoList: [],
    };
    return this.boardService.createBoard(newBoard);
  }

  @Put()
  async updateBoard(
    @Body() boardUpdateRequest: BoardUpdateRequest,
    @CurrentUser() { username }: { username: string },
  ): Promise<any> {
    console.log('==================update board', boardUpdateRequest);
    return await this.boardService.updateBoard(username, boardUpdateRequest);
  }

  @Delete()
  async deleteBoard(
    @Body() board: BoardsDTO,
    @CurrentUser() { username }: { username: string },
  ): Promise<void> {
    console.log('delete board =============', board);
    if (username !== board.username) {
      console.log('un auth');
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    await this.boardService.deleteBoardById(board.boardId);
  }

  @Post('todo')
  async createToDo(
    @Body() toDo: CardDTO,
    @CurrentUser() { username }: { username: string },
  ): Promise<Card> {
    console.log('========= create card', toDo);
    toDo.board.username = username;
    console.log('Card : ', toDo);
    return await this.boardService.createCard(toDo);
  }

  @Put('todo')
  async moveToDo(
    @Body() cardUpdateRequest: CardUpdateRequest,
    @CurrentUser() { username }: { username: string },
  ): Promise<any> {
    console.log('====== movet todo ', cardUpdateRequest);
    return await this.boardService.updateCard(username, cardUpdateRequest);
  }

  @Delete('todo')
  async deleteToDo(
    @Body() toDo: CardDTO,
    @CurrentUser() { username }: { username: string },
  ): Promise<void> {
    console.log('====== todo ', todo);
    toDo.board.username = username;
    await this.boardService.deleteCard(toDo.todoId);
  }
}
