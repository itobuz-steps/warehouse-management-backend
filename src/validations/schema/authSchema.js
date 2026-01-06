import * as yup from 'yup';
import USER_TYPES from '../../constants/userConstants.js';

export const signupSchema = yup.object({
  name: yup.string().default('guest'),
  email: yup.string().required('Email is required'),
  isVerified: yup.boolean().default(false),
  isActive: yup.boolean().default(false),
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
      'Password must contain uppercase, lowercase, number, and special character'
    ),
  role: yup.string().default(USER_TYPES.MANAGER),
});

export const loginSchema = yup.object({
  email: yup.string().required(),
  password: yup.string().required(),
});

export const forgotPasswordSchema = yup.object({
  email: yup.string().required('Email is required'),
  otp: yup.string().required('OTP is required'),
  password: yup.string().required(),
});

export const sendOtpSchema = yup.object({
  email: yup.string().required('Email is required'),
});
