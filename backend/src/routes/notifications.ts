import express from 'express';
import { verifyUserToken } from '../middlewares/authentication';
import {getNotifications, markNotificationAsRead} from "../controllers/notificationsController";

const router = express.Router();

/**
 * @swagger
 * /notifications:
 *  get:
 *    tags:
 *    - notifications
 *    summary: Get upcoming notifications for current user
 *    description: Route to get upcoming notifications for current user. The returned notifications are the notifications for the remaining of the current day and the following day.
 *    security:
 *      - BearerAuth: []
 *    responses:
 *      200:
 *        description: List of upcoming notifications
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                type: object
 *                properties:
 *                  plannedActivityID:
 *                    type: integer
 *                  date:
 *                    type: string
 *                    format: date-time
 *                    example: 2024-02-26 16:30:00
 *                  name:
 *                    type: string
 *                    example: "Run in the afternoon"
 *                  isRead:
 *                    type: boolean
 *                    example: false
 *
 *      401:
 *        description: User is not logged in
 *      404:
 *        description: No corresponding user found
 *      500:
 *        description: Server Error
 */

router.get('/', verifyUserToken, getNotifications);

/**
 * @swagger
 * /notifications/{pActivityId}:
 *  patch:
 *    tags:
 *    - notifications
 *    summary: Marks notification as read
 *    description: set the is_read notification field route and return the updated notification.
 *    security:
 *      - BearerAuth: []
 *    parameters:
 *      - in: path
 *        name: pActivityId
 *        schema:
 *          type: integer
 *          required: true
 *          description: planned activity id
 *    responses:
 *      200:
 *        description: Updated notification successfully
 *        content:
 *          application/json:
 *            schema:
 *              type: notifications
 *              items:
 *                type: object
 *                properties:
 *                  plannedActivityID:
 *                    type: integer
 *                  date:
 *                    type: string
 *                    format: date-time
 *                    example: 2024-02-26 16:30:00
 *                  name:
 *                    type: string
 *                    example: "Run in the afternoon"
 *                  isRead:
 *                    type: boolean
 *                    example: true
 *      401:
 *        description: User is not logged in
 *      404:
 *        description: Ressource not found
 *      500:
 *        description: Server Error
 */
router.patch('/:pActivityId', verifyUserToken, markNotificationAsRead);

export default router;
