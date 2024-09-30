import multer from 'multer';
import * as console from 'node:console';
import fs from 'fs';
import path from 'path';


// Set up storage directory (adjust path as needed)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './src/uploads/'); // make sure this uploads directory exists
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + '.gpx');
  }
});

// Adjust the fileFilter to include the req parameter
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if ( file.mimetype === 'application/gpx+xml'
    || file.mimetype === 'application/octet-stream' && file.originalname.endsWith('.gpx')
    || file.mimetype === 'text/xml' && file.originalname.endsWith('.gpx') ) {
    cb(null, true);
  } else {
    new Error('Please upload only GPX files.');
    cb(null, false);
  }
};

export const deleteFile = async (filePath: string) => {
  try {
    const absolutePath = path.resolve(filePath); // Ensure the path is absolute
    if (fs.existsSync(absolutePath)) { // Check if the file exists
      await fs.promises.unlink(absolutePath);
      console.log(`File deleted: ${absolutePath}`);
    } else {
      console.log(`File does not exist: ${absolutePath}`);
    }
  } catch (err) {
    // Type assertion to narrow down the type of 'err'
    const error = err as NodeJS.ErrnoException;

    if (error.code === 'ENOENT') {
      console.error(`File not found: ${filePath}`);
    } else if (error.code === 'EBUSY' || error.code === 'EPERM') {
      console.error(`File is in use or protected: ${filePath}`);
      // Implement retry logic here if desired
    } else {
      console.error(error.message); // Now safely accessing 'message' property
    }
  }
};



// Then, when configuring multer, everything else remains the same
export const upload = multer({ storage, fileFilter });
