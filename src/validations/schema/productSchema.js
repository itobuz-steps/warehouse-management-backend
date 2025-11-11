import * as yup from 'yup';

export const createProductSchema = yup.object({
  name: yup.string().required('Product name is required'),

  category: yup.string().required('Category is required'),

  description: yup.string().optional(),

  productImage: yup
    .array()
    .of(yup.string().url('Each product image must be a valid URL'))
    .optional(),

  price: yup
    .number()
    .required('Cost price is required')
    .min(0, 'Price must be greater than or equal to 0'),

  isArchived: yup.boolean().default(false),

  createdBy: yup.string().required('Created by is required'),
});

export const updateProductSchema = yup.object({
  name: yup.string().optional(),

  category: yup.string(),

  description: yup.string().optional(),

  productImage: yup
    .array()
    .of(yup.string().url('Each product image must be a valid URL'))
    .optional(),

  price: yup
    .number()
    .min(0, 'Price must be greater than or equal to 0')
    .optional(),

  isArchived: yup.boolean().optional(),

  createdBy: yup.string().optional(),
});

export const deleteProductSchema = yup.object({
  id: yup.string().required('Product ID is required'),
});

export const restoreProductSchema = yup.object({
  id: yup.string().required('Product ID is required'),
});
