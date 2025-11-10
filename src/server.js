import express from 'express';
import cors from 'cors';
import config from './config/config.js';
import connectDatabase from './config/dbConfig.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import quantityRoutes from './routes/quantityRoutes.js';
import errorHandler from './error/errorHandler.js';
import adminRoutes from './routes/adminRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import loggerMiddleware from './validations/middlewares/loggerMiddleware.js';
import transactionRoutes from './routes/transactionRoutes.js';
import verifyToken from './validations/middlewares/verifyToken.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(loggerMiddleware);
app.use('/uploads', express.static('uploads'));

const port = config.PORT;

connectDatabase();

app.use('/user/auth', authRoutes);
app.use('/user/admin/', adminRoutes);
app.use('/product', productRoutes);
app.use('/quantity', quantityRoutes);
app.use('/transaction', transactionRoutes);
app.use('/profile',verifyToken, profileRoutes);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server Listening on PORT : ${port}`);
});
