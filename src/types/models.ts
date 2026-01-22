import mongoose, { Types, Document } from 'mongoose';
import USER_TYPES from '../constants/userConstants.js';
import TRANSACTION_TYPES from '../constants/transactionConstants.js';
import SHIPMENT_TYPES from '../constants/shipmentConstants.js';
import CATEGORY_TYPES from '../constants/categoryConstants.js';
import NOTIFICATION_TYPES from '../constants/notificationConstants.js';

export type INotification = Document & {
  userIds: Types.ObjectId[];

  transactionPerformedBy: Types.ObjectId;

  type: (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];

  title: string;
  message: string;

  seen: boolean;

  relatedProduct?: Types.ObjectId;
  warehouse?: Types.ObjectId;
  transactionId?: Types.ObjectId;

  isShipped: boolean;
  isCancelled: boolean;

  reportedBy?: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
};

export type IOtp = Document & {
  email: string;
  otp: string[];

  createdAt: Date;
  updatedAt: Date;
};

export type IProduct = Document & {
  name: string;
  category: (typeof CATEGORY_TYPES)[keyof typeof CATEGORY_TYPES];
  description?: string;
  productImage?: string[];
  price: number;
  markup?: number;
  createdBy?: Types.ObjectId;
  isArchived: boolean;

  createdAt: Date;
  updatedAt: Date;
};

export type IQuantity = {
  warehouseId: Types.ObjectId;
  productId: Types.ObjectId;
  quantity: number;
  limit: number;

  createdAt: Date;
  updatedAt: Date;
};

export type ISubscription = Document & {
  endpoint: string;
  expirationTime: Date | null;
  keys: {
    p256dh: string;
    auth: string;
  };
  userId: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
};

export type ITransaction = {
  _id: mongoose.Types.ObjectId;
  type: (typeof TRANSACTION_TYPES)[keyof typeof TRANSACTION_TYPES];
  product: IProduct | mongoose.Types.ObjectId;
  quantity: number;

  // Stock IN
  supplier?: string;

  // Stock OUT
  customerName?: string;
  customerEmail?: string;
  customerPhone?: number;
  customerAddress?: string;

  shipment?: (typeof SHIPMENT_TYPES)[keyof typeof SHIPMENT_TYPES];

  // Adjustments
  reason?: string;
  notes?: string;

  performedBy: IUser | mongoose.Types.ObjectId;
  sourceWarehouse: WarehouseDocument | mongoose.Types.ObjectId;
  destinationWarehouse: WarehouseDocument | mongoose.Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
};

export type IUser = Document & {
  name?: string;
  email: string;
  password: string;
  role: (typeof USER_TYPES)[keyof typeof USER_TYPES];
  isVerified: boolean;
  profileImage?: string;
  lastLogin?: Date;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type WarehouseDocument = Document & {
  name: string;
  address: string;
  description?: string;
  managerIds: Types.ObjectId[];
  active: boolean;
  capacity: number;
  createdAt: Date;
  updatedAt: Date;
};
