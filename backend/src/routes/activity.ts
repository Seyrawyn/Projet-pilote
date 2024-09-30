import express from 'express';
import { body } from 'express-validator';
import {
  createActivityManual,
  getActivity,
  getSpecifiedActivities,
  createActivityGPX,
  getGPXDataByID, suppressionActivity, modifyActivity, geolocation
} from '../controllers/activitiesController';
import { expressValidator } from '../middlewares/validation';
import { verifyUserToken } from '../middlewares/authentication';
import { upload } from '../middlewares/fileTreatment';

const router = express.Router();

//TODO complété les erreurs 401 et 500
/**
 * @swagger
 * /activity/manual:
 *  post:
 *   tags:
 *    - Activity
 *   summary: Create activity
 *   description: Create activity
 *   security:
 *      - BearerAuth: []
 *   requestBody:
 *    content:
 *     application/json:
 *      schema:
 *       $ref: '#/components/schemas/Activity'
 *   responses:
 *    201:
 *     description: Success
 *    400:
 *     description: Error
 *    401:
 *     description: Error
 *    500:
 *     description: Error server
 */
router.post('/manual',
  [
    body('name').isString().notEmpty().withMessage('Name is required'),
    body('city').custom((value) => value === null || (typeof value === 'string' && value.trim().length > 0)).withMessage('City, optional'),
    body('type').isString().notEmpty().withMessage('Type of workout is required'),
    body('date').isISO8601().notEmpty().withMessage('Date is required'),
    body('durationTotal').custom((value) => value === null || (typeof value === 'number')).withMessage('Time in second'),
    body('distanceTotal').custom((value) => value === null || (typeof value === 'number')).withMessage('Distance in kilometer'),
    body('comment').custom((value) => value === null || (typeof value === 'string' && value.trim().length > 0)).withMessage('Comment is optional'),
  ],
  verifyUserToken,
  createActivityManual
);

/**
 * @swagger
 * /activity/gpxForm:
 *  post:
 *   tags:
 *    - Activity
 *   summary: Create activity using GPX file
 *   description: Create new activity using a GPX file upload
 *   security:
 *      - BearerAuth: []
 *   requestBody:
 *    content:
 *     multipart/form-data:
 *      schema:
 *       type: object
 *       properties:
 *        name:
 *         type: string
 *         description: The name of the activity
 *        type:
 *         type: string
 *         enum: [Running, Biking, Walking]
 *         description: The type of the activity
 *        comment:
 *         type: string
 *         description: Comment on the activity
 *        file:
 *         type: string
 *         format: binary
 *         description: The GPX file for the activity
 *   responses:
 *    201:
 *     description: Success
 *    400:
 *     description: Bad Request
 *    401:
 *     description: Unauthorized
 *    500:
 *     description: Server Error
 */
router.post('/gpxForm',
  [
    body('name').isString().notEmpty().withMessage('Name is required'),
    body('type').isString().notEmpty().withMessage('Type of workout is required'),
    body('comment').isString().withMessage('Comment is optional'),
  ],

  verifyUserToken,
  upload.single('file'),
  createActivityGPX
);

/**
 * @swagger
 * /activity/getActivity:
 *  get:
 *    tags:
 *    - Activity
 *    summary: Get activity
 *    description: Route to get activities of a user using its token
 *    security:
 *      - BearerAuth: []
 *    responses:
 *      200:
 *        description: Success
 *      404:
 *        description: No corresponding user found
 *      500:
 *        description: Server Error
 */
router.get('/getActivity',
  verifyUserToken,
  getActivity
);

