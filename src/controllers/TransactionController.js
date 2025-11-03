import Transaction from '../models/transactionModel.js';
import tokenValidator from '../utils/verifyToken.js';
import Product from '../models/productModel.js';
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
    try {
      const bearer_token = req.headers.authorization;
      const access_token = bearer_token.split(' ')[1];
      const { product, quantity, supplier, notes } = req.body;

      const userId = await tokenValidator(access_token);
      console.log(userId._id.toString());

      let productId = product;

      if (!mongoose.Types.ObjectId.isValid(product)) {
        const foundProduct = await Product.findOne({ name: product });

        foundProduct.quantity += quantity;
        await foundProduct.save();

        if (!foundProduct) {
          return res.status(400).json({ message: 'Product not found' });
        }

        productId = foundProduct._id;
      }

      const transaction = new Transaction({
        type: 'IN',
        product: productId,
        quantity,
        supplier,
        notes,
        performedBy: userId._id,
      });

      const createdTransaction = await transaction.save();
      res.status(201).json(createdTransaction);
    } catch (error) {
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
