import express from 'express';
import {
  createPlannedActivity,
  getPlannedActivities,
  getPlannedActivity,
  deletePlannedActivity,
  modifyPlannedActivity,
  setActivityIdInPlannedActivity
} from '../controllers/plannedActivitiesController';
import { verifyUserToken } from '../middlewares/authentication';
import { body } from 'express-validator';
import { expressValidator } from '../middlewares/validation';

const router = express.Router();


/**
 * @swagger
 * /plannedactivities:
 *  get:
 *    tags:
 *    - planned_activities
 *    summary: Get planned activities of current user
 *    description: Route to get the planned activities of a logged user
 *    security:
 *      - BearerAuth: []
 *    parameters:
 *      - in: query
 *        name: from
 *        schema:
 *          type: string
 *        required: true
 *        description: Filter results that are after the given date in format YYYY-MM-DD
 *      - in: query
 *        name: type
 *        schema:
 *          type: string
 *        description: Filter results by the given activity type (Walking, Running, Biking)
 *    responses:
 *      200:
 *        description: List of planned activities
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                type: object
 *                properties:
 *                  id:
 *                    type: integer
 *                  type:
 *                    type: string  
 *                  date:
 *                    type: string
 *                    format: date-time
 *                    example: 2024-02-26 16:30:00
 *                  duration:
 *                    type: integer
 *                  name:
 *                    type: string
 *                  comment:
 *                    type: string
 *                  activity_id:
 *                    type: integer 
 *      400:
 *        description: Invalid request 
 *      401:
 *        description: User is not logged in         
 *      404:
 *        description: No corresponding user found
 *      500:
 *        description: Server Error
 */
router.get('/', verifyUserToken, getPlannedActivities);

/**
 * @swagger
 * /plannedactivities/{pActivityId}:
 *  get:
 *    tags:
 *    - planned_activities
 *    summary: Get a planned activity of current user
 *    description: Route to get a planned activity of a logged user
 *    security:
 *      - BearerAuth: []
 *    parameters:
 *       - in: path
 *         name: pActivityId
 *         schema:
 *           type: integer
 *           required: true
 *           description: the id of a planned activity
 *    responses:
 *      200:
 *        description: Planned activity
 *        content:
 *          application/json:
 *            schema:
 *                type: object
 *                properties:
 *                  id:
 *                    type: integer
 *                  user_id:
 *                    type: integer
 *                  type:
 *                    type: string
 *                  date:
 *                    type: string
 *                    format: date-time
 *                    example: 2024-02-26 16:30:00
 *                  duration:
 *                    type: integer
 *                  name:
 *                    type: string
 *                  comment:
 *                    type: string
 *      401:
 *        description: User is not logged in
 *      404:
 *        description: No corresponding planned activity found
 *      500:
 *        description: Server Error
 */
router.get('/:pActivityId', verifyUserToken, getPlannedActivity);

/**
 * @swagger
 * /plannedactivities/{pActivityId}:
 *  put:
 *    tags:
 *     - planned_activities
 *    summary: update planned activity
 *    description: update planned activity of the currently logged-in user
 *    security:
 *      - BearerAuth: []
 *    parameters:
 *       - in: path
 *         name: pActivityId
 *         schema:
 *           type: integer
 *           required: true
 *           description: the id of a planned activity
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              type:
 *                type: string
 *                description: Type of the planned activity
 *                example: Running
 *              date:
 *                type: string($date-time)
 *                description: The date and time of the activity
 *                example: 2024-02-26 16:30:00
 *              duration:
 *                type: integer
 *                description: The total duration of the activity in seconds
 *                example: 1823
 *              name:
 *                type: string
 *                description: The name of the activity
 *                example: A run in the park
 *              comment:
 *                type: string
 *                description: The comment of the activity
 *                example: Remember to focus on your breath the entire time!
 *    responses:
 *     201:
 *      description: Planned activity updated successfully
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              id:
 *                type: integer
 *                exemple: 1
 *              type:
 *                type: string
 *                description: Type of the planned activity
 *                example: Running
 *              date:
 *                type: string($date-time)
 *                description: The date and time of the activity
 *                example: 2024-02-26 16:30:00
 *              duration:
 *                type: integer
 *                description: The total duration of the activity in seconds
 *                example: 1823
 *              name:
 *                type: string
 *                description: The name of the activity
 *                example: A run in the park
 *              comment:
 *                type: string
 *                description: The comment of the activity
 *                example: Remember to focus on your breath the entire time!
 *     400:
 *      description: Bad request
 *     401:
 *      description: User is not logged in
 *     404:
 *      description: Ressource not found
 *     500:
 *      description: Server error
 */
