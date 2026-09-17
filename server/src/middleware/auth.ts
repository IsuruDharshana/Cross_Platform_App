import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { prisma } from '../lib/prisma';

export interface AuthUser {
  id: string;
  email: string;
  role: 'USER' | 'ORGANIZER';
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

const JWT_SECRET = process.env.JWT_SECRET ?? 'eventhub-dev-secret';

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Authentication required.' });
    return;
  }

  const token = header.slice('Bearer '.length);

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { sub: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.sub } });

    if (!user) {
      res.status(401).json({ message: 'User not found.' });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

export const requireRole = (role: 'USER' | 'ORGANIZER') => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || req.user.role !== role) {
      res.status(403).json({ message: `This route requires ${role.toLowerCase()} access.` });
      return;
    }

    next();
  };
};
