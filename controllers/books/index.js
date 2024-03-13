import { Op } from 'sequelize';
import { validationResult } from 'express-validator';
import Book from '../../models/book.js';
import {
  extractErrorsArray
} from '../../utils/helpers.js';
import Borrowings from '../borrowings/index.js';
import Borrowing from '../../models/borrowing.js';

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

    const book = await Book.update(req.body, {
      where: {
        id: req.params.id
      }
    });

    return res.status(200).json(book);
  } catch (error) {
    next(error.message);
  }
};

const deleteBook = async (
  req,
  res,
  next
) => {
  try {
    const book = await Book.destroy({
      where: {
        id: req.params.id
      }
    });

    if (!book) {
      return res.status(404).json({
        message: 'Book not found'
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
