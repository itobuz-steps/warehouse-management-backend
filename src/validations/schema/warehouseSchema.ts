import * as yup from 'yup';

export const warehouseSchema = yup
  .object({
    name: yup.string().required('Name is required'),
    address: yup.string().required('Location is required'),
    active: yup.boolean().default(true),
    description: yup.string().default(''),
    capacity: yup.number().required('Capacity is required'),
  })
  .noUnknown(true);

export type WarehouseBody = yup.InferType<typeof warehouseSchema>;
