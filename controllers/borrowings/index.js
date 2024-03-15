import { validationResult } from 'express-validator';
import { extractErrorsArray } from '../../utils/helpers.js';
import BorrowingModel from '../../models/borrowing.js';
import Borrowers from '../../models/borrowers.js';
import Books from '../../models/book.js';
import { Op } from 'sequelize';
import sequelize from '../../utils/db.js';
import moment from 'moment';
import createExcelFile from '../../utils/createExcelFile.js';

/**
 * @api {POST} /borrowings Borrow a book
 * @apiName BorrowBook
 * @apiGroup Borrowings
 *
 * @apiParam {Number} bookId ID of the book to borrow (required).
 * @apiParam {Number} borrowerId ID of the borrower (required).
 *
 * @apiSuccess (201) {Object} borrow Created borrowing record.
 * @apiSuccess (201) {Number} borrow.id Borrowing record ID.
 * @apiSuccess (201) {Number} borrow.bookId ID of the borrowed book.
 * @apiSuccess (201) {Number} borrow.borrowerId ID of the borrower.
 * ... (other potential Borrowing model properties)
 *
 * @apiError (400) BookNotAvailable The book is currently unavailable.
 * @apiError (404) BookNotFound The specified book was not found.
 * @apiError (404) BorrowerNotFound The specified borrower was not found.
 * @apiError (422) ValidationError Input data failed validation.
 */
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

/**
 * @api {GET} /borrowings Get all borrowings
 * @apiName GetAllBorrowings
 * @apiGroup Borrowings
 *
 * @apiSuccess {Object[]} borrowings Array of borrowing records.
 * @apiSuccess {Number} borrowings.BorrowNumber Borrowing record ID.
 * @apiSuccess {Date} borrowings.borrowFrom Borrowing start date.
 * @apiSuccess {Date} borrowings.borrowTo Borrowing end/due date.
 * @apiSuccess {Object} borrowings.borrower Borrower details.
 * @apiSuccess {Number} borrowings.borrower.id Borrower's ID.
 * @apiSuccess {String} borrowings.borrower.name Borrower's name.
 * @apiSuccess {String} borrowings.borrower.email Borrower's email.
 * @apiSuccess {Object} borrowings.book Book details.
 * @apiSuccess {Number} borrowings.book.id Book ID.
 * @apiSuccess {String} borrowings.book.title Book title.
 * @apiSuccess {String} borrowings.book.author Book author.
 *
 * @apiError (404) NoBorrowingsFound No borrowings were found in the database.
 */
