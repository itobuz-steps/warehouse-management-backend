import { ValidationError } from 'yup';

export const validate = (schema) => async (req, res, next) => {
  try {
    req.body = await schema.validate(req.body, {
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
