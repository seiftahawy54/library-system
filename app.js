import express from 'express';
import helmet from 'helmet';
import dotenv from 'dotenv';

import allRoutes from './routes/index.js';
import './utils/associations.js';
import db from './utils/db.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

app.use('/api', allRoutes);

app.listen(process.env.PORT, async () => {
  try {
    await db.authenticate();

    const dbOptions = {};

    if (process.env.NODE_ENV === 'test') {
      dbOptions.alter = false;
      dbOptions.force = true;
    } else {
      dbOptions.alter = true;
      dbOptions.force = false;
    }

    await db.sync(dbOptions);

    app.listen(process.env.PORT, () => {
      console.log(` app listening at http://localhost:${process.env.PORT}`);
    });
  } catch (e) {
    console.error(e);
  }
});
