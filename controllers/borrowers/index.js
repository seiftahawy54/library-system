import { Op } from 'sequelize';
import { validationResult } from 'express-validator';

import BorrowersModel from '../../models/borrowers.js';
import { Books } from '../../models/book.js';
import { Borrowing } from '../../models/borrowing.js';

import { extractErrorsArray } from '../../utils/helpers.js';
import sequelize from '../../utils/db.js';

const getAllBorrowers = async (req, res, next) => {
  try {
    const Borrowers = await BorrowersModel.findAll();

    if (Borrowers.length === 0) {
      return res.status(404).json({
        message: 'No Borrowers are in the DB yet'
      });
    }

    return res.status(200).json(Borrowers);
  } catch (error) {
    next(error.message);
  }
};

const createBorrower = async (req, res, next) => {
  try {
    const validation = validationResult(req);

    if (!validation.isEmpty()) {
      return res.status(422).json(extractErrorsArray(validation.array()));
    }

    // Check if the email is unique
    const existingBorrower = await BorrowersModel.findOne({
      where: {
        email: {
          [Op.iLike]: `%${req.body.email}%`
        }
      }
    });

    if (existingBorrower) {
      return res.status(422).json({
        email: 'Email must be unique'
      });
    }

    const newBorrower = await BorrowersModel.create(req.body);
    return res.status(201).json(newBorrower);
  } catch (error) {
    next(error.message);
  }
};

const updateBorrower = async (req, res, next) => {
  try {
    const validation = validationResult(req);

    if (!validation.isEmpty()) {
      return res.status(422).json(extractErrorsArray(validation.array()));
    }

    const existingBorrower = await BorrowersModel.findOne({
      where: {
        id: req.params.id
      }
    });

    if (!existingBorrower) {
      return res.status(404).json({
        message: 'Borrower not found'
      });
    }

    const borrower = await BorrowersModel.update(req.body, {
      where: {
        id: req.params.id
      }
    });

    return res.status(200).json(borrower);
  } catch (error) {
    next(error.message);
  }
};

const deleteBorrower = async (req, res, next) => {
  try {
    const existingBorrower = await BorrowersModel.findOne({
      where: {
        id: req.params.id
      }
    });

    if (!existingBorrower) {
      return res.status(404).json({
        message: 'Borrower not found'
      });
    }

    // Handle where the borrower has borrowed books
    const borrowedBooks = await Borrowing.findAll({
      where: {
        borrowerId: req.params.id
      }
    });

    if (borrowedBooks.length > 0) {
      return res.status(400).json({
        message: 'Cannot delete a borrower with borrowed books'
      });
    }

    const borrower = await BorrowersModel.destroy({
      where: {
        id: req.params.id
      }
    });

    return res.status(200).json({
      message: `A borrower ${existingBorrower.name} with emails ${existingBorrower.email} deleted successfully`
    });
  } catch (error) {
    next(error.message);
  }
};

const getBorrowedBooks = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.userId);
    const searchCriteria = req.query;
    const queryBuilder = {};
    const validation = validationResult(req);

    if (!validation.isEmpty()) {
      return res.status(422).json(extractErrorsArray(validation.array()));
    }

    if (isNaN(userId)) {
      return res.status(422).json({
        message: 'User Id must be a number'
      });
    }

    const searchFields = ['name', 'email'];
    searchFields.forEach(field => {
      if (searchCriteria[field]) {
        queryBuilder[field] = {
          [Op.iLike]: `%${searchCriteria[field].toLowerCase()}%`
        };
      }
    });

    const user = await BorrowersModel.findOne({
      where: {
        [Op.or]: [
          queryBuilder,
          {
            id: userId
          }
        ]
      }
    });

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    const borrowedBooks = await BorrowersModel.findOne({
      where: {
        id: user.id
      },
      include: [
        {
          model: Borrowing,
          on: {
            borrowerId: {
              [Op.eq]: user.id
            }
          },
          include: [
            {
              model: Books,
              on: {
                id: {
                  [Op.eq]: sequelize.col('borrowings.bookId')
                }
              },
              attributes: ['id', 'title', 'author', 'isbn']
            }
          ]
        }
      ]
    });

    if (borrowedBooks.borrowings.length === 0) {
      return res.status(404).json({
        message: 'User haven\'t borrowed books'
      });
    }

    return res.status(200).json(borrowedBooks);
  } catch (error) {
    next(error.message);
  }
};

export default {
  getAllBorrowers,
  createBorrower,
  updateBorrower,
  deleteBorrower,
  getBorrowedBooks
};
