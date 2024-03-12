import Sequelize from 'sequelize';
import sequelize from '../utils/db.js';

const shelfSchema = {
  name: {
    type: Sequelize.STRING,
    allowNull: false
  }
};

const Shelves = sequelize.define('shelf', shelfSchema);

export { Shelves };
export default Shelves;
