
const Book = require('../models/book');

// GET /api/books
const getBooks = async (req, res) => {
  try {
    const { title, author, category } = req.query;
    const filter = {};

    if (title) {
      filter.title = new RegExp(title, 'i'); 
    }
    if (author) {
      filter.author = new RegExp(author, 'i');
    }
    if (category) {
      filter.category = category;
    }

    const books = await Book.find(filter);
    res.json(books);
  } catch (err) {
    console.error('Error in getBooks:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/books/:id
const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json(book);
  } catch (err) {
    console.error('Error in getBookById:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/books
const createBook = async (req, res) => {
  try {
    const { title, isbn, author, category, price, stock } = req.body;

    const book = await Book.create({ title, isbn, author, category, price, stock });
    res.status(201).json(book);
  } catch (err) {
    console.error('Error in createBook:', err);
    res.status(400).json({ message: 'Invalid data', error: err.message });
  }
};

// PUT /api/books/:id
const updateBook = async (req, res) => {
  try {
    const updated = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: 'Book not found' });
    res.json(updated);
  } catch (err) {
    console.error('Error in updateBook:', err);
    res.status(400).json({ message: 'Invalid data', error: err.message });
  }
};

// DELETE /api/books/:id
const deleteBook = async (req, res) => {
  try {
    const deleted = await Book.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Book not found' });
    res.json({ message: 'Book deleted' });
  } catch (err) {
    console.error('Error in deleteBook:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
};
