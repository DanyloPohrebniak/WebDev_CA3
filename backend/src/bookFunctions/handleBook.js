
const Book = require('../models/book');

// GET /api/books
const getBooks = async (req, res) => {
  try {
    const { title, author } = req.query;
    let { category } = req.query;
    const filter = {};

    if (title) {
      filter.title = new RegExp(title, 'i');
    }
    if (author) {
      filter.author = new RegExp(author, 'i');
    }

    if (category) {
      if (Array.isArray(category)) {
        filter.category = { $in: category };
      } else {
        filter.category = category;
      }
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

// GET /api/books/categories
const getBookCategories = async (req, res) => {
  try {
    const categories = await Book.distinct('category');
    categories.sort((a, b) => a.localeCompare(b));
    res.json(categories);
  } catch (err) {
    console.error('Error in getBookCategories:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/books/import
const importBooks = async (req, res) => {
  try {
    const { books } = req.body;

    if (!Array.isArray(books) || books.length === 0) {
      return res.status(400).json({ message: 'books must be a non-empty array' });
    }

    const required = ['title', 'isbn', 'author', 'category', 'price'];
    const errors = [];
    const cleaned = [];

    books.forEach((b, idx) => {
      if (!b || typeof b !== 'object') {
        errors.push({ index: idx, error: 'Item is not an object' });
        return;
      }

      // підтримка stock або amount
      const stockValue = b.stock ?? b.amount;

      const missing = required.filter((k) => b[k] === undefined || b[k] === null || b[k] === '');
      if (stockValue === undefined || stockValue === null || stockValue === '') {
        missing.push('stock');
      }

      if (missing.length > 0) {
        errors.push({ index: idx, error: `Missing fields: ${missing.join(', ')}` });
        return;
      }

      const priceNum = Number(b.price);
      const stockNum = Number(stockValue);

      if (Number.isNaN(priceNum) || priceNum < 0) {
        errors.push({ index: idx, error: 'Invalid price' });
        return;
      }
      if (!Number.isInteger(stockNum) || stockNum < 0) {
        errors.push({ index: idx, error: 'Invalid stock (must be integer >= 0)' });
        return;
      }

      cleaned.push({
        title: String(b.title).trim(),
        isbn: String(b.isbn).trim(),
        author: String(b.author).trim(),
        category: String(b.category).trim(),
        price: priceNum,
        stock: stockNum,
        imageUrl: b.imageUrl ? String(b.imageUrl).trim() : undefined, 
      });
    });

    if (errors.length > 0) {
      return res.status(400).json({
        message: 'Invalid JSON format',
        errors,
      });
    }


    const inserted = await Book.insertMany(cleaned, { ordered: false });

    return res.status(201).json({
      message: 'Import completed',
      insertedCount: inserted.length,
    });
  } catch (err) {
    console.error('Import error:', err);
    return res.status(500).json({
      message: 'Server error during import',
      error: err.message,
    });
  }
};

module.exports = {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getBookCategories,
  importBooks,
};
