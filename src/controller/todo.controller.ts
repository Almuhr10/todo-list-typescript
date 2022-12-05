import { Todo } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { IUser } from '../middleware/auth';
import {
  deleteToddSchemaType,
  updateTodoSchemaType,
} from '../zod_schema/todo.schema';

export const getAllTodoHandler = async (req: Request, res: Response) => {
  const user = res.locals.user as IUser;

  const todoList = await prisma.todo.findMany({
    where: { user_id: user.id },
  });

  return res.status(200).json(todoList);
};

export const addTodoHandler = async (req: Request, res: Response) => {
  try {
    const { title } = req.body as Todo;
    const user = res.locals.user as IUser;

    await prisma.todo.create({
      data: {
        title,
        user_id: user.id,
      },
    });
    return res
      .status(201)
      .json({ msg: 'New todo created for user : ' + user.id });
  } catch (error) {
    console.log(error);
    const prismaError = error as PrismaClientKnownRequestError;
    return res.status(400).json({
      message: prismaError.message,
    });
  }
};

export const updateTodoHandler = async (req: Request, res: Response) => {
  try {
    const user = res.locals.user as IUser;
    const updateTodo = req.body as Todo;
    const { todoid } = req.params as updateTodoSchemaType;

    const isUpdated = await prisma.todo.updateMany({
      where: {
        id: todoid,
        user_id: user.id,
      },
      data: updateTodo,
    });

    if (isUpdated.count == 0) {
      return res.status(400).json({ msg: 'Invalid todo id !' });
    }

    return res.status(200).json({ msg: 'Todo updated' });
  } catch (error) {
    console.log(error);
    const prismaError = error as PrismaClientKnownRequestError;
    return res.status(400).json({
      message: prismaError.message,
    });
  }
};

export const deleteTodoHandler = async (req: Request, res: Response) => {
  const user = res.locals.user as IUser;
  const { todoid } = req.params as deleteToddSchemaType;

  const deleteCount = await prisma.todo.deleteMany({
    where: {
      id: todoid,
      user_id: user.id,
    },
  });

  if (deleteCount.count == 0) {
    return res.status(400).json({ msg: 'Invalid todo id !' });
  }
  return res.status(200).json({ msg: 'Todo deleted' });
};
