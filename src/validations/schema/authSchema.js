import * as yup from 'yup';

export const signupSchema = yup.object({
  name: yup.string().default(''),
  email: yup.string().required('Email is required'),
  isVerified: yup.boolean().default(false),
  isActive: yup.boolean().default(),
  password: yup.string().default(null),
  role: yup.string().default('manager'),
});
