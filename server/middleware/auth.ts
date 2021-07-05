import { User } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';

export interface Req extends Request {
  user: Omit<User, 'password'>;
}

export async function protect(
  req: Req,
  res: Response,
  next: NextFunction
): Promise<any> {
  if (!req.cookies.token) {
    return next({
      message: 'You need to be logged in to visit this route',
      statusCode: 401,
    });
  }

  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { id: number };
    if (decoded.id) {
      const user = await prisma.user.findUnique({
        select: {
          id: true,
          name: true,
          email: true,
        },
        where: {
          id: decoded.id,
        },
      });

      req.user = user;
    }

    next();
  } catch (error) {
    next({
      message: 'You need to be logged in to visit this route',
      statusCode: 401,
    });
  }
}
