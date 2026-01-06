import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Transaction from '../models/transactionModel.js';
import Quantity from '../models/quantityModel.js';
import Product from '../models/productModel.js';
import User from '../models/userModel.js';
import Warehouse from '../models/warehouseModel.js';
import Notification from '../utils/Notification.js';

import TRANSACTION_TYPES from '../constants/transactionConstants.js';
import SHIPMENT_TYPES from '../constants/shipmentConstants.js';
import NOTIFICATION_TYPES from '../constants/notificationConstants.js';

dotenv.config();

const MONGO_URI = process.env.DB_URI;

const notification = new Notification();

// ---------- helpers ----------
const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const mapTxToNotificationType = (txType) => {
  switch (txType) {
    case TRANSACTION_TYPES.IN:
      return NOTIFICATION_TYPES.STOCK_IN;
    case TRANSACTION_TYPES.OUT:
      return NOTIFICATION_TYPES.PENDING_SHIPMENT;
    case TRANSACTION_TYPES.TRANSFER:
      return NOTIFICATION_TYPES.STOCK_TRANSFER;
    case TRANSACTION_TYPES.ADJUSTMENT:
      return NOTIFICATION_TYPES.STOCK_ADJUSTMENT;
    default:
      return null;
  }
};

// ---------- date range ----------
const monthArg = process.argv[2]; // e.g. 2025-01
const startDate = monthArg
  ? new Date(`${monthArg}-01`)
  : new Date(new Date().getFullYear(), new Date().getMonth(), 1);

const endDate = new Date(startDate);
endDate.setMonth(endDate.getMonth() + 1);
endDate.setDate(0);

async function seedMonthlyTransactions() {
  await mongoose.connect(MONGO_URI);
  console.log(' MongoDB connected');

  const products = await Product.find();
  const users = await User.find();
  const warehouses = await Warehouse.find();

  if (products.length === 0 || users.length === 0 || warehouses.length < 2) {
    throw new Error(' Need at least 1 product, 1 user, and 2 warehouses');
  }

  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const product = randomFrom(products);
      const user = randomFrom(users);
      const quantity = randomInt(1, 15);
      const txType = randomFrom(Object.values(TRANSACTION_TYPES));

      let transaction = {
        type: txType,
        product: product._id,
        quantity,
        performedBy: user._id,
        createdAt: new Date(currentDate),
        updatedAt: new Date(currentDate),
      };

      // ---------- IN ----------
      if (txType === TRANSACTION_TYPES.IN) {
        const warehouse = randomFrom(warehouses);

        await Quantity.updateOne(
          { warehouseId: warehouse._id, productId: product._id },
          { $inc: { quantity }, $setOnInsert: { limit: 10 } },
          { upsert: true, session }
        );

        transaction.supplier = 'Auto Supplier';
        transaction.destinationWarehouse = warehouse._id;
      }

      // ---------- OUT ----------
      if (txType === TRANSACTION_TYPES.OUT) {
        const warehouse = randomFrom(warehouses);

        const stock = await Quantity.findOne({
          warehouseId: warehouse._id,
          productId: product._id,
        });

        if (!stock || stock.quantity < quantity) {
          await session.abortTransaction();
          session.endSession();
          currentDate.setDate(currentDate.getDate() + 1);
          continue;
        }

        await Quantity.updateOne(
          { warehouseId: warehouse._id, productId: product._id },
          { $inc: { quantity: -quantity } },
          { session }
        );

        transaction.sourceWarehouse = warehouse._id;
        transaction.customerName = 'Auto Customer';
        transaction.shipment = SHIPMENT_TYPES.DELIVERED;
      }

      // ---------- TRANSFER ----------
      if (txType === TRANSACTION_TYPES.TRANSFER) {
        const [source, destination] = warehouses
          .sort(() => 0.5 - Math.random())
          .slice(0, 2);

        const stock = await Quantity.findOne({
          warehouseId: source._id,
          productId: product._id,
        });

        if (!stock || stock.quantity < quantity) {
          await session.abortTransaction();
          session.endSession();
          currentDate.setDate(currentDate.getDate() + 1);
          continue;
        }

        await Quantity.updateOne(
          { warehouseId: source._id, productId: product._id },
          { $inc: { quantity: -quantity } },
          { session }
        );

        await Quantity.updateOne(
          { warehouseId: destination._id, productId: product._id },
          { $inc: { quantity }, $setOnInsert: { limit: 10 } },
          { upsert: true, session }
        );

        transaction.sourceWarehouse = source._id;
        transaction.destinationWarehouse = destination._id;
      }

      // ---------- ADJUSTMENT ----------
      if (txType === TRANSACTION_TYPES.ADJUSTMENT) {
        const warehouse = randomFrom(warehouses);

        const stock = await Quantity.findOne({
          warehouseId: warehouse._id,
          productId: product._id,
        });

        if (!stock || stock.quantity < quantity) {
          await session.abortTransaction();
          session.endSession();
          currentDate.setDate(currentDate.getDate() + 1);
          continue;
        }

        await Quantity.updateOne(
          { warehouseId: warehouse._id, productId: product._id },
          { $inc: { quantity: -quantity } },
          { session }
        );

        transaction.destinationWarehouse = warehouse._id;
        transaction.reason = 'Monthly audit adjustment';
      }

      const [createdTransaction] = await Transaction.create([transaction], {
        session,
      });

      await session.commitTransaction();
      const notificationType = mapTxToNotificationType(txType);

      if (notificationType) {
        const warehouseId =
          createdTransaction.destinationWarehouse ||
          createdTransaction.sourceWarehouse;

        await notification.notifyTransaction(
          createdTransaction.product,
          warehouseId,
          createdTransaction._id,
          createdTransaction.quantity,
          notificationType,
          createdTransaction.performedBy
        );
      }

      console.log(` ${txType} | ${currentDate.toDateString()}`);
    } catch (err) {
      await session.abortTransaction();
      console.error(' Error:', err.message);
    } finally {
      session.endSession();
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  console.log(' Monthly seeding completed');
  process.exit(0);
}

seedMonthlyTransactions().catch((err) => {
  console.error(err);
  process.exit(1);
});
