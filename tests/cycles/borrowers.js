import Borrowers from '../../models/borrowers.js';

const createBorrower = async (borrowerName, borrowerEmail) => {
  return await Borrowers.create({
    name: borrowerName,
    email: borrowerEmail
  });
};

export default createBorrower;
