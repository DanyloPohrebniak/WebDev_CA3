import { useEffect, useMemo, useState } from 'react';
import { apiGet, apiPost } from '../api/client';
import Layout from '../components/Layout';
import BookCard from '../components/BookCard';
import SearchBar from '../components/SearchBar';
import Cart from '../components/Cart';

import { ShoppingCartIcon } from '@heroicons/react/24/outline';

export default function CustomerPage() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [searchFilters, setSearchFilters] = useState({ title: '', author: '', categories: [] });

  // CART
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]); 
  // cartItems: [{ book, quantity, error? }]

  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState('');

  const userId = '69343ae0e302ca6d98f6c15c';

  const fetchBooks = async (filters = {}) => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams();
      if (filters.title) params.append('title', filters.title);
      if (filters.author) params.append('author', filters.author);

      if (filters.categories && filters.categories.length > 0) {
        filters.categories.forEach((cat) => params.append('category', cat));
      }

      const path = params.toString() ? `/api/books?${params.toString()}` : '/api/books';
      const data = await apiGet(path);
      setBooks(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await apiGet('/api/books/categories');
      setCategories(data || []);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  useEffect(() => {
    fetchBooks();
    fetchCategories();
  }, []);

  const handleSearch = (filters) => {
    // SearchBar має віддавати { title, author, categories }
    const normalized = {
      title: filters.title || '',
      author: filters.author || '',
      categories: filters.categories || [],
    };
    setSearchFilters(normalized);
    fetchBooks(normalized);
  };

  // Add to cart (коли натискаєш Buy на BookCard)
  const addToCart = (book) => {
    setCheckoutMessage('');
    setCartItems((prev) => {
      const existing = prev.find((x) => x.book._id === book._id);
      if (existing) {
        // збільшуємо до максимум 5
        return prev.map((x) =>
          x.book._id === book._id
            ? { ...x, quantity: Math.min(5, x.quantity + 1), error: '' }
            : x
        );
      }
      return [...prev, { book, quantity: 1, error: '' }];
    });
  };

  const removeFromCart = (bookId) => {
    setCartItems((prev) => prev.filter((x) => x.book._id !== bookId));
  };

  const updateQty = (bookId, qty) => {
    const safeQty = Number.isFinite(qty) ? Math.max(1, Math.min(5, qty)) : 1;
    setCartItems((prev) =>
      prev.map((x) =>
        x.book._id === bookId ? { ...x, quantity: safeQty, error: '' } : x
      )
    );
  };

  // Checkout = робимо purchase для кожного item
  const checkout = async () => {
    if (cartItems.length === 0) return;

    setCheckingOut(true);
    setCheckoutMessage('');
    setCartItems((prev) => prev.map((x) => ({ ...x, error: '' })));

    try {
      const payload = {
        userId,
        items: cartItems.map((x) => ({
          bookId: x.book._id,
          quantity: Number(x.quantity),
        })),
      };

      const res = await apiPost('/api/purchases/checkout', payload);

      setCheckoutMessage(
        res.discountApplied
          ? `Checkout successful! Discount: ${res.discountPct}%. Total: ${res.total}€`
          : `Checkout successful! Discount: 0%. Total: ${res.total}€`
      );

      setCartItems([]);
      setCartOpen(false);

      await fetchBooks(searchFilters);
      await fetchCategories();
    } catch (err) {
      setCheckoutMessage(err.message || 'Checkout failed');
    } finally {
      setCheckingOut(false);
    }
  };

  const cartCount = useMemo(
    () => cartItems.reduce((sum, x) => sum + x.quantity, 0),
    [cartItems]
  );

  return (
    <Layout>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Customer – Books</h2>

        <button
          type="button"
          onClick={() => setCartOpen(true)}
          className="relative p-2 rounded bg-slate-900 text-white hover:bg-slate-700"
        >
          <ShoppingCartIcon className="h-6 w-6" />

          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] 
                            rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
      </div>

      <SearchBar onSearch={handleSearch} categories={categories} />

      {loading && <p>Loading books...</p>}
      {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
      {books.length === 0 && !loading && <p>No books found.</p>}

      <div className="grid gap-4 md:grid-cols-2">
        {books.map((book) => (
          <BookCard key={book._id} book={book} onSelect={addToCart} />
        ))}
      </div>

      <Cart
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cartItems}
        onRemove={removeFromCart}
        onUpdateQty={updateQty}
        onCheckout={checkout}
        checkingOut={checkingOut}
        checkoutMessage={checkoutMessage}
      />
    </Layout>
  );
}
