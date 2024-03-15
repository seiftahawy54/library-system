import { describe, expect, test, beforeEach, beforeAll } from 'vitest';
import request from 'supertest';
import '../../utils/associations.js';
import app from '../../app.js';
import crypto from 'crypto';
import Book from '../../models/book.js';
import moment from 'moment';
import { faker } from '@faker-js/faker';
import { initDB } from '../../utils/db.js';

describe('/book', () => {
  beforeAll(() => {
    // NOT adding promises to make sure the db is initialized
    initDB();
  });

  beforeEach(async () => {
    await Book.truncate({
      cascade: true
    });
  });

  test('/POST - Create book', async () => {
    const randomISBN = `${crypto.randomInt(1000000000000, 9999999999999)}`;
    const res = await request(app)
      .post('/api/books')
      .send({
        title: 'Book 1',
        author: 'Author 1',
        quantity: 10,
        isbn: randomISBN
      });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Book 1');
    expect(res.body.author).toBe('Author 1');
    expect(res.body.quantity).toBe(10);
    expect(res.body.isbn).toBe(randomISBN);
  });

  test('/GET - Return not found if no books', async () => {
    const res = await request(app).get('/api/books');
    expect(res.status).toBe(404);
  });

  describe('/DELETION', () => {
    let bookId;
    // NOT adding promises to make sure the db is initialized
    initDB();

    beforeEach(async () => {
      const randomISBN = `${crypto.randomInt(1000000000000, 9999999999999)}`;
      // Create a book
      const bookRes = await request(app)
        .post('/api/books')
        .send({
          title: 'Book 1',
          author: 'Author 1',
          quantity: 10,
          isbn: randomISBN
        });
      // Create a borrower
      const borrowerRes = await request(app)
        .post('/api/borrowers')
        .send({
          name: faker.person.fullName(),
          email: faker.internet.email()
        });

      // Borrow book
      const borrowingResponse = await request(app)
        .post('/api/borrowing')
        .send({
          bookId: bookRes.body.id,
          borrowerId: borrowerRes.body.id,
          borrowFrom: moment().toISOString(),
          borrowTo: moment().add(1, 'month').toISOString()
        });

      bookId = bookRes.body.id;
    });

    test('/DELETE - Should not delete a book if it is borrowed', async () => {
      const res = await request(app).delete('/api/books/' + bookId);
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Cannot delete a book is borrowed by a customer');
    });
  });
});
