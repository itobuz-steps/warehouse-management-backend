import * as yup from 'yup';

export const stockInSchema = yup.object().shape({
  products: yup
    .array()
    .of(
      yup.object().shape({
        name: yup.string().required('Product name is required'),
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

export const stockOutSchema = yup.object().shape({
  products: yup
    .array()
    .of(
      yup.object().shape({
        name: yup.string().required('Product name is required'),
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
