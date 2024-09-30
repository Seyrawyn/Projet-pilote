
import express  from 'express';
import { body, param } from 'express-validator';
import { expressValidator } from '../middlewares/validation';

import { createTrainer, deleteTrainer, getTrainer, getTrainers, updateTrainer } from '../controllers/TrainerController';


const router = express.Router();

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     basicAuth: # Name of the security scheme, can be anything
 *       type: http
 *       scheme: basic
 */


/**
 *
 * @swagger
 * /admin:
 *   get:
 *     tags:
 *       - admin
 *     summary: validate admin credentials
 *     description: Route to validate admin credentials
 *     security:
 *       - basicAuth: []
 *     responses:
 *       200:
 *         description: authorized
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Conflict
 *       500:
 *         description: Server Error
 */
router.get('/', (req, res) => res.status(200).json({message: 'authorized'}));

/**
 *
 * @swagger
 * /admin/trainer:
 *   post:
 *     tags:
 *       - admin
 *     summary: Create new trainer
 *     description: Route to create a new trainer
 *     security:
 *       - basicAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: The username of the trainer
 *                 example: momo
 *               password:
 *                 type: string
 *                 description: The password of the trainer
 *                 example: mésopotamie
 *               email:
 *                 type: string
 *                 description: The email of the trainer
 *                 example: maurice@gmail.com
 *               name:
 *                 type: string
 *                 description: The name of a user
 *                 example: Maurice Du Plat Lisse
 *     responses:
 *       201:
 *         description: New user created
 *       400:
 *         description: Bad Request
 * 
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Conflict
 *       500:
 *         description: Server Error
 */
router.post('/trainer', 
  [
    body('username').isString(),
    body('password').isString().isLength({min: 1, max: 72}),
    body('email').isString().isEmail(),
    body('name').isString(),
  ],
  expressValidator,
  createTrainer
);


/**
 * 
 * @swagger
 * /admin/trainers:
 *   get:
 *     tags:
 *       - admin
 *     security:
 *       - basicAuth: []
 *     summary: Get all trainers
 *     description: get the data of all trainers
 *     responses:
 *       200:
 *         description: Information obtained successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: the id of a user
 *                     example: 1
 *                   username:
 *                     type: string
 *                     description: The username of the trainer
 *                     example: momo
 *                   email:
 *                     type: string
 *                     description: The email of the trainer
 *                     example: maurice@gmail.com
 *                   name:
 *                     type: string
 *                     description: The name of a user
 *                     example: Maurice Du Plat Lisse
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No corresponding trainerfound
 *       500:
 *         description: Server Internal Error
 */
router.get('/trainers', getTrainers);

/**
 * 
 * @swagger
 * /admin/trainer/{trainerId}:
 *   get:
 *     tags:
 *       - admin
 *     security:
 *       - basicAuth: []
 *     summary: get a trainer's data
 *     description: get the data of a trainer based on his/her id
 *     parameters:
 *       - in: path
 *         name: trainerId
 *         schema:
 *           type: integer
 *           required: true
 *           description: the id of a trainer
 *     responses:
 *       200:
 *         description: Information obtained successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                   description: The username of the trainer
 *                   example: momo
 *                 email:
 *                   type: string
 *                   description: The email of the trainer
 *                   example: maurice@gmail.com
 *                 name:
 *                   type: string
 *                   description: The name of a user
 *                   example: Maurice Du Plat Lisse
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No corresponding trainerfound
 *       500:
 *         description: Server Internal Error
 */
router.get('/trainer/:trainerId',
  [
    param('trainerId').exists().isInt(),
  ],
  expressValidator,
  getTrainer
);

/**
 * 
 * @swagger
 * /admin/trainer/{trainerId}:
 *   delete:
 *     tags:
 *       - admin
 *     security:
 *       - basicAuth: []
 *     summary: delete a trainer
 *     description: delete a trainer based on his/her id
 *     parameters:
 *       - in: path
 *         name: trainerId
 *         schema:
 *           type: integer
 *           required: true
 *           description: the id of a trainer
 *     responses:
 *       200:
 *         description: Trainer successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Trainer successfully deleted
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No corresponding trainerfound
 *       500:
 *         description: Server Internal Error
 */
router.delete('/trainer/:trainerId',
  [
    param('trainerId').exists().isInt(),
  ],
  expressValidator,
  deleteTrainer
);


/**
 * 
 * @swagger
 * /admin/trainer/{trainerId}:
 *   patch:
 *     tags:
 *       - admin
 *     security:
 *       - basicAuth: []
 *     summary: modify a trainer
 *     description: modify a trainer based on his/her id
 *     parameters:
 *       - in: path
 *         name: trainerId
 *         schema:
 *           type: integer
 *           required: true
 *           description: the id of a trainer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - required: [username]
 *                 properties:
 *                   username:
 *                     type: string
 *               - required: [name]
 *                 properties:
 *                   name:
 *                     type: string
 *               - required: [email]
 *                 properties:
 *                   email:
 *                     type: string
 *             properties:
 *               username:
 *                 type: string
 *                 description: The username of the trainer
 *                 example: momo
 *               password:
 *                 type: string
 *                 description: The password of the trainer
 *                 example: mésopotamie
 *               email:
 *                 type: string
 *                 description: The email of the trainer
 *                 example: maurice@gmail.com
 *               name:
 *                 type: string
 *                 description: The name of a user
 *                 example: Maurice Du Plat Lisse
 *     responses:
 *       200:
 *         description: Trainer successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Trainer successfully updated
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No corresponding trainerfound
 *       500:
 *         description: Server Internal Error
 */
router.patch('/trainer/:trainerId',
  [
    param('trainerId').exists().isInt(),
    body('username').optional().isString(),
    body('password').optional().isString().isLength({min: 1, max: 72}),
    body('email').optional().isString().isEmail(),
    body('name').optional().isString(),
  ],
  expressValidator,
  updateTrainer
);

export default router;
