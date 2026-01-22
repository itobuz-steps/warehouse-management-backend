import type { Request } from 'express';
import type Multer from 'multer';
import type { IUser } from '../models/userModel.js';

declare global {
  namespace Express {
    interface Request {
      userId: string;
      files?: Multer.File[] | Record<string, Multer.File[]>;
      file?: Multer.File;
      user?: IUser;
    }
  }
}

export {};
