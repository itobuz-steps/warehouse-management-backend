import { createProductSchema } from '../schema/productSchema.js';
import { ValidationError } from 'yup';

export default class ProductValidation {
  createProductValidation = async (req, res, next) => {
    try {
      const productData = JSON.parse(req.body.data);

      await createProductSchema.validate(productData, {
        abortEarly: false, // return all validation errors
        stripUnknown: true, // remove unexpected fields
      });

      next();
    } catch (err) {
      if (err instanceof ValidationError) {
        res.status(400);
        next(new Error(err.errors.join(', ')));
      }

      next(err);
    }
  };
}
