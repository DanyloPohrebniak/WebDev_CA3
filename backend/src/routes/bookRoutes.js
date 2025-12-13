const express = require('express');

const router = express.Router();
const {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getBookCategories,
  importBooks,
} = require('../bookFunctions/handleBook');

// /api/books
router.get('/categories', getBookCategories);
router.post('/import', importBooks);
router.get('/', getBooks);
router.get('/:id', getBookById);
router.post('/', createBook);
router.put('/:id', updateBook);
router.delete('/:id', deleteBook);

module.exports = router;
