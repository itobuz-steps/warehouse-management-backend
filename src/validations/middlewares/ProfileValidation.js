import { updateProfileSchema } from '../schema/profileSchema.js';
import { ValidationError } from 'yup';

export default class ProfileValidation {
  updateProfileValidation = async (req, res, next) => {
    try {
      await updateProfileSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
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
