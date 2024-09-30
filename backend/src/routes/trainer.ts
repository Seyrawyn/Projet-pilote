import express, { NextFunction, Request, Response } from 'express';
import { getUser } from '../controllers/UserController';
import { param, body } from 'express-validator';
import { expressValidator } from '../middlewares/validation';
import { verifyTrainerToken } from '../middlewares/authentication';
import {
  addUserToTrainer, removeUserFromTrainer, getUsersOfTrainer, searchUsers,
  createPlannedActivityFromTrainer, getPlannedActivitiesFromTrainer,
  deletePlannedActivityFromTrainer
} from '../controllers/TrainerController';

const router = express.Router();

/**
 * @swagger
 * /trainer/user/{userId}:
 *   get:
 *     tags:
 *       - trainer
 *     summary: Trainer get user data
 *     security:
 *       - BearerAuth: []
 *     description: Route to get the data of a user from a trainer account.
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *           required: true
 *           description: the id of a selected user
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
 *                   example: jean-papa
 *                 password:
 *                   type: string
 *                   description: The password of a user
 *                   example: voici mon mot de passe
 *                 age:
 *                   type: integer
 *                   description: The age of a user
 *                   example: 30
 *                 height:
 *                   type: number
 *                   format: float
 *                   description: The height of a user in cm
 *                   example: 180.5
 *                 weight:
 *                   type: number
 *                   format: float
 *                   description: The weight of a user in kg
 *                   example: 75.5
 *                 sex:
 *                   type: string
 *                   description: The sex of a user
 *                   example: male
 *                 description:
 *                   type: string
 *                   description: Description of a user
 *                   example: Timothé le 6e du nom, aime les oranges
 *       404:
 *         description: No corresponding user found
 *       500:
 *         description: Server Error
 */
router.get('/user/:userId',
  verifyTrainerToken,
  [param('userId').notEmpty().isNumeric().withMessage('userId must be given and numeric')],
  expressValidator,
  async (req: Request, res: Response, next: NextFunction) => {
    req.user = { userId: Number(req.params.userId) };
    next();
  },
  getUser
);

/**
 * @swagger
 * /trainer/user/{userId}:
 *   post:
 *     tags:
 *       - trainer
 *     summary: Trainer create association with user
 *     security:
 *       - BearerAuth: []
 *     description: Route to associate a trainer with a user.
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *           required: true
 *           description: the id of a selected user
 *     responses:
 *       200:
 *         description: Association created
 *       404:
 *         description: No corresponding user|trainer found
 *       409:
 *         description: relation already exist
 *       500:
 *         description: Server Error
 */
router.post('/user/:userId',
  verifyTrainerToken,
  [param('userId').notEmpty().isNumeric().withMessage('userId must be given and numeric')],
  addUserToTrainer
);

/**
 * @swagger
 * /trainer/user/{userId}:
 *   delete:
 *     tags:
 *       - trainer
 *     summary: Trainer delete association with user
 *     security:
 *       - BearerAuth: []
 *     description: Route to delete an association of a trainer and a user.
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *           required: true
 *           description: the id of a selected user
 *     responses:
 *       200:
 *         description: Association successfully deleted
 *       404:
 *         description: No corresponding user|trainer|relation found
 *       500:
 *         description: Server Error
 */
router.delete('/user/:userId',
  verifyTrainerToken,
  [param('userId').notEmpty().isNumeric().withMessage('userId must be given and numeric')],
  removeUserFromTrainer
);

/**
 * @swagger
 * /trainer/users:
 *   get:
 *     tags:
 *       - trainer
 *     summary: Trainer get the user data of his users depending on a string
 *     security:
 *       - BearerAuth: []
 *     description: Route to get the data of a user containing a certain string associated to a trainer
 *     parameters:
 *       - in: query
 *         name: searchString
 *         schema:
 *           type: string
 *         required: false
 *         description: String to search for in user data
 *     responses:
 *      200:
 *        description: User successfully acquired
 *      405:
 *        description: No corresponding trainer found
 */
router.get('/users',
  verifyTrainerToken,
  getUsersOfTrainer
);

