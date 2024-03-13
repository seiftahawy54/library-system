import Book from '../models/book.js';
import Borrowers from '../models/borrowers.js';
import Borrowing from '../models/borrowing.js';

/**
 * Relation Between Books and Borrowers
 */

Borrowing.hasOne(Borrowers, {
  constraints: false
});

Borrowing.hasOne(Book, {
  constraints: false
});

Borrowers.hasMany(Borrowing, {
  constraints: false
});

Book.hasMany(Borrowing, {
  constraints: false
});
