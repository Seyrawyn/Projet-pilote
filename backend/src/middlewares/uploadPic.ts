/**** uploadUserPic ****/
import multer, { FileFilterCallback, StorageEngine } from 'multer';
import crypto from 'crypto';
import { userPayload } from '../types';
import { Request } from 'express';

export let storagePicture: StorageEngine;

if (process.env.NODE_ENV === 'test') {
  storagePicture = multer.memoryStorage();
} else {
  storagePicture = multer.diskStorage({
    destination(req, file, cb) {
      cb(null, 'uploads/');
    },
    filename(req, file, cb) {
      const userId = (req.user as userPayload).userId;
      const fileExtension = file.originalname.split('.').pop();
      const randomString = crypto.randomBytes(8).toString('hex');
      const fileName = `${userId}-${randomString}.${fileExtension}`;
      cb(null, fileName);
    }
  });
}

const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true); // Accept file
  } else {
    cb(null, false);
  }
};

export const uploadUserPic = multer({ storage: storagePicture, fileFilter });
