import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

let dbLink = '';

if (process.env.NODE_ENV === 'test') {
  dbLink = process.env.DB_URL_TEST;
} else {
  dbLink = process.env.DB_URL;
}

const sequelize = new Sequelize(
  dbLink,
  {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
      ssl: {
        require: false,
        rejectUnauthorized: false
      }
    }
  }
);

export default sequelize;
