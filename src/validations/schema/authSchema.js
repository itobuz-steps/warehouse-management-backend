import * as yup from 'yup';
import USER_TYPES from '../../constants/userConstants.js';

export const signupSchema = yup.object({
  name: yup.string().default('guest'),
  email: yup.string().required('Email is required'),
  isVerified: yup.boolean().default(false),
  isActive: yup.boolean().default(false),
  password: yup.string().default(''),
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
