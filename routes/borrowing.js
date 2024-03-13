import { Router } from 'express';
import { body } from 'express-validator';

import BorrowingController from '../controllers/borrowings/index.js';

const borrowingActionsValidations = [
  body('borrowFrom')
    .isISO8601()
    .withMessage('borrowFrom must be a date'),
  body('borrowTo')
    .isISO8601()
    .withMessage('borrowTo must be a date'),
  body('bookId')
    .isNumeric()
    .withMessage('bookId must be a number'),
  body('borrowerId')
    .isNumeric()
    .withMessage('borrowerId must be a number')
];

const router = Router();

router.post('/',
  ...borrowingActionsValidations,
  BorrowingController.borrowABook
);

router.get('/',
  BorrowingController.getAllBorrowings
);

router.delete('/:id',
  BorrowingController.returnABook
);

router.get('/overdue',
  BorrowingController.getOverdueBooks
);

export default router;
