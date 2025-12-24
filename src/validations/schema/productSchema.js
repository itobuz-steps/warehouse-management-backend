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

  markup: yup
    .number()
    .min(0, 'Markup cannot be less than 0%')
    .max(100, 'Markup cannot be more than 100%')
    .default(10),

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

export const updateLimitSchema = yup.object({
  limit: yup.number().min(1, 'Limit must be greater than zero'),
});
