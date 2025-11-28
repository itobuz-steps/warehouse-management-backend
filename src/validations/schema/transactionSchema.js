import * as yup from 'yup';

export const stockInSchema = yup.object({
  products: yup
    .array()
    .of(
      yup.object({
        productId: yup.string().required('Product is required'),
        quantity: yup
          .number()
          .required('Quantity is required')
          .positive('Quantity must be greater than 0'),
        limit: yup.number().optional().min(0, 'Limit cannot be negative'),
      })
    )
    .required('Products list is required')
    .min(1, 'At least one product is required'),

  supplier: yup.string().required('Supplier name is required').trim(),

  destinationWarehouse: yup
    .string()
    .required('Destination warehouse name is required')
    .trim(),

  notes: yup.string().optional().default(''),
});

export const stockOutSchema = yup.object({
  products: yup
    .array()
    .of(
      yup.object({
        productId: yup.string().required('Product is required'),
        quantity: yup
          .number()
          .required('Quantity is required')
          .positive('Quantity must be greater than 0'),
      })
    )
    .required('Products list is required')
    .min(1, 'At least one product is required'),

  customerName: yup.string().required('Customer name is required').trim(),
  customerEmail: yup
    .string()
    .email('Invalid email format')
    .required('Customer email is required'),
  customerPhone: yup
    .number()
    .typeError('Customer phone must be a number')
    .required('Customer phone is required'),
  customerAddress: yup.string().required('Customer address is required').trim(),

  sourceWarehouse: yup
    .string()
    .required('Source warehouse name is required')
    .trim(),

  notes: yup.string().optional().default(''),
});

export const adjustmentSchema = yup.object({
  products: yup
    .array()
    .of(
      yup.object({
        productId: yup.string().required('Product is required'),
        quantity: yup
          .number()
          .required('Quantity is required')
          .positive('Quantity must be greater than 0'),
        limit: yup.number().optional().min(0, 'Limit cannot be negative'),
      })
    )
    .required('Products list is required')
    .min(1, 'At least one product is required'),
  warehouseId: yup.string().trim().required('Warehouse is required'),
  reason: yup.string().trim().required('Reason is required'),
  notes: yup.string().trim().nullable(),
});

export const transferSchema = yup.object({
  sourceWarehouse: yup.string().required('Source warehouse is required'),
  destinationWarehouse: yup
    .string()
    .required('Destination warehouse is required'),
  notes: yup.string().nullable(),
  products: yup
    .array()
    .of(
      yup.object({
        productId: yup.string().required('Product ID is required'),
        quantity: yup
          .number()
          .required('Quantity is required')
          .positive('Quantity must be greater than zero'),
      })
    )
    .required('Products list is required')
    .min(1, 'At least one product must be transferred'),
});
