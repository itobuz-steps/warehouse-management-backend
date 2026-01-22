import * as yup from 'yup';
import USER_TYPES from '../../constants/userConstants.js';

export const signupSchema = yup
  .object({
    name: yup.string().default('guest'),
    email: yup.string().required('Email is required'),
    isVerified: yup.boolean().default(false),
    isActive: yup.boolean().default(false),
    password: yup.string().default('Password is required'),
    role: yup.string().default(USER_TYPES.MANAGER),
  })
  .noUnknown(true);

export const signupUserSchema = yup
  .object({
    name: yup.string().default('guest'),
    isVerified: yup.boolean().default(false),
    isActive: yup.boolean().default(false),
    password: yup
      .string()
      .required('Password is required')
      .min(6, 'Password must be at least 6 characters')
      .matches(
        /^[A-Za-z\d]{6,}$/,
        'Password must be at least 6 characters and contain only letters and numbers'
      ),
    role: yup.string().default(USER_TYPES.MANAGER),
  })
  .noUnknown(true);

export const loginSchema = yup
  .object({
    email: yup.string().required(),
    password: yup.string().required(),
  })
  .noUnknown(true);

export const forgotPasswordSchema = yup
  .object({
    email: yup.string().required('Email is required'),
    otp: yup.string().required('OTP is required'),
    password: yup
      .string()
      .required('Password is required')
      .min(6, 'Password must be at least 6 characters')
      .matches(
        /^[A-Za-z\d]{6,}$/,
        'Password must be at least 6 characters and contain only letters and numbers'
      ),
  })
  .noUnknown(true);

export const sendOtpSchema = yup
  .object({
    email: yup.string().required('Email is required'),
  })
  .noUnknown(true);

export type SignupSchemaType = yup.InferType<typeof signupSchema>;
export type SignupUserSchemaType = yup.InferType<typeof signupUserSchema>;
export type LoginSchemaType = yup.InferType<typeof loginSchema>;
export type ForgotPasswordSchemaType = yup.InferType<
  typeof forgotPasswordSchema
>;
export type SendOtpSchemaType = yup.InferType<typeof sendOtpSchema>;
