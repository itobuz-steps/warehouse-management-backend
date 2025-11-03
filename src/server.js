import express from 'express';
import cors from 'cors';
import config from './config/config.js';
import connectDatabase from './config/dbConfig.js';
import authRoutes from './routes/authRoutes.js';
import errorHandler from './error/errorHandler.js';
import adminRoutes from './routes/adminRoutes.js';
import loggerMiddleware from './validations/middlewares/loggerMiddleware.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(loggerMiddleware);

const port = config.PORT;

connectDatabase();

app.use('/user/auth', authRoutes);
app.use('/user/admin/', adminRoutes);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server Listening on PORT : ${port}`);
});
