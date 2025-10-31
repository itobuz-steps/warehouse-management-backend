import express from 'express';
import cors from 'cors';
import config from './config/config.js';
import connectDatabase from './config/dbConfig.js';
import authRoutes from './routes/authRoutes.js';
import errorHandler from './error/errorHandler.js';

const app = express();

app.use(cors);
app.use(express.json());

const port = config.PORT;

connectDatabase();

app.get('/', (req, res) => {
  res.send('Hello');
});

app.use('/user/auth', authRoutes);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server Listening on PORT : ${port}`);
});
