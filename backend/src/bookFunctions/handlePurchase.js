const Book = require('../models/book');
const User = require('../models/User');
const Purchase = require('../models/Purchase');

// POST /api/purchases
const createPurchase = async (req, res) => {
  try {
    const { userId, bookId, quantity } = req.body;

    if (!userId || !bookId || !quantity) {
      return res.status(400).json({ message: 'userId, bookId і quantity обовʼязкові' });
    }

    if (quantity < 1 || quantity > 5) {
      return res.status(400).json({ message: 'Можна купити від 1 до 5 копій за раз' });
    }

    // знайти користувача і книгу
    const user = await User.findById(userId);
    const book = await Book.findById(bookId);

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!book) return res.status(404).json({ message: 'Book not found' });

    // перевірка stock
    if (book.stock < quantity) {
      return res.status(400).json({ message: 'Not enough stock' });
    }

    const basePrice = book.price * quantity;
    let discount = 0;

    // перевірка порогу 150€
    const newTotal = user.totalSpent + basePrice;
    if (newTotal > 150) {
      discount = 0.05; // 5%
    }

    const finalPrice = basePrice * (1 - discount);

    // оновлюємо stock книги
    book.stock -= quantity;
    await book.save();

    // оновлюємо totalSpent користувача
    user.totalSpent += finalPrice;
    await user.save();

    // створюємо purchase запис
    const purchase = await Purchase.create({
      user: user._id,
      book: book._id,
      quantity,
      pricePerUnit: book.price,
      finalPrice,
    });

    res.status(201).json({
      message: 'Purchase successful',
      discountApplied: discount > 0,
      purchase,
    });
  } catch (err) {
    console.error('Error in createPurchase:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/purchases?userId=...
const getPurchases = async (req, res) => {
  try {
    const { userId } = req.query;
    const filter = {};

    if (userId) filter.user = userId;

    const purchases = await Purchase.find(filter)
      .populate('user', 'name email')
      .populate('book', 'title author isbn');

    res.json(purchases);
  } catch (err) {
    console.error('Error in getPurchases:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { createPurchase, getPurchases };