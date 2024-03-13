import Book from '../../models/book.js';

const createBook = async (
  bookTitle,
  bookAuthor,
  bookIsbn
) => {
  return await Book.create({
    title: bookTitle,
    author: bookAuthor,
    isbn: bookIsbn
  });
};

export default createBook;
