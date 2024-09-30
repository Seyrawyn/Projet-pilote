import { NextFunction, Request, Response } from 'express';
import { User } from '../models/users';
import { deleteUserById, getUserById, getUserByUsername, getUserByEmail, insertUser, updateUserById, getUserImage, updateUserImage, getUserByIdWithTrainer } from '../services/user.services';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';


// User controller
export const createUser = async (req: Request, res: Response, next: NextFunction) => {

  try {
  // Le mot de passe doit être hasher ceci est juste un exemple
    const { username, password, email, name, dateOfBirth} = req.body;

    const userExist: User | undefined = await getUserByUsername(username);
    const emailExist : User | undefined = await getUserByEmail(email);

    // Check if username already taken
    if (userExist) {
      return res.status(409).json({ error: 'A user already has that name' });
    }

    // Check if email is already used
    if (emailExist) {
      return res.status(409).json({error: 'A user already has that email'});
    }


    // hashing the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user in the db
    await insertUser({ username, password: hashedPassword, email, name, dateOfBirth });

    return res.status(201).json({ message: 'user added succesfully'});
  } catch (error) {
    next(error);
  }
};


export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {

  try {
    // Le mot de passe doit être hasher ceci est juste un exemple
    const { username, password } = req.body;
    const user: User | undefined = await getUserByUsername(username);

    // User does not exist
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password as string);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const payload = {userId: user.id};
    const secret: jwt.Secret = process.env.SECRET as string || 'petit_secret';
    const token = jwt.sign(payload, secret, { expiresIn: '1h' });

    res.setHeader('Set-Cookie', `token=${token}; Max-Age=${60 * 60}; Path=/; HttpOnly; SameSite=Strict`);

    return res.status(200).json({ token });
  } catch (error) {
    next(error);
  }
};



export const getUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId as number;
    const user = await getUserByIdWithTrainer(userId);

    if (!user) {
      return res.status(404).json({ error: 'No corresponding user' });
    }

    return res.status(200).json(user);

  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId as number;
    const user: User | undefined = await getUserById(userId);

    if (!user) {
      return res.status(404).json({ error: 'No corresponding user' });
    }

    const { username, password, email, name,
      dateOfBirth, height, weight, sex, description} = req.body;

    const updateData: Partial<User> = {};

    if (username) updateData.username = username;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    if (email !== undefined) updateData.email = email;
    if (name !== undefined) updateData.name = name;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
    if (height !== undefined) updateData.height = height;
    if (weight !== undefined) updateData.weight = weight;
    if (sex !== undefined) updateData.sex = sex;
    if (description !== undefined) updateData.description = description;

    await updateUserById(userId, updateData);
    
    return res.status(200).json({ message: 'User successfully updated' });

  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId as number;
    const user: User | undefined = await getUserById(userId);

    if (!user) {
      return res.status(404).json({ error: 'Nothing to delete' });
    }

    await deleteUserById(userId);

    return res.status(200).json({ message: 'User successfully deleted' });

  } catch (error) {
    next(error);
  }
};



/*** Picture ***/
const userUploadDir = path.join(__dirname, '../../uploads');

export const uploadPicture = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId as number;
    const user: User | undefined = await getUserById(userId);
    
    if (!user) return res.status(404).json({ message: 'No corresponding user' });
    
    if (!req.file) {
      return res.status(400).json({ message: 'No picture uploaded' });
    }

    const { img } = await getUserImage(userId);

    if (img) {
      await fs.promises.unlink(path.join(userUploadDir, img));
    }
    
    await updateUserImage(userId, req.file.filename);

    return res.status(200).json({ message: 'Picture uploaded successfully' });
  } catch (error) {
    next(error);
  }
};


export const getPicture = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId as number;
    const user: User | undefined = await getUserById(userId);

    if (!user) {
      return res.status(404).json({ message: 'No corresponding user' });
    }

    const { img } = await getUserImage(userId);

    if (!img) return res.status(404).json({ message: 'User has no picture' });

    return res.status(200).json({img: `/uploads/${img}`});
  } catch (error) {
    next(error);
  }
};


export const deletePicture = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId as number;
    const user: User | undefined = await getUserById(userId);

    if (!user) {
      return res.status(404).json({ error: 'No corresponding user found' });
    }

    const { img } = await getUserImage(userId);

    if (!img || img == '') {
      return res.status(405).json({ message: 'No picture found for deletion' });
    }

    await fs.promises.unlink(path.join(userUploadDir, img));

    await updateUserImage(userId, ''); 

    return res.status(200).json({ message: 'Picture deleted successfully' });
  } catch (error) {
    next(error);
  }
};



// Deviendra une option pour télécharger un photo
// export const getPicture = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const userId = req.user?.userId as number;

//     if (!userId) {
//       return res.status(404).json({ message: 'No corresponding user' });
//     }
    
//     fs.readdir(userUploadDir, (err, files) => {
//       if (err) {
//         return res.status(500).json({ message: 'Error reading directory' });
//       }

//       const matchingFile = files.find(file => file.startsWith(userId.toString()));

//       if (matchingFile) {
//         const filePath = path.join(userUploadDir, matchingFile);
//         return res.status(200).sendFile(filePath);
//       } else {
//         return res.status(405).json({ message: 'Picture does not exist' });
//       }
//     });
//   } catch (error) {
//     next(error);
//   }
// };
