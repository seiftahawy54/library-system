import { Router } from 'express';
import BooksRoutes from './books.js';
import generalRoutes from './generalRoutes.js';

const allRoutes = Router();

allRoutes.use('/books', BooksRoutes);
allRoutes.use(generalRoutes);

export default allRoutes;
