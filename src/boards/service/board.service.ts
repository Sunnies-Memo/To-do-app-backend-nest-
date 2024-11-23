import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { Board } from '../entities/board.entity';
import { BoardsDTO } from '../dto/boards-dto';
import { BoardUpdateRequest } from '../dto/board-update-request';
import { CardUpdateRequest } from '../dto/card-update-request';
import { Card } from '../entities/card.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CardDTO } from '../dto/card-dto';

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(Board)
    private readonly boardRepository: Repository<Board>,
    @InjectRepository(Card)
    private readonly cardRepository: Repository<Card>,
    private readonly dataSource: DataSource, // 트랜잭션 처리를 위한 DataSource 주입
  ) {}

  async getAllBoards(username: string): Promise<BoardsDTO[]> {
    const boards = await this.boardRepository.find({
      where: { username: username },
      order: { orderIndex: 'ASC' },
      relations: ['toDoList.board'],
    });
    return boards.map((item) => ({
      ...item,
      orderIndex: Number(item.orderIndex),
      toDoList: item.toDoList.map((card) => ({
        ...card,
        orderIndex: Number(card.orderIndex),
      })),
    }));
  }

  async createBoard(board: BoardsDTO): Promise<Board> {
    return this.boardRepository.save({ ...board, todos: [] });
  }

  async updateBoard(
    username: string,
    boardUpdateRequest: BoardUpdateRequest,
  ): Promise<Board> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const boardRepo = queryRunner.manager.getRepository(Board);
      // update 메서드 호출
      await boardRepo.update(
        boardUpdateRequest.board.boardId,
        boardUpdateRequest.board,
      );

      // 업데이트된 보드를 다시 조회
      const updatedBoard = await boardRepo.findOneOrFail({
        where: { boardId: boardUpdateRequest.board.boardId },
      });

      if (boardUpdateRequest.gap <= 2) {
        await this.rebalanceBoardsIndex(username, queryRunner.manager);
      }

      await queryRunner.commitTransaction();
      return updatedBoard;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteBoardById(boardId: number): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager
        .getRepository(Card)
        .delete({ board: { boardId: boardId } });
      const result = await queryRunner.manager
        .getRepository(Board)
        .delete(boardId);
      if (!result.affected) {
        throw new BadRequestException('Fail to delete.');
      }
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async createCard(card: CardDTO): Promise<Card> {
    return this.cardRepository.save(card);
  }

  async updateCard(
    username: string,
    cardUpdateRequest: CardUpdateRequest,
  ): Promise<Card> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const cardRepo = queryRunner.manager.getRepository(Card);

      // 업데이트 수행
      await cardRepo.update(
        cardUpdateRequest.todo.todoId,
        cardUpdateRequest.todo,
      );

      // 조건에 맞으면 rebalance 작업 수행
      if (cardUpdateRequest.gap <= 2) {
        await this.rebalanceCardsIndex(
          cardUpdateRequest.todo.board.boardId,
          queryRunner.manager,
        );
      }

      // 업데이트된 todo를 다시 조회
      const updatedCard = await cardRepo.findOneOrFail({
        where: { todoId: cardUpdateRequest.todo.todoId },
      });

      await queryRunner.commitTransaction();
      return updatedCard;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteCard(cardId: number) {
    const result = await this.cardRepository.delete(cardId);
    if (!result.affected) {
      throw new BadRequestException('Fail to delete.');
    }
  }
  private async rebalanceBoardsIndex(
    username: string,
    manager: QueryRunner['manager'],
  ): Promise<void> {
    const boardRepo = manager.getRepository(Board);
    const boards = await boardRepo.find({
      where: { username: username },
      order: { orderIndex: 'ASC' },
    });

    for (let i = 1; i <= boards.length; i++) {
      const board = boards[i - 1];
      board.orderIndex = i * 40;
      await boardRepo.update(board.boardId, board);
    }
  }

  private async rebalanceCardsIndex(
    boardId: number,
    manager: QueryRunner['manager'],
  ): Promise<void> {
    const cardRepo = manager.getRepository(Card);
    const todos = await cardRepo.find({
      where: { board: { boardId: boardId } },
      order: { orderIndex: 'ASC' },
    });

    for (let i = 1; i <= todos.length; i++) {
      const todo = todos[i - 1];
      todo.orderIndex = i * 40;
      await cardRepo.update(todo.todoId, todo);
    }
  }
}
