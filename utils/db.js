import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

let dbLink = '';
let sslOption = {};

if (process.env.NODE_ENV === 'test') {
  dbLink = process.env.DB_URL_TEST;
} else {
  dbLink = process.env.DB_URL;
}

if (process.env.NODE_ENV !== 'production') {
  sslOption = {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  };
} else {
  sslOption = {
    ssl: {
      require: false,
      rejectUnauthorized: false
    }
  };
}

const sequelize = new Sequelize(
  dbLink,
  {
    dialect: 'postgres',
    protocol: 'postgres',
    logging: process.env.NODE_ENV !== 'test',
    dialectOptions: {
      ...sslOption
    }
  }
);

const initDB = async () => {
  await sequelize.authenticate();

  await sequelize.sync({
    force: false,
    alter: true
  });
};

export {
  initDB
};
export default sequelize;
