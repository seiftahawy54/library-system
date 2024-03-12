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
  }
};

const Borrowing = sequelize.define('borrowing', borrowingSchema);

export { Borrowing };
export default Borrowing;
