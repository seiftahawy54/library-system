import { Router } from 'express';
import BooksRoutes from './books.js';
import BorrowersRoutes from './borrowers.js';
import BorrowingRoutes from './borrowing.js';

import generalRoutes from './generalRoutes.js';

const allRoutes = Router();

allRoutes.use('/books', BooksRoutes);
allRoutes.use('/borrowers', BorrowersRoutes);
allRoutes.use('/borrowing', BorrowingRoutes);
allRoutes.use(generalRoutes);

export default allRoutes;