router.put('/:pActivityId',
  [
    body('type').optional({ values: 'null' }).isString().isLength({ max: 64 }),
    body('date').optional().isISO8601(),
    body('duration').optional().isInt({ min: 0, max: 86400 }),
    body('name').optional({ values: 'null' }).isString().isLength({ max: 64 }),
    body('comment').optional({ values: 'null' }).isString().isLength({ max: 256 }),
  ],
  expressValidator, verifyUserToken, modifyPlannedActivity);

  /**
 * @swagger
 * /plannedactivities/{pActivityId}:
 *  patch:
 *    tags:
 *     - planned_activities
 *    summary: Set activity ID to a planned activity
 *    description: Used to update a planned activity's data to link to the real activity.
 *    security:
 *      - BearerAuth: []
 *    parameters:
 *       - in: path
 *         name: pActivityId
 *         schema:
 *           type: integer
 *           required: true
 *           description: the id of a planned activity
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              activity_id:
 *                type: integer
 *                description: Id of the activity
 *                example: 666
 *    responses:
 *     200:
 *      description: Planned activity updated successfully
 *     400:
 *      description: Bad request
 *     401:
 *      description: User is not logged in
 *     404:
 *      description: Ressource not found
 *     500:
 *      description: Server error
 */
router.patch('/:pActivityId',
[
  body('activity_id').isInt({ min: 0 }),
],
expressValidator, verifyUserToken, setActivityIdInPlannedActivity);


/**
 * @swagger
 * /plannedactivities:
 *  post:
 *    tags:
 *     - planned_activities
 *    summary: Create planned activity
 *    description: Create planned activity of the currently logged-in user
 *    security:
 *      - BearerAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              type:
 *                type: string
 *                description: Type of the planned activity
 *                example: Running
 *              date:
 *                type: string($date-time)
 *                description: The date and time of the activity
 *                example: 2024-02-26 16:30:00
 *              duration:
 *                type: integer
 *                description: The total duration of the activity in seconds
 *                example: 1823
 *              name:
 *                type: string
 *                description: The name of the activity
 *                example: A run in the park
 *              comment:
 *                type: string
 *                description: The comment of the activity
 *                example: Remember to focus on your breath the entire time!
 *    responses:
 *     201:
 *      description: Planned activity created
 *     400:
 *      description: Bad request
 *     401:
 *      description: User is not logged in
 *     500:
 *      description: Server error
 */
router.post('/',
  [
    body('type').isString(),
    body('date').isISO8601(),
    body('duration').isInt({ min: 0 }),
    body('name').optional({ values: 'null' }).isString().isLength({ max: 256 }),
    body('comment').optional({ values: 'null' }).isString()
  ],
  expressValidator,
  verifyUserToken,
  createPlannedActivity);

/**
 * @swagger
 * /plannedactivities/{activityId}:
 *  delete:
 *    tags:
 *    - planned_activities
 *    summary: Delete planned activity
 *    description: Route to delete a planned activity of a logged user
 *    security:
 *      - BearerAuth: []
 *    parameters:
 *      - in: path
 *        name: activityId
 *        required: true
 *        description: The id of the activity to delete
 *        schema:
 *          type: integer
 *    responses:
 *      200:
 *        description: Activity deleted successfully
 *      400:
 *        description: Invalid activityId
 *      401:
 *        description: User is not logged in
 *      404:
 *        description: No corresponding activity
 *      500:
 *        description: Server Error
 */
router.delete("/:activityId", verifyUserToken, deletePlannedActivity);


export default router;
