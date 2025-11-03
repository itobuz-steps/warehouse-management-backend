import * as yup from 'yup';

export const warehouseSchema = yup.object({
  name: yup.string().required('Name is required'),
  location: yup.string().required('Location is required'),
  active: yup.boolean().default(true),
  description: yup.string().default(''),
});
