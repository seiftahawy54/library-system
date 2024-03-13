import Sequelize from 'sequelize';
import sequelize from '../utils/db.js';

const borrowingSchema = {
  borrowFrom: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW
  },
  borrowTo: {
    type: Sequelize.DATE,
    allowNull: false
  },
  bookId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'books',
      key: 'id'
    }
  },
  borrowerId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'borrowers',
      key: 'id'
    }
  }
};

const Borrowing = sequelize.define('borrowing', borrowingSchema);

export { Borrowing };
export default Borrowing;
