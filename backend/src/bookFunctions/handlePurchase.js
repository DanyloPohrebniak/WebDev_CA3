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

    const user = await User.findById(userId);
    const book = await Book.findById(bookId);

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!book) return res.status(404).json({ message: 'Book not found' });

    if (book.stock < quantity) {
      return res.status(400).json({ message: 'Not enough stock' });
    }

    const basePrice = book.price * quantity;
    let discount = 0;

    const newTotal = user.totalSpent + basePrice;
    if (newTotal > 150) {
      discount = 0.05; // 5%
    }

    const finalPrice = basePrice * (1 - discount);

    book.stock -= quantity;
    await book.save();

    user.totalSpent += finalPrice;
    await user.save();

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

// POST /api/purchases/checkout
const checkoutCart = async (req, res) => {
  try {
    const { userId, items } = req.body;

    if (!userId) return res.status(400).json({ message: 'userId is required' });
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'items must be a non-empty array' });
    }

    const bookIds = items.map((i) => i.bookId);
    const books = await Book.find({ _id: { $in: bookIds } });
    const bookMap = new Map(books.map((b) => [String(b._id), b]));


    let subtotal = 0;

    for (const it of items) {
      const qty = Number(it.quantity);

      if (!Number.isInteger(qty) || qty < 1 || qty > 5) {
        return res.status(400).json({ message: 'quantity must be integer 1..5' });
      }

      const b = bookMap.get(String(it.bookId));
      if (!b) return res.status(404).json({ message: `Book not found: ${it.bookId}` });

      if (b.stock < qty) {
        return res.status(400).json({ message: `Not enough stock for "${b.title}"` });
      }

      subtotal += Number(b.price) * qty;
    }

    const discountPct = subtotal >= 150 ? 5 : 0;
    const discountRate = discountPct / 100;
    const purchasesToCreate = [];

    for (const it of items) {
      const b = bookMap.get(String(it.bookId));
      const qty = Number(it.quantity);
      const pricePerUnit = Number(b.price);

      b.stock -= qty;
      await b.save();

      const lineFinalPrice = +(pricePerUnit * qty * (1 - discountRate)).toFixed(2);

      purchasesToCreate.push({
        user: userId,     
        book: b._id,    
        quantity: qty,
        pricePerUnit,   
        finalPrice: lineFinalPrice, 
      });
    }

    await Purchase.insertMany(purchasesToCreate);

    const total = +(subtotal * (1 - discountRate)).toFixed(2);

    return res.status(201).json({
      message: 'Checkout successful',
      discountApplied: discountPct > 0,
      discountPct,
      subtotal: +subtotal.toFixed(2),
      total,
      count: purchasesToCreate.length,
    });
  } catch (err) {
    console.error('checkoutCart error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { createPurchase, getPurchases, checkoutCart };