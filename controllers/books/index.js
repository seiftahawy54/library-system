import Book from '../../models/book.js';
import { Op } from 'sequelize';

const getAllBooks = async (
  req,
  res,
  next
) => {
  try {
    const books = await Book.findAll();
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
    const book = await Book.update(req.body, {
      where: {
        id: req.params.id
      }
    });
    return res.status(201).json(book);
  } catch (error) {
    next(error.message);
  }
};

export default {
  getAllBooks,
  getBook,
  createBook,
  updateBook
};
