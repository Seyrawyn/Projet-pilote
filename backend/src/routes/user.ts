import express from 'express';
import { body } from 'express-validator';
import { createUser, getUser, deleteUser, updateUser, uploadPicture, getPicture, deletePicture } from '../controllers/UserController';
import { expressValidator } from '../middlewares/validation';
import { verifyUserToken } from '../middlewares/authentication';
import { evTypes, isGivenTypeOrNull } from '../utils/expressValidatorUtils';
import { uploadUserPic } from '../middlewares/uploadPic';

const router = express.Router();

/**
 * @swagger
 * /user:
 *  post:
 *    tags:
 *    - user
 *    summary: Create user
 *    description: Route to create a new user
 *    security: []
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
 *              email:
 *                type: string
 *                description: The email of a user
 *                example: jeanpapa@gmail.com
 *              name: 
 *                type: string
 *                description: The name of a user
 *                example: jean-papa Juanpadre
 *              dateOfBirth:
 *                type: string
 *                description: The date of birth of a user
 *                example: 1990-01-01
 *    responses:
 *      201:
 *        description: New user created
 *      400:
 *        description: Bad Request
 *      409:
 *        description: Conflict
 *      500:
 *        description: Server Error
 */
router.post('/',
  [
    body('username').isString().isLength({min: 1, max: 256}).withMessage('username must be a not empty string'),
    body('password').isString().isLength({min: 8, max: 72}).withMessage('password must be a min of 8 chars and max 72 chars'),
    body('email').isString().isEmail(),
    body('name').isLength({min: 1}).isString().withMessage('Name must be an non empty string'),
    body('dateOfBirth').isISO8601().withMessage('Date of birth must be a valid date in ISO 8601 format'),
  ],
  expressValidator,
  createUser
);

/**
 * @swagger
 * /user:
 *   get:
 *     tags:
 *       - user
 *     summary: Get user data
 *     description: Route to get the data of a user using its token
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Information obtained successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   required: true
 *                   type: string
 *                   example: jean-papa
 *                 email:
 *                   required: true
 *                   type: string
 *                   description: The email of a user
 *                   example: jeanpapa@gmail.com
 *                 name:
 *                   required: true
 *                   type: string
 *                   description: The name of a user
 *                   example: jean-papa Juanpadre
 *                 dateOfBirth:
 *                   required: true
 *                   type: string
 *                   description: The date of birth of a user
 *                   example: 1990-01-01
 *                 height:
 *                   required: false
 *                   type: number
 *                   format: float
 *                   description: The height of a user in cm
 *                   example: 180.5
 *                 weight:
 *                   required: false  
 *                   type: number
 *                   format: float
 *                   description: The weight of a user in kg
 *                   example: 75.5
 *                 sex:
 *                   required: false
 *                   type: string
 *                   description: The sex of a user
 *                   example: male
 *                 img:
 *                   type: string
 *                   description: The name of the user's image
 *                   example: 1-djaskhfgads08fwdsfnb234f890.png
 *                 description:
 *                   required: false
 *                   type: string
 *                   description: Description of a user
 *                   example: Timothé le 6e du nom, aime les oranges
 *       404:
 *         description: No corresponding user found
 *       500:
 *         description: Server Error
 */
router.get('/', verifyUserToken, getUser);


/**
 * @swagger
 * /user:
 *   put:
 *     tags:
 *       - user
 *     summary: Update user data
 *     description: Route to update the data of a user using its ID. If you wish to update password use the `PATCH` method instead.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of a user
 *                 example: Jean Paternelle
 *               username:
 *                 type: string
 *                 description: The username of a user
 *                 example: jean-papa
 *               email:
 *                 type: string
 *                 description: The username of a user
 *                 example: jean-papa@yahoo.ca
 *               dateOfBirth:
 *                 type: string
 *                 description: The date of birth of a user
 *                 example: 1990-01-01
 *               sex:
 *                 type: string
 *                 enum:
 *                   - Homme
 *                   - Femme
 *                   - Autre
 *                 description: The sex of a user
 *                 example: Homme
 *               height:
 *                 type: number
 *                 format: float
 *                 description: The height of a user in cm
 *                 example: 180.5
 *               weight:
 *                 type: number
 *                 format: float
 *                 description: The weight of a user in kg
 *                 example: 75.5
 *               description:
 *                 type: string
 *                 description: the description of a user.
 *                 example: "Empereur incontesté de l'uqam"
 *             required:
 *               - name
 *               - username
 *               - email
 *               - dateOfBirth
 *               - sex
 *               - height
 *               - weight
 *               - description
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: No corresponding user found
 */
