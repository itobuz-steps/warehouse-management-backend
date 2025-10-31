import express from 'express';
import cors from 'cors';
import config from './config/config.js';
import connectDatabase from './config/dbConfig.js';

const app = express();

app.use(cors);
app.use(express.json());

const port = config.PORT;

connectDatabase();

app.listen(port, () => {
  console.log(`Server Listening on PORT : ${port}`);
});
