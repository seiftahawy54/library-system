import Sequelize from 'sequelize';
import sequelize from '../utils/db.js';

const borrowersSchema = {
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false
  }
};

const Borrowers = sequelize.define('borrower', borrowersSchema);

export { Borrowers };
export default Borrowers;
