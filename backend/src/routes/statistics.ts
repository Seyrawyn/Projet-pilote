import express from 'express';
import { getMonthlyActivities } from '../controllers/statisticsController';
import { verifyUserToken } from '../middlewares/authentication';

const router = express.Router();


/**
 * @swagger
 * /statistics:
 *  get:
 *    tags:
 *    - statistics
 *    summary: Get monthly statistics for current user
 *    description: Route to get statistics of  current user
 *    security:
 *      - BearerAuth: []
 *    parameters:
 *      - in: query
 *        name: date
 *        schema:
 *          type: string
 *        description: Filter results that are the same month as date
 *      - in: query
 *        name: type
 *        schema:
 *          type: string
 *        description: Filter results by the given activity type (Walking, Running, Biking)
 *    responses:
 *      200:
 *        description: List of activities for specified month
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                type: object
 *                properties:
 *                  id:
 *                    type: integer
 *                  date:
 *                    type: string
 *                    format: date-time
 *                    example: 2024-02-26 16:30:00
 *                  type:
 *                    type: string
 *                    example: Running
 *                  durationTotal:
 *                    type: number
 *                  distanceTotal:
 *                    type: number
 *                  
 *      401:
 *        description: User is not logged in         
 *      404:
 *        description: No corresponding user found
 *      500:
 *        description: Server Error
 */
router.get('/', verifyUserToken, getMonthlyActivities);

export default router;
