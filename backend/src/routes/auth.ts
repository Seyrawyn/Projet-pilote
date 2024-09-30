import express  from 'express';
import { body } from 'express-validator';
import { authenticateUser } from '../controllers/UserController';
import { authenticateTrainer } from '../controllers/TrainerController';
import { expressValidator } from '../middlewares/validation';

const router = express.Router();


/**
 * @swagger
 * /auth:
 *  post:
 *    tags:
 *    - Authentification
 *    summary: Authenticate user
 *    description: Route to authenticate user, the token is also returned in a cookie named `token`, you need to include this cookie in subsequent requests or include it in the `Authorization` headers
 *    headers: 
 *      Set-Cookie:
 *        schema: 
 *          type: string
 *          example: token=abcde12345; Path=/; HttpOnly; Samesite=Strict;
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              username:
 *                type: string
 *                description: The username of a user
 *                example: jean-papa
 *              password:
 *                type: string
 *                description: The password of a user
 *                example: Motdepasse1234
 *    responses:
 *      200:
 *        description: Succesfull Login
 *      400:
 *        description: Bad Request
 *      401:
 *        description: Wrong Credentials
 *      500:
 *        description: Server Error
 */
router.post('/', 
  [
    body('username').isString(),
    body('password').isString()
  ],
  expressValidator,
  authenticateUser
);

/**
 * @swagger
 * /auth/trainer:
 *  post:
 *    tags:
 *    - Authentification
 *    summary: Authenticate a trainer
 *    description: Route to authenticate trainer, the token is also returned in a cookie named `token`, you need to include this cookie in subsequent requests or include it in the `Authorization` headers
 *    headers: 
 *      Set-Cookie:
 *        schema: 
 *          type: string
 *          example: token=abcde12345; Path=/; HttpOnly; Samesite=Strict;
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              username:
 *                type: string
 *                description: The username of a trainer
 *                example: momo
 *              password:
 *                type: string
 *                description: The password of a trainer
 *                example: mésopotamie
 *    responses:
 *      200:
 *        description: Succesfull Login
 *      400:
 *        description: Bad Request
 *      401:
 *        description: Wrong Credentials
 *      500:
 *        description: Server Error
 */
router.post('/trainer',
  [
    body('username').isString(),
    body('password').isString()
  ],
  expressValidator,
  authenticateTrainer
);

export default router;
