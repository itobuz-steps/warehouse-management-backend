import * as yup from 'yup';

export const createProductSchema = yup.object({
  name: yup.string().required('Product name is required'),
  sku: yup.string().required('SKU is required'),

  category: yup
    .array()
    .of(yup.string().required())
    .min(1, 'At least one category is required')
    .required('Category is required'),

  description: yup.string().optional(),

  productImage: yup
    .array()
    .of(yup.string().url('Each product image must be a valid URL'))
    .optional(),

  price: yup
    .number()
    .required('Cost price is required')
    .min(0, 'Price must be greater than or equal to 0'),

  warehouseIds: yup
    .array()
    .of(yup.string().required())
    .min(1, 'At least one warehouse ID is required')
    .required('Warehouse IDs are required'),

  isArchived: yup.boolean().default(false),

  createdBy: yup.string().required('Created by is required'),
});

export const updateProductSchema = yup.object({
  name: yup.string().optional(),
  sku: yup.string().optional(),

  category: yup.array().of(yup.string()).optional(),

  description: yup.string().optional(),

  productImage: yup
    .array()
    .of(yup.string().url('Each product image must be a valid URL'))
    .optional(),

  price: yup
    .number()
    .min(0, 'Price must be greater than or equal to 0')
    .optional(),

  warehouseIds: yup.array().of(yup.string()).optional(),

  isArchived: yup.boolean().optional(),

  createdBy: yup.string().optional(),
});

export const deleteProductSchema = yup.object({
  id: yup.string().required('Product ID is required'),
});
