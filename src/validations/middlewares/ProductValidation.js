import {
  createProductSchema,
  updateProductSchema,
  deleteProductSchema,
} from '../schema/productSchema.js';
import { ValidationError } from 'yup';

export default class ProductValidation {
  createProductValidation = async (req, res, next) => {
    try {
      const productData = req.body;
      console.log(productData);

      await createProductSchema.validate(productData, {
        abortEarly: false, // return all validation errors
        stripUnknown: true, // remove unexpected fields
      });

      next();
    } catch (err) {
      if (err instanceof ValidationError) {
        res.status(400);
        return new Error(err.errors.join(', '));
      }

      next(err);
    }
  };

  updateProductValidation = async (req, res, next) => {
    try {
      await updateProductSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

      next();
    } catch (err) {
      if (err instanceof ValidationError) {
        res.status(400);
        return new Error(err.errors.join(', '));
      }

      next(err);
    }
  };

  deleteProductValidation = async (req, res, next) => {
    try {
      await deleteProductSchema.validate(req.params, {
        abortEarly: false,
        stripUnknown: true,
      });

      next();
    } catch (err) {
      if (err instanceof ValidationError) {
        res.status(400);
        return new Error(err.errors.join(', '));
      }
      next(err);
    }
  };
}
