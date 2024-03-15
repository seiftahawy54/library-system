import Sequelize from 'sequelize';
import sequelize from '../utils/db.js';

const bookSchema = {
  title: {
    type: Sequelize.STRING,
    allowNull: false
  },
  author: {
    type: Sequelize.STRING
  },
  isbn: {
    type: Sequelize.STRING
  },
  quantity: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  shelfLocation: {
    type: Sequelize.STRING,
    defaultValue: 'Storage Room'
  }
};

const Books = sequelize.define('book', bookSchema);

export default Books;
