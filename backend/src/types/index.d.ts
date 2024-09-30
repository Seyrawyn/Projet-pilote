// import { JwtPayload } from 'jsonwebtoken';
import 'express';


/**
 * @swagger
 * components:
 *   schemas:
 *     UserPayload:
 *       type: object
 *       properties:
 *         userId:
 *           type: integer
 *           example: 1
 */
export type userPayload = {
  userId: number;
};


// TODO À valider plus tard, mauvaise branche
// NOTE on peut probablement l'ajouter à userPayload et faire la validation sur le login
/**
 * @swagger
 * components:
 *  schemas:
 *   TrainerPayload:
 *    type: object
 *   properties:
 *   trainerId:
 *   type: integer
 *  example: 1
 */
export type trainerPayload = {
  trainerId: number;
};

declare global {
  namespace Express {
    export interface Request {
      user?: userPayload;
      trainer?: trainerPayload;
    }
  }
}
