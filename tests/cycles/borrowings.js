import Borrowing from '../../models/borrowing.js';

const borrowing = async (
  bookId,
  borrowerId,
  borrowFrom,
  borrowTo
) => {
  return await Borrowing.create({
    bookId,
    borrowerId,
    borrowFrom,
    borrowTo
  });
};

export default borrowing;
