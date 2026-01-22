import {
  createProductSchema,
  updateProductSchema,
  deleteProductSchema,
} from '../schema/productSchema.js';
import { ValidationError } from 'yup';
import type { AppMiddleware } from '../../types/express.js';

type CreateProductBody = {
  name: string;
  category?: string;
  description?: string;
  price: number;
  markup?: number;
  createdBy?: string;
};

export default class ProductValidation {
  createProductValidation: AppMiddleware<
    Record<string, string>,
    CreateProductBody
  > = async (req, res, next): Promise<void> => {
    try {
      req.body.createdBy = req.userId;

      await createProductSchema.validate(req.body, {
        abortEarly: false, // return all validation errors
        stripUnknown: true, // remove unexpected fields
      });

      next();
    } catch (err) {
      if (err instanceof ValidationError) {
        res.status(400);
        throw new Error(err.errors.join(', '));
      }

      next(err);
    }
  };

  updateProductValidation: AppMiddleware = async (
    req,
    res,
    next
  ): Promise<void> => {
    try {
      await updateProductSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

      next();
    } catch (err) {
      if (err instanceof ValidationError) {
        res.status(400);
        throw new Error(err.errors.join(', '));
      }

      next(err);
    }
  };

  deleteProductValidation: AppMiddleware = async (
    req,
    res,
    next
  ): Promise<void> => {
    try {
      await deleteProductSchema.validate(req.params, {
        abortEarly: false,
        stripUnknown: true,
      });

      next();
    } catch (err) {
      if (err instanceof ValidationError) {
        res.status(400);
        throw new Error(err.errors.join(', '));
      }
      next(err);
    }
  };

  restoreProductValidation: AppMiddleware = async (
    req,
    res,
    next
  ): Promise<void> => {
    try {
      await deleteProductSchema.validate(req.params, {
        abortEarly: false,
        stripUnknown: true,
      });

      next();
    } catch (err) {
      if (err instanceof ValidationError) {
        res.status(400);
        throw new Error(err.errors.join(', '));
      }
      next(err);
    }
  };
}
