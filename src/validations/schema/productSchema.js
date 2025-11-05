import * as yup from 'yup';

export const createProductSchema = yup.object({
  name: yup.string().required('Product name is required'),
  sku: yup.string().required('SKU is required'),
  category: yup.array().of(yup.string()),
  description: yup.string().optional(),
  productImage: yup.string().url('Product image must be a valid URL').optional(),
  price: yup
    .number()
    .required('Price is required')
    .min(0, 'Price must be greater than or equal to 0'),
  quantity: yup.number().min(0).default(0),
  minStockLevel: yup.number().min(0).default(0),
  warehouseId: yup.string().required('Warehouse ID is required'),
  locationId: yup.string().required('Location ID is required'),

  isArchived: yup.boolean().default(false),
  createdBy: yup.string().required('Created by is required'),
});

export const updateProductSchema = yup.object({
  name: yup.string().optional(),
  sku: yup.string().optional(),
  category: yup.array().of(yup.string()).optional(),
  description: yup.string().optional(),
  productImage: yup.string().url('Product image must be a valid URL').optional(),
  price: yup
    .number()
    .min(0, 'Price must be greater than or equal to 0')
    .optional(),
  quantity: yup.number().min(0, 'Quantity cannot be negative').optional(),
  minStockLevel: yup
    .number()
    .min(0, 'Minimum stock cannot be negative')
    .optional(),
  warehouseId: yup.string().optional(),
  locationId: yup.string().optional(),
  isArchived: yup.boolean().optional(),
  createdBy: yup.string().optional(),
});

export const deleteProductSchema = yup.object({
  id: yup.string().required('Product ID is required'),
});
