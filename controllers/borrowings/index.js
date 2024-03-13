import { validationResult } from 'express-validator';
import { extractErrorsArray } from '../../utils/helpers.js';
import BorrowingModel from '../../models/borrowing.js';
import Borrowers from '../../models/borrowers.js';
import Books from '../../models/book.js';
import { Op } from 'sequelize';
import sequelize from '../../utils/db.js';

const borrowABook = async (req, res, next) => {
  try {
    const validation = validationResult(req);

    if (!validation.isEmpty()) {
      return res.status(422).json(extractErrorsArray(validation.array()));
    }

    // Check for borrower
    const existingBorrower = await Borrowers.findOne({
      where: {
        id: req.body.borrowerId
      }
    });

    if (!existingBorrower) {
      return res.status(404).json({
        message: 'Borrower not found'
      });
    }

    // Check for book
    const existingBook = await Books.findOne({
      where: {
        id: req.body.bookId
      }
    });

    if (!existingBook) {
      return res.status(404).json({
        message: 'Book not found'
      });
    }

    // Check if book is available
    if (existingBook.quantity === 0) {
      return res.status(422).json({
        message: 'Book is not available'
      });
    }

    // Check if there are allowed quantity
    const borrowedBookQuantity = await BorrowingModel.findAll({
      where: {
        bookId: req.body.bookId
      }
    });

    if (borrowedBookQuantity.length === existingBook.quantity) {
      return res.status(400).json({
        message: 'Book is not available'
      });
    }

    const borrow = await BorrowingModel.create(req.body);

    return res.status(201).json(borrow);
  } catch (error) {
    next(error.message);
  }
};

const getAllBorrowings = async (req, res, next) => {
  try {
    const borrowings = await BorrowingModel.findAll({
      include: [{
        model: Borrowers,
        as: 'borrower',
        attributes: ['id', 'name'],
        on: {
          id: {
            [Op.eq]: sequelize.col('borrowing.borrowerId')
          }
        }
      }, {
        model: Books,
        as: 'book',
        attributes: ['id', 'title'],
        on: {
          id: {
            [Op.eq]: sequelize.col('borrowing.bookId')
          }
        }
      }]
    });

    if (borrowings.length === 0) {
      return res.status(404).json({
        message: 'No borrowings are in the DB yet'
      });
    }

    return res.status(200).json(borrowings);
  } catch (error) {
    next(error.message);
  }
};

const returnABook = async (req, res, next) => {
  try {
    const borrowId = parseInt(req.params.id);

    if (typeof borrowId !== 'number') {
      return res.status(400).json({
        message: 'Please provide a valid id'
      });
    }

    const borrowActionExists = await BorrowingModel.findOne({
      where: {
        id: borrowId
      }
    });

    if (!borrowActionExists) {
      return res.status(404).json({
        message: 'Borrowing not found'
      });
    }

    const borrow = await BorrowingModel.destroy({
      where: {
        id: borrowId
      }
    });

    return res.status(200).json({
      message: 'Book returned successfully'
    });
  } catch (error) {
    next(error.message);
  }
};

const getOverdueBooks = async (req, res, next) => {
  try {
    const borrowings = await BorrowingModel.findAll({
      where: {
        borrowTo: {
          [Op.lt]: new Date()
        }
      },
      include: [{
        model: Borrowers,
        as: 'borrower',
        attributes: ['id', 'name'],
        on: {
          id: {
            [Op.eq]: sequelize.col('borrowing.borrowerId')
          }
        }
      }, {
        model: Books,
        as: 'book',
        attributes: ['id', 'title'],
        on: {
          id: {
            [Op.eq]: sequelize.col('borrowing.bookId')
          }
        }
      }]
    });

    if (borrowings.length === 0) {
      return res.status(404).json({
        message: 'No books are overdue'
      });
    }

    return res.status(200).json(borrowings);
  } catch (error) {
    next(error.message);
  }
};

export default {
  borrowABook,
  getAllBorrowings,
  returnABook,
  getOverdueBooks
};
