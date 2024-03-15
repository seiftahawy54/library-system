import { Router } from 'express';
import { body, query } from 'express-validator';

import BorrowersController from '../controllers/borrowers/index.js';

const router = Router();

const borrowerValidation = [
  body('name')
    .isString()
    .isLength({ min: 3 })
    .withMessage('name must be at least 3 characters long'),
  body('email')
    .isEmail()
    .withMessage('email must be a valid email address')
];

router.get('/',
  BorrowersController
    .getAllBorrowers
);

router.post('/',
  ...borrowerValidation,
  BorrowersController.createBorrower
);

router.put('/:id',
  ...borrowerValidation,
  BorrowersController.updateBorrower
);

router.delete('/:id', BorrowersController.deleteBorrower);

router.get('/borrowed/:userId',
  query('name').isString().isLength({ min: 3 }).withMessage('name must be at least 3 characters long').optional(),
  query('email').isEmail().withMessage('email must be a valid email address').optional(),
  BorrowersController.getBorrowedBooks);

export default router;
