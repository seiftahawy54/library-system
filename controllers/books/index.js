import { Op } from 'sequelize';
import { validationResult } from 'express-validator';
import Book from '../../models/book.js';
import {
  extractErrorsArray
} from '../../utils/helpers.js';
import Borrowing from '../../models/borrowing.js';

/**
 * @api {GET} /api/books Get all books with availability
 * @apiName GetAllBooks
 * @apiGroup Books
 *
 * @apiSuccess {Object[]} books Array of book objects.
 * @apiSuccess {Number} books.id Book ID.
 * @apiSuccess {String} books.title Book title.
 * @apiSuccess {String} books.author Book author.
 * @apiSuccess {Number} books.isbn Book ISBN.
 * @apiSuccess {Number} books.quantity Book's total quantity.
 * @apiSuccess {Number} books.availableCount Book's available quantity.
 *
 * @apiError (404) NoBooksFound No books were found in the database.
 */

const getAllBooks = async (
  req,
  res,
  next
) => {
  try {
    const books = await Book.findAll();
    if (books.length === 0) {
      return res.status(404).json({
        message: 'No books are in the DB yet'
      });
    }

    // Finding available count in after borrowing
    for (const book of books) {
      const borrowedCount = await Borrowing.findAndCountAll({
        where: {
          bookId: book.id
        }
      });

      book.dataValues.availableCount = book.quantity - borrowedCount.count;
    }

    return res.status(200).json(books);
  } catch (error) {
    next(error.message);
  }
};

/**
 * @api {GET} /api/books Search for books
 * @apiName SearchBooks
 * @apiGroup Books
 *
 * @apiParam {String} title (Optional) Book title (partial match).
 * @apiParam {String} author (Optional) Book author (partial match).
 * @apiParam {String} isbn (Optional) Book ISBN (partial match).
 *
 * @apiSuccess {Object[]} books Array of book objects.
 * @apiSuccess {Number} books.id Book ID.
 * @apiSuccess {String} books.title Book title.
 * @apiSuccess {String} books.author Book author.
 * @apiSuccess {Number} books.isbn Book ISBN.
 * @apiSuccess {Number} books.quantity Book's total quantity.
 *  // Assuming you have a 'quantity' property in your 'Book' model
 *
 * @apiError (404) BookNotFound No books matching the search criteria were found.
 */

const getBook = async (
  req,
  res,
  next
) => {
  try {
    const searchCriteria = req.query;
    const queryBuilder = {};
    const searchFields = ['title', 'author', 'isbn'];

    searchFields.forEach(field => {
      if (searchCriteria[field]) {
        queryBuilder[field] = {
          [Op.iLike]: `%${searchCriteria[field].toLowerCase()}%`
        };
      }
    });

    const book = await Book.findAll({
      where: queryBuilder
    });

    if (book.length === 0) {
      return res.status(404).json({
        message: 'Book not found'
      });
    }

    return res.status(200).json(book);
  } catch (error) {
    next(error.message);
  }
};

/**
 * @api {POST} /api/books Create a new book
 * @apiName CreateBook
 * @apiGroup Books
 *
 * @apiParam {String} title Book title (required).
 * @apiParam {String} author Book author (required).
 * @apiParam {String} isbn Book ISBN (required and unique).
 * @apiParam {Number} quantity Book's initial quantity (required).
 *
 * @apiSuccess (201) {Object} book Created book object.
 * @apiSuccess (201) {Number} book.id Book ID.
 * @apiSuccess (201) {String} book.title Book title.
 * @apiSuccess (201) {String} book.author Book author.
 * @apiSuccess (201) {Number} book.isbn Book ISBN.
 * @apiSuccess (201) {Number} book.quantity Book's quantity.
 *
 * @apiError (422) ValidationError Input data failed validation.
 * @apiError (422) ISBNNotUnique A book with the provided ISBN already exists.
 */
const createBook = async (
  req,
  res,
  next
) => {
  try {
    const validation = validationResult(req);

    if (!validation.isEmpty()) {
      return res.status(422).json(extractErrorsArray(validation.array()));
    }

    // Check if the isbn is unique
    const existingBook = await Book.findOne({
      where: {
        isbn: req.body.isbn
      }
    });

    if (existingBook) {
      return res.status(422).json({
        isbn: 'ISBN must be unique'
      });
    }

    const book = await Book.create(req.body);
    return res.status(201).json(book);
  } catch (error) {
    next(error.message);
  }
};

const updateBook = async (
  req,
  res,
  next
) => {
  try {
    const validation = validationResult(req);

    if (!validation.isEmpty()) {
      return res.status(422).json(extractErrorsArray(validation.array()));
    }

    // Check if the book exists
    const existingBook = await Book.findOne({
      where: {
        id: req.params.id
      }
    });

    if (!existingBook) {
      return res.status(404).json({
        message: 'Book not found'
      });
    }

    const book = await Book.update({
      ...req.body,
      // To prevent updating the id
      id: req.params.id
    }, {
      where: {
        id: req.params.id
      }
    });

    return res.status(200).json(book);
  } catch (error) {
    next(error.message);
  }
};

/**
 * @api {PUT} /books/:id Update an existing book
 * @apiName UpdateBook
 * @apiGroup Books
 *
 * @apiParam {Number} id Book ID (required, in URL path).
 * @apiParam {String} title (Optional) Book title.
 * @apiParam {String} author (Optional) Book author.
 * @apiParam {String} isbn (Optional) Book ISBN.
 * @apiParam {Number} quantity (Optional) Book's quantity.
 *
 * @apiSuccess (200) {Number} 1  Indicates the book was successfully updated.
 *
 * @apiError (404) BookNotFound The book with the specified ID was not found.
 * @apiError (422) ValidationError Input data failed validation.
 */

const deleteBook = async (
  req,
  res,
  next
) => {
  try {
    const book = await Book.findOne({
      where: {
        id: req.params.id
      }
    });

    if (!book) {
      return res.status(404).json({
        message: 'Book not found'
      });
    }

    // Check for borrowed books
    const borrowedBooks = await Borrowing.findAll({
      where: {
        bookId: req.params.id
      }
    });

    if (borrowedBooks.length > 0) {
      return res.status(400).json({
        message: 'Cannot delete a book is borrowed by a customer'
      });
    }

    return res.status(200).json({
      message: 'Book deleted successfully'
    });
  } catch (error) {
    next(error.message);
  }
};

export default {
  getAllBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook
};