/**
 * @swagger
 * /activity/getSpecifiedActivities:
 *  get:
 *    tags:
 *    - Activity
 *    summary: Get Specified activity
 *    description: Get Specified activity
 *    security:
 *      - BearerAuth: []
 *    parameters:
 *      - in: query
 *        name: search
 *        description: The search information required
 *      - in: query
 *        name: specificDate
 *        description: A specific date
 *      - in: query
 *        name: startDate
 *        description: Start date of the date range
 *      - in: query
 *        name: endDate
 *        description: End date of the date range
 *      - in: query
 *        name: specificDistance
 *        description: A specific distance
 *      - in: query
 *        name: startDistance
 *        description: Start distance of the distance range
 *      - in: query
 *        name: endDistance
 *        description: End distance of the distance range
 *      - in: query
 *        name: specificDuration
 *        description: A specific duration
 *      - in: query
 *        name: startDuration
 *        description: start duration of the distance range
 *      - in: query
 *        name: endDuration
 *        description: End duration of the distance range
 *    responses:
 *      200:
 *        description: Success
 *      404:
 *        description: No corresponding user found
 *      500:
 *        description: Server Error
 */
router.get('/getSpecifiedActivities',
  verifyUserToken,
  getSpecifiedActivities
);

/**
 * @swagger
 * /activity/getGPXData/{activityId}:
 *  get:
 *    tags:
 *    - Activity
 *    summary: Get GPX data
 *    description: Get GPX data by ID
 *    security:
 *      - BearerAuth: []
 *    parameters:
 *      - in: query
 *        name: id
 *        required: true
 *        description: The ID of the GPX data
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *        description: Success
 *      404:
 *        description: No corresponding GPX data found
 *      500:
 *        description: Server Error
 */
router.get('/getGPXData/:activityId',
  verifyUserToken,
  getGPXDataByID
);


/**
 * @swagger
 * /activity/updateActivity/{activityId}:
 *  put:
 *    tags:
 *    - Activity
 *    summary: Update activity data
 *    description: Route to update the data of an activity using its ID
 *    security:
 *      - BearerAuth: []
 *    parameters:
 *      - in: path
 *        name: activityId
 *        required: true
 *        description: The id of the activity to delete
 *        schema:
 *          type: integer
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              name:
 *                type: string
 *                example: jean-papa
 *              city:
 *                type: string
 *                example: Paris
 *              type:
 *                type: string
 *                example: running
 *              date:
 *                type: string
 *                example: 2022-10-20
 *              durationTotal:
 *                type: number
 *                example: 90
 *              distanceTotal:
 *                type: number
 *                example: 10
 *              comment:
 *                type: string
 *                example: Good run!
 *    responses:
 *      200:
 *        description: User updated successfully
 *      404:
 *        description: No corresponding user found
 */
router.put('/updateActivity/:activityId',
  [
    body('name').custom((value) => value === null || (typeof value === 'string' && value.trim().length > 0)),
    body('city').custom((value) => value === null || (typeof value === 'string' && value.trim().length > 0)),
    body('type').custom((value) => value === null || (typeof value === 'string' && value.trim().length > 0)),
    body('date').custom((value) => value === null || (typeof value === 'string' && value.trim().length > 0)),
    body('durationTotal').custom((value) => value === null || (typeof value === 'number')),
    body('distanceTotal').custom((value) => value === null || (typeof value === 'number')),
    body('comment').custom((value) => value === null || (typeof value === 'string' && value.trim().length > 0)),
  ],
  verifyUserToken,
  modifyActivity
);

/**
 * @swagger
 *  /activity/suppression/{activityId}:
 *    delete:
 *      tags:
 *        - Activity
 *      summary: Deletes a specific activity
 *      produces:
 *        - application/json
 *      parameters:
 *        - name: activityId
 *          in: path
 *          required: true
 *          description: ID of the activity to delete
 *          type: string
 *      responses:
 *        200:
 *          description: Successfully deleted
 *        401:
 *          description: Unauthorized
 *      security:
 *        - BearerAuth: []
 */
router.delete('/suppression/:activityId',
  verifyUserToken,
  suppressionActivity
);

router.post('/geolocation',
  verifyUserToken,
  geolocation
);

export default router;
