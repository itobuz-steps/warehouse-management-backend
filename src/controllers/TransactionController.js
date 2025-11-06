import Transaction from '../models/transactionModel.js';
import tokenValidator from '../utils/verifyToken.js';
import Product from '../models/productModel.js';
import Warehouse from '../models/warehouseModel.js';
import Quantity from '../models/quantityModel.js';
import mongoose from 'mongoose';

export default class TransactionController {
  getTransactions = async (req, res, next) => {
    try {
      const transactions = await Transaction.find().populate(
        'product performedBy'
      );

      res.json(transactions);
    } catch (error) {
      next(error);
    }
  };

  createStockIn = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const bearer_token = req.headers.authorization;
      const access_token = bearer_token.split(' ')[1];
      const { products, supplier, notes, destinationWarehouse } = req.body;

      const userId = await tokenValidator(access_token);
      // console.log(userId._id.toString());

      const warehouse = await Warehouse.findOne({ name: destinationWarehouse });

      if (!warehouse) {
        return res
          .status(400)
          .json({ message: 'Destination warehouse not found' });
      }

      const transactions = [];

      for (const item of products) {
        const { name, quantity } = item;

        const product = await Product.findOne({ name });

        if (!product) {
          await session.abortTransaction();
          return res.status(400).json({ message: `Product ${name} not found` });
        }

        let quantityRecord = await Quantity.findOne({
          warehouseId: warehouse._id,
          productId: product._id,
        });

        if (quantityRecord) {
          quantityRecord.quantity += quantity;
        } else {
          quantityRecord = new Quantity({
            warehouseId: warehouse._id,
            productId: product._id,
            quantity,
          });
        }

        await quantityRecord.save({ session });

        const transaction = new Transaction({
          type: 'IN',
          product: product._id,
          quantity,
          supplier,
          destinationWarehouse: warehouse._id,
          notes,
          performedBy: userId._id,
        });

        const createdTransaction = await transaction.save({ session });
        transactions.push(createdTransaction);
      }

      await session.commitTransaction();
      session.endSession();

      res.status(201).json({
        message: 'Stock-in transactions created successfully',
        transactions,
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      next(error);
    }
  };

  createStockOut = async (req, res, next) => {
    try {
      const bearer_token = req.headers.authorization;
      const access_token = bearer_token.split(' ')[1];
      const { product, quantity, customer, orderNumber, notes } = req.body;

      const userId = await tokenValidator(access_token);
      console.log(userId._id.toString());

      let productId = product;

      if (!mongoose.Types.ObjectId.isValid(product)) {
        const foundProduct = await Product.findOne({ name: product });

        foundProduct.quantity -= quantity;
        await foundProduct.save();

        if (!foundProduct) {
          return res.status(400).json({ message: 'Product not found' });
        }
        
        productId = foundProduct._id;
      }

      const transaction = new Transaction({
        type: 'OUT',
        product: productId,
        quantity,
        customer,
        orderNumber,
        notes,
        performedBy: userId._id,
      });

      const createdTransaction = await transaction.save();
      res.status(201).json(createdTransaction);
    } catch (error) {
      next(error);
    }
  };
}
