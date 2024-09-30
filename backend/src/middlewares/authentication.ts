import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { trainerPayload, userPayload } from '../types';


/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *     CookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: token
 */
export const verifyUserToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeaders = req.headers.authorization;

  const cookieToken: string | undefined = req.cookies.token;

  if (!cookieToken && (!authHeaders || !authHeaders.startsWith('Bearer '))) {
    return res.status(401).json({ error: 'Unauthorized'});
  }

  const token = authHeaders?.split(' ')[1] || cookieToken || '';

  try {
    const { userId } = jwt.verify(token, process.env.SECRET as string || 'petit_secret') as userPayload;
    if (!userId) throw new Error();
    req.user = { userId };
    
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized - Invalid token'});
  }
};

export const verifyTrainerToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeaders = req.headers.authorization;

  const cookieToken: string | undefined = req.cookies.token;

  if (!cookieToken && (!authHeaders || !authHeaders.startsWith('Bearer '))) {
    return res.status(401).json({ error: 'Unauthorized'});
  }

  const token = authHeaders?.split(' ')[1] || cookieToken || '';

  try {
    const { trainerId } = jwt.verify(token, process.env.SECRET as string || 'petit_secret') as trainerPayload;
    if (!trainerId) throw new Error();
    req.trainer = { trainerId };
    
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized - Invalid token'});
  }
};
