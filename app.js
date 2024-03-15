import express from 'express';
import helmet from 'helmet';
import dotenv from 'dotenv';

import allRoutes from './routes/index.js';
import './utils/associations.js';
import { initDB } from './utils/db.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(helmet());

app.use('/api', allRoutes);

const server = app.listen(process.env.PORT, async () => {
  try {
    await initDB();
    app.listen(process.env.PORT, () => {
      console.log(`app listening at http://localhost:${process.env.PORT}`);
    });
  } catch (e) {
    console.error(e);
  }
});

export default server;
