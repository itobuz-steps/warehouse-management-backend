import * as yup from 'yup';

export const updateProfileSchema = yup.object({
  name: yup
    .string()
    .min(1, 'Name must be at least 1 characters long')
    .required('Name is required'),
  profileImage: yup.string(),
});
