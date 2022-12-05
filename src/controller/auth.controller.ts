import { User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { Request, Response } from 'express';
import { prisma } from '../config/db';
import * as argon2 from 'argon2';
import * as jwt from 'jsonwebtoken';

export const loginHandler = async (req: Request, res: Response) => {
  const { username, password } = req.body as User;

  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    return res.status(400).json({
      message: 'Wrong username or password',
    });
  }

  const isMatched = await argon2.verify(user.password, password);

  if (!isMatched) {
    return res.status(400).json({
      message: 'Wrong username or password',
    });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET as string,
    {
      expiresIn: '5 days',
    }
  );

  return res
    .status(200)
    .json({ msg: 'Welcome Back ' + user.username + ' !', token });
};

export const registerHandler = async (req: Request, res: Response) => {
  try {
    const { username, password, email } = req.body as User;
    const hashedPassword = await argon2.hash(password);

    await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        email,
      },
    });

    return res.status(201).json({ msg: 'New user added' });
  } catch (error) {
    console.log(error);
    const prismaError = error as PrismaClientKnownRequestError;
    return res.status(400).json({
      message: prismaError.message,
    });
  }
};