/**
 * @swagger
 * /trainer/search/users:
 *   get:
 *     tags:
 *       - trainer
 *     summary: Trainer find users corresponding to searchString
 *     security:
 *       - BearerAuth: []
 *     description: Route to get the data of a user containing a certain string 
 *     parameters:
 *       - in: query
 *         name: searchString
 *         schema:
 *           type: string
 *         required: false
 *         description: String to search for in user data
 *     responses:
 *      200:
 *        description: User successfully acquired
 *      405:
 *        description: No corresponding trainer found
 */
router.get('/search/users',
  verifyTrainerToken,
  searchUsers
);


/**
 * @swagger
 * /trainer/plannedActivity/{userId}:
 *   post:
 *     tags:
 *       - trainer
 *     summary: Trainer creates an activity for the user.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path    
 *         required: true
 *         description: the Id of a user for whom the activity is planned
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 description: Type of the planned activity
 *                 example: Running
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: The date and time of the activity
 *                 example: '2024-02-26T16:30:00'
 *               duration:
 *                 type: integer
 *                 description: The total duration of the activity in seconds
 *                 example: 1823
 *               name:
 *                 type: string
 *                 description: The name of the activity
 *                 example: A run in the park
 *               comment:
 *                 type: string
 *                 description: Any comment related to the activity
 *                 example: Remember to focus on your breath the entire time!
 *     responses:
 *       200:
 *         description: Activity successfully added to the user
 *       400:
 *         description: Bad request
 *       404:
 *         description: User not found
 */
router.post('/plannedActivity/:userId',
  [
    param('userId').isInt(),
    body('type').isString(),
    body('date').isISO8601(),
    body('duration').isInt({ min: 0 }),
    body('name').optional().isString().isLength({ max: 256 }),
    body('comment').optional().isString()
  ],
  expressValidator,
  verifyTrainerToken,
  createPlannedActivityFromTrainer
);

/**
 * @swagger
 * /trainer/plannedActivity/{userId}:
 *   get:
 *     tags:
 *       - trainer
 *     summary: Retrieves planned activities for a specific user
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the user for whom the activities are planned.
 *     responses:
 *       200:
 *         description: Successfully retrieved the list of planned activities.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                     description: Type of the planned activity
 *                   date:
 *                     type: string
 *                     format: date-time
 *                     description: The date and time of the activity
 *                   duration:
 *                     type: integer
 *                     description: The total duration of the activity in seconds
 *                   name:
 *                     type: string
 *                     description: The name of the activity
 *                   comment:
 *                     type: string
 *                     description: Any comment related to the activity
 *       400:
 *         description: Bad request, such as missing or invalid userId parameter.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal Server Error
 */
router.get('/plannedActivity/:userId',
  verifyTrainerToken,
  [param('userId').notEmpty().isInt().withMessage('userId must be given and numeric')],
  expressValidator,
  getPlannedActivitiesFromTrainer
);

/**
 * @swagger
 *   /trainer/plannedActivity/{userId}/{plannedActivityId}:
 *     delete:
 *       tags:
 *         - trainer
 *       summary: Deletes a planned activity for a specific user
 *       security:
 *         - BearerAuth: []
 *       parameters:
 *         - in: path
 *           name: userId
 *           schema:
 *             type: integer
 *             required: true
 *             description: The ID of the user for whom the activity is planned.
 *         - in: path
 *           name: plannedActivityId
 *           schema:
 *             type: integer
 *             required: true
 *             description: The ID of the planned activity to delete.
 *       responses:
 *         200:
 *           description: Activity successfully deleted.
 *         400:
 *           description: Bad request, such as missing or invalid userId or plannedActivityId parameter.
 *         404:
 *           description: User or planned activity not found.
 *         500:
 *           description: Internal Server Error
 */
router.delete('/plannedActivity/:userId/:plannedActivityId',
  verifyTrainerToken,
  [param('userId').notEmpty().isInt().withMessage('userId must be given and numeric')],
  [param('plannedActivityId').notEmpty().isInt().withMessage('plannedActivityId must be given and numeric')],
  expressValidator,
  deletePlannedActivityFromTrainer
);

export default router;