router.put('/',
  [
    body('username').custom(isGivenTypeOrNull(evTypes.STRING)).isLength({min: 1}).withMessage('Required, must be a string and cannot be null'),
    body('email').custom(isGivenTypeOrNull(evTypes.EMAIL)).withMessage('Required, must be a valid email'),
    body('name').custom(isGivenTypeOrNull(evTypes.STRING)).withMessage('Required, must be a string'),
    body('dateOfBirth').custom(isGivenTypeOrNull(evTypes.DATE)).withMessage('Required, must be a valid date in ISO 8601 format'),
    body('height').custom(isGivenTypeOrNull(evTypes.FLOAT)).withMessage('Required, must be numerical. The value is in cm'),
    body('weight').custom(isGivenTypeOrNull(evTypes.FLOAT)).withMessage('Required. Must be numerical. The value is in kg'),
    body('sex').custom(isGivenTypeOrNull(evTypes.SEX)).withMessage('Required, must be either Homme, Femme or Autre'),
    body('description').custom(isGivenTypeOrNull(evTypes.STRING)).isLength({ min: 0, max: 1024 }).withMessage('Required, string with max length of 1024')
  ],
  expressValidator,
  verifyUserToken,
  updateUser
);

/**
 * @swagger
 * /user:
 *   patch:
 *     tags:
 *       - user
 *     summary: Update partially user data
 *     description: Route to update `partially` the data of a user using it's ID
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of a user
 *                 example: Jean Paternelle
 *               username:
 *                 type: string
 *                 description: The username of a user
 *                 example: jean-papa
 *               password:
 *                 type: string
 *                 description: The password of a user
 *                 example: Motdepasse1234
 *               email:
 *                 type: string
 *                 description: The username of a user
 *                 example: jean-papa@yahoo.ca
 *               dateOfBirth:
 *                 type: string
 *                 description: The date of birth of a user
 *                 example: 1990-01-01
 *               sex:
 *                 type: string
 *                 enum:
 *                   - Homme
 *                   - Femme
 *                   - Autre
 *                 description: The sex of a user
 *                 example: Homme
 *               height:
 *                 type: number
 *                 format: float
 *                 description: The height of a user in cm
 *                 example: 180.5
 *               weight:
 *                 type: number
 *                 format: float
 *                 description: The weight of a user in kg
 *                 example: 75.5
 *               description:
 *                 type: string
 *                 description: the description of a user.
 *                 example: "Empereur incontesté de l'uqam"
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: No corresponding user found
 */
router.patch('/',
  [
    body('username').optional().isString().isLength({min: 1}).withMessage('Must be a string and cannot be null'),
    body('password').optional().isString().isLength({min: 8, max: 72}).withMessage('password must be a min of 8 chars and max 72 chars'),
    body('email').optional().isString().isEmail().withMessage('Must be a valid email'),
    body('name').optional().isString().withMessage('Must be a string'),
    body('dateOfBirth').optional().isISO8601().withMessage('Date of birth must be a valid date in ISO 8601 format'),
    body('height').optional().isFloat().withMessage('Must be numerical. The value is in cm'),
    body('weight').optional().isFloat().withMessage('Must be numerical. The value is in kg'),
    body('sex').optional().isString().matches(/\b(?:Homme|Femme|Autre)\b/).withMessage('Must be either Homme, Femme or Autre'),
    body('description').optional().isString().withMessage('String with max length of 1024').isLength({ min: 1, max: 1024 }),
  ],
  expressValidator,
  verifyUserToken,
  updateUser,
);



/**
 * @swagger
 * /user:
 *  delete:
 *    tags:
 *    - user
 *    summary: Delete a user
 *    description: Delete a user based on its token.
 *    security:
 *      - BearerAuth: []
 *    responses:
 *      200:
 *        description: User successfully deleted
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: User successfully deleted
 */
router.delete('/', verifyUserToken, deleteUser);


/**
 * @swagger
 * /user/picture:
 *  put:
 *    tags:
 *    - user
 *    summary: Upload user picture
 *    description: Upload the picture of a user
 *    security:
 *      - BearerAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        multipart/form-data:
 *          schema:
 *            type: object
 *            properties:
 *              picture:
 *                type: string
 *                format: binary
 *                description: The picture of a user
 *    responses:
 *      200:
 *        description: User picture updated successfully
 *      400:
 *        description: Failed to upload the picture
 *      402:
 *        description: No picture uploaded
 *      404:
 *        description: User not found
 */
router.put('/picture',
  verifyUserToken,  
  uploadUserPic.single('picture'),
  uploadPicture,
);


/**
 * @swagger
 * /user/picture:
 *  get:
 *    tags:
 *    - user
 *    summary: Get user picture
 *    description: Retrieve the picture of a user
 *    security:
 *      - BearerAuth: []
 *    responses:
 *      200:
 *        description: User picture retrieved successfully
 *      404:
 *        description: User not found
 *      405:
 *        description: User has no picture
 */
router.get('/picture', verifyUserToken, getPicture);



/**
 * @swagger
 * /user/picture:
 *   delete:
 *     tags:
 *     - user
 *     summary: Deletes the picture of a user
 *     description: Delete the picture of user based on its token.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Picture successfully deleted
 *         content:
 *           application/json: 
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Picture successfully deleted
 *       404:
 *         description: No corresponding user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No corresponding user
 *       405:
 *         description: No picture found to delete
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No picture found for deletion
 */
router.delete('/picture', verifyUserToken, deletePicture);

export default router;
