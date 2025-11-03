import * as yup from 'yup';

export const createProductSchema = yup.object({
  name: yup.string().required('Product name is required'),
  sku: yup.string().required('SKU is required'),
  category: yup.array().of(yup.string()),
  description: yup.string().optional(),
  product_img: yup.string().url('Product image must be a valid URL').optional(),
  price: yup
    .number()
    .required('Price is required')
    .min(0, 'Price must be greater than or equal to 0'),
  quantity: yup.number().min(0).default(0),
  min_stock_level: yup.number().min(0).default(0),
  warehouse_id: yup.string().required('Warehouse ID is required'),
  location_id: yup.string().required('Location ID is required'),

  is_archived: yup.boolean().default(false),
  created_by: yup.string().required('Created by is required'),
});

export const updateProductSchema = yup.object({
  name: yup.string().optional(),
  sku: yup.string().optional(),
  category: yup.array().of(yup.string()).optional(),
  description: yup.string().optional(),
  product_img: yup.string().url('Product image must be a valid URL').optional(),
  price: yup
    .number()
    .min(0, 'Price must be greater than or equal to 0')
    .optional(),
  quantity: yup.number().min(0, 'Quantity cannot be negative').optional(),
  min_stock_level: yup
    .number()
    .min(0, 'Minimum stock cannot be negative')
    .optional(),
  warehouse_id: yup.string().optional(),
  location_id: yup.string().optional(),
  is_archived: yup.boolean().optional(),
  created_by: yup.string().optional(),
});
