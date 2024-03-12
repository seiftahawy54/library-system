import { Router } from 'express';
import BooksController from '../controllers/books/index.js';
import { body, query } from 'express-validator';

const bookValidation = [
  body('title')
    .isString()
    .isLength({ min: 3 })
    .withMessage('title must be at least 3 characters long'),
  body('author')
    .isString()
    .isLength({ min: 3 })
    .withMessage('author must be at least 3 characters long'),
  body('isbn')
    .isString()
    .isLength({ min: 13, max: 13 })
    .withMessage('ISBN must be a 13 characters long'),
  body('quantity')
    .isNumeric()
    .withMessage('quantity must be a number')
];

const router = Router();

router.get('/', BooksController.getAllBooks);

router.get('/search',
  query('title').isString().optional(),
  query('author').isString().optional(),
  query('isbn').isString().optional(),
  BooksController.getBook);

router.post(
  '/',
  ...bookValidation,
  BooksController.createBook
);

router.put(
  '/:id',
  ...bookValidation,
  BooksController.updateBook
);

export default router;
