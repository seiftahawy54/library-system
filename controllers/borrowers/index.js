import { Op } from 'sequelize';
import { validationResult } from 'express-validator';

import BorrowersModel from '../../models/borrowers.js';
import Books from '../../models/book.js';
import Borrowing from '../../models/borrowing.js';

import { extractErrorsArray } from '../../utils/helpers.js';
import sequelize from '../../utils/db.js';

/**
 * @api {get} /borrowers Get all borrowers
 * @apiName GetAllBorrowers
 * @apiGroup Borrowers
 *
 * @apiSuccess {Object[]} Borrowers Array of borrower objects.
 * @apiSuccess {Number} Borrowers.id Borrower ID.
 * @apiSuccess {String} Borrowers.name Borrower's name.
 * @apiSuccess {String} Borrowers.email Borrower's email.
 *
 * @apiError (404) NoBorrowersFound No borrowers were found in the database.
 */
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

/**
 * @api {POST} /borrowers Create a new borrower
 * @apiName CreateBorrower
 * @apiGroup Borrowers
 *
 * @apiParam {String} name Borrower's name (required).
 * @apiParam {String} email Borrower's email (required and unique).
 *
 * @apiSuccess (201) {Object} newBorrower Created borrower object.
 * @apiSuccess (201) {Number} newBorrower.id Borrower's ID.
 * @apiSuccess (201) {String} newBorrower.name Borrower's name.
 * @apiSuccess (201) {String} newBorrower.email Borrower's email.
 *
 * @apiError (422) ValidationError Input data failed validation.
 * @apiError (422) EmailNotUnique A borrower with the provided email already exists.
 */
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

/**
 * @api {PUT} /borrowers/:id Update an existing borrower
 * @apiName UpdateBorrower
 * @apiGroup Borrowers
 *
 * @apiParam {Number} id Borrower's ID (required, in URL path).
 * @apiParam {String} name (Optional) Borrower's name.
 * @apiParam {String} email  (Optional) Borrower's email.
 *
 * @apiSuccess (200) {Number} 1  Indicates the borrower was successfully updated.
 *
 * @apiError (404) BorrowerNotFound The borrower with the specified ID was not found.
 * @apiError (422) ValidationError Input data failed validation.
 */

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

/**
 * @api {DELETE} /borrowers/:id Delete a borrower
 * @apiName DeleteBorrower
 * @apiGroup Borrowers
 *
 * @apiParam {Number} id Borrower's ID (required, in URL path).
 *
 * @apiSuccess (200) {Object} message Confirmation message.
 * @apiSuccess (200) {String} message.message  "A borrower [name] with email [email] deleted successfully"
 *
 * @apiError (400) BorrowerHasBorrowedBooks Cannot delete a borrower who has borrowed books.
 * @apiError (404) BorrowerNotFound The borrower with the specified ID was not found.
 */
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

/**
 * @api {get} /users/:userId/borrowed-books Get books borrowed by a user
 * @apiName GetBorrowedBooks
 * @apiGroup Users
 *
 * @apiParam {Number} userId User's ID (required, in URL path).
 * @apiParam {String} name (Optional) User's name (partial match).
 * @apiParam {String} email (Optional) User's email (partial match).
 *
 * @apiSuccess {Object} borrowedBooks Borrower object with nested borrowings data.
 * @apiSuccess {Number} borrowedBooks.id Borrower's ID.
 * @apiSuccess {String} borrowedBooks.name Borrower's name.
 * @apiSuccess {String} borrowedBooks.email Borrower's email.
 * @apiSuccess {Object[]} borrowedBooks.borrowings Array of borrowing records.
 * @apiSuccess {Number} borrowedBooks.borrowings.id Borrowing record ID.
 * @apiSuccess {Object} borrowedBooks.borrowings.book Book details.
 * @apiSuccess {Number} borrowedBooks.borrowings.book.id Book ID.
 * @apiSuccess {String} borrowedBooks.borrowings.book.title Book title.
 * @apiSuccess {String} borrowedBooks.borrowings.book.author Book author.
 * @apiSuccess {String} borrowedBooks.borrowings.book.isbn Book ISBN.
 *
 * @apiError (404) UserNotFound User with the specified ID or search criteria was not found.
 * @apiError (404) UserHasNoBorrowings  The user has not borrowed any books.
 * @apiError (422) ValidationError Input data failed validation.
 * @apiError (422) InvalidUserId User ID must be a number.
 */
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