const getAllBorrowings = async (req, res, next) => {
  try {
    const borrowings = await BorrowingModel.findAll({
      attributes: [['id', 'BorrowNumber'], 'borrowFrom', 'borrowTo'],
      include: [{
        model: Borrowers,
        as: 'borrower',
        attributes: ['id', 'name', 'email'],
        on: {
          id: {
            [Op.eq]: sequelize.col('borrowing.borrowerId')
          }
        }
      }, {
        model: Books,
        as: 'book',
        attributes: ['id', 'title', 'author'],
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

/**
 * @api {DELETE} /borrowings/:id Return a borrowed book
 * @apiName ReturnBook
 * @apiGroup Borrowings
 *
 * @apiParam {Number} id Borrowing record ID (required, in URL path).
 *
 * @apiSuccess (200) {String} message  "Book returned successfully"
 *
 * @apiError (400) InvalidBorrowingId The provided borrow ID is not a valid number.
 * @apiError (404) BorrowingNotFound The borrowing record with the specified ID was not found.
 */
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

/**
 * @api {GET} /borrowings/overdue Get overdue books
 * @apiName GetOverdueBooks
 * @apiGroup Borrowings
 *
 * @apiSuccess {Object[]} borrowings Array of overdue borrowing records.
 * @apiSuccess {Number} borrowings.id Borrowing record ID.
 * @apiSuccess {Date} borrowings.borrowFrom Borrowing start date.
 * @apiSuccess {Date} borrowings.borrowTo Borrowing due date.
 * @apiSuccess {Object} borrowings.borrower Borrower details.
 * @apiSuccess {Number} borrowings.borrower.id Borrower's ID.
 * @apiSuccess {String} borrowings.borrower.name Borrower's name.
 * @apiSuccess {Object} borrowings.book Book details.
 * @apiSuccess {Number} borrowings.book.id Book ID.
 * @apiSuccess {String} borrowings.book.title Book title.
 *
 * @apiError (404) NoOverdueBooksFound No overdue books were found.
 */
const getOverdueBooks = async (req, res, next) => {
  try {
    const borrowings = await BorrowingModel.findAll({
      where: {
        borrowTo: {
          [Op.lt]: moment().subtract('1', 'month').toISOString()
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

/**
 * @api {GET} /analytics Get borrowing analytics
 * @apiName GetAnalytics
 * @apiGroup Analytics
 *
 * @apiParam {String} startDate Start date for analytics (required, format: YYYY-MM-DD).
 * @apiParam {String} endDate End date for analytics (required, format: YYYY-MM-DD).
 * @apiParam {String} exportData (Optional) If 'true', generate an analytics file ('false' by default).
 *
 * @apiSuccess (200) {Object[]} borrowings Array of borrowing records within the date range.
 * @apiSuccess (200) {Number} borrowings.id Borrowing record ID.
 * @apiSuccess (200) {Date} borrowings.borrowFrom Borrowing start date.
 * @apiSuccess (200) {Date} borrowings.borrowTo Borrowing end/due date.
 * @apiSuccess (200) {Object} borrowings.borrower Borrower details.
 * @apiSuccess (200) {Object} borrowings.book Book details.
 * @apiSuccess (200) {String} fileLink Download link for the generated analytics file (if exportData is 'true')
 *
 * @apiError (422) ValidationError Input data failed validation.
 */
const getAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate, exportData } = req.query;
    const validation = validationResult(req);

    if (!validation.isEmpty()) {
      return res.status(422).json(extractErrorsArray(validation.array()));
    }

    const borrowings = await BorrowingModel.findAll({
      where: {
        borrowFrom: {
          [Op.gte]: new Date(startDate)
        },
        borrowTo: {
          [Op.lte]: new Date(endDate)
        }
      },
      include: [{
        model: Borrowers,
        as: 'borrower',
        attributes: ['id', 'name', 'email'],
        on: {
          id: {
            [Op.eq]: sequelize.col('borrowing.borrowerId')
          }
        }
      }, {
        model: Books,
        as: 'book',
        attributes: ['id', 'title', 'isbn'],
        on: {
          id: {
            [Op.eq]: sequelize.col('borrowing.bookId')
          }
        }
      }]
    });

    if (exportData === 'true') {
      return res.status(200).json({
        borrowings,
        fileLink: `${process.env.BACKEND_HOST}/borrowing/export?startDate=${startDate}&endDate=${endDate}`
      });
    }

    return res.status(200).json({
      borrowings
    });
  } catch (error) {
    next(error.message);
  }
};

/**
 * @api {put} /borrowings/:id Update a borrowing's status
 * @apiName UpdateBorrowStatus
 * @apiGroup Borrowings
 *
 * @apiParam {Number} id Borrowing record ID (required, in URL path).
 * @apiParam {String} status (Optional) Updated status of the borrowing.
 *
 * @apiSuccess (200) {String} message "Book [title] status for borrowing updated successfully"
 *
 * @apiError (400) InvalidBorrowingId The provided borrow ID is not a valid number.
 * @apiError (404) BorrowingNotFound The borrowing record with the specified ID was not found.
 * @apiError (422) ValidationError Input data failed validation.
 */

const updateBorrowStatus = async (req, res, next) => {
  try {
    const borrowId = parseInt(req.params.id);
    const validation = validationResult(req);

    if (isNaN(borrowId)) {
      return res.status(400).json({
        message: 'Please provide a valid id'
      });
    }

    if (!validation.isEmpty()) {
      return res.status(422).json(extractErrorsArray(validation.array()));
    }

    const borrowActionExists = await BorrowingModel.findOne({
      where: {
        id: borrowId
      },
      include: [{
        model: Borrowers,
        as: 'borrower',
        attributes: ['id', 'name', 'email'],
        on: {
          id: {
            [Op.eq]: sequelize.col('borrowing.borrowerId')
          }
        }
      }, {
        model: Books,
        as: 'book',
        attributes: ['id', 'title', 'isbn'],
        on: {
          id: {
            [Op.eq]: sequelize.col('borrowing.bookId')
          }
        }
      }]
    });

    if (!borrowActionExists) {
      return res.status(404).json({
        message: 'Borrowing not found'
      });
    }

    const borrow = await BorrowingModel.update(req.body, {
      where: {
        id: borrowId
      }
    });

    return res.status(200).json({
      message: `${borrowActionExists.book.title} status for borrowing updated successfully`
    });
  } catch (error) {
    next(error.message);
  }
};

/**
 * @api {GET} /borrowing/export Export borrowing data as Excel
 * @apiName ExportBorrowingData
 * @apiGroup Exports
 *
 * @apiParam {String} startDate Start date for export (required, format: YYYY-MM-DD).
 * @apiParam {String} endDate End date for export (required, format: YYYY-MM-DD).
 *
 * @apiSuccess (200) File Download Initiates a download of the generated Excel file.
 *
 * @apiError (422) ValidationError Input data failed validation.
 */
const exportData = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const validation = validationResult(req);

    if (!validation.isEmpty()) {
      return res.status(422).json(extractErrorsArray(validation.array()));
    }

    const borrowings = await BorrowingModel.findAll({
      where: {
        borrowFrom: {
          [Op.gte]: new Date(startDate)
        },
        borrowTo: {
          [Op.lte]: new Date(endDate)
        }
      },
      include: [{
        model: Borrowers,
        as: 'borrower',
        attributes: ['id', 'name', 'email'],
        on: {
          id: {
            [Op.eq]: sequelize.col('borrowing.borrowerId')
          }
        }
      }, {
        model: Books,
        as: 'book',
        attributes: ['id', 'title', 'isbn'],
        on: {
          id: {
            [Op.eq]: sequelize.col('borrowing.bookId')
          }
        }
      }]
    });

    const dataToExport = borrowings.map((borrow, index) => (
      [
        index + 1,
        borrow.book.title,
        borrow.borrower.name,
        borrow.borrower.email,
        moment(borrow.borrowFrom).format('YYYY-MM-DD'),
        moment(borrow.borrowTo).format('YYYY-MM-DD')
      ]
    ));

    const createdFilePath = await createExcelFile(
      `${moment(startDate).format('YYYY-MM-DD')}_${moment(endDate).format('YYYY-MM-DD')}`,
      ['#', 'Book Title', 'Borrower Name', 'Borrower Email', 'Borrow From', 'Borrow To'],
      dataToExport
    );

    return res.download(createdFilePath);
  } catch (error) {
    next(error.message);
  }
};

export default {
  borrowABook,
  getAllBorrowings,
  returnABook,
  getOverdueBooks,
  getAnalytics,
  updateBorrowStatus,
  exportData
};
