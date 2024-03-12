import Book from '../models/book.js';
import Borrowers from '../models/borrowers.js';
import Borrowing from '../models/borrowing.js';
import Shelf from '../models/shelf.js';

/**
 * Relation Between Books and Borrowers
 */

Borrowing.hasOne(Borrowers, {
  constraints: false
});

Borrowing.hasOne(Book, {
  constraints: false
});

Shelf.hasMany(Borrowing, {
  constraints: false
});
