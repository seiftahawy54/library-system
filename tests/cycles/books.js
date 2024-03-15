import Book from '../../models/book.js';

const createBook = async (
  bookTitle,
  bookAuthor,
  bookIsbn,
  bookQuantity
) => {
  return await Book.create({
    title: bookTitle,
    author: bookAuthor,
    isbn: bookIsbn,
    quantity: bookQuantity
  });
};

export default createBook;
