import express from 'express';
import cors from 'cors';
import http from 'http';
import config from './config/config.js';
import connectDatabase from './config/dbConfig.js';
import { initSocket } from './socket.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import quantityRoutes from './routes/quantityRoutes.js';
import errorHandler from './error/errorHandler.js';
import adminRoutes from './routes/adminRoutes.js';
import warehouseRoutes from './routes/warehouseRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import loggerMiddleware from './validations/middlewares/loggerMiddleware.js';
import transactionRoutes from './routes/transactionRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import verifyToken from './validations/middlewares/verifyToken.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(loggerMiddleware);
app.use('/uploads', express.static('uploads'));

const port = config.PORT;

connectDatabase();

const server = http.createServer(app);

// Init WebSocket
initSocket(server);

app.use('/user/auth', authRoutes);
app.use('/user/admin/', verifyToken, adminRoutes);
app.use('/warehouse', verifyToken, warehouseRoutes);
app.use('/product', verifyToken, productRoutes);
app.use('/quantity', verifyToken, quantityRoutes);
app.use('/transaction', verifyToken, transactionRoutes);
app.use('/profile', verifyToken, profileRoutes);
app.use('/notifications', verifyToken, notificationRoutes);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server Listening on PORT : ${port}`);
});
