import { Router } from 'express';
import { body, query } from 'express-validator';

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

router.get('/analytics',
  query('startDate').isISO8601().withMessage('startDate must be a date'),
  query('endDate').isISO8601().withMessage('endDate must be a date'),
  query('exportData').isBoolean().withMessage('exportData must be a boolean'),
  BorrowingController.getAnalytics
);

router.put('/:id',
  ...borrowingActionsValidations,
  BorrowingController.updateBorrowStatus
);

router.get('/export',
  query('startDate').isISO8601().withMessage('startDate must be a date'),
  query('endDate').isISO8601().withMessage('endDate must be a date'),
  BorrowingController.exportData
);

export default router;
