import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../api/client';
import Layout from '../components/Layout';
import BookCard from '../components/BookCard';
import SearchBar from '../components/SearchBar';

export default function CustomerPage() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isCategoryFilterOpen, setIsCategoryFilterOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [purchaseMessage, setPurchaseMessage] = useState('');
  const [searchFilters, setSearchFilters] = useState({ title: '', author: '' });

  const fetchBooks = async (filters = {}) => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();

      if (filters.title) params.append('title', filters.title);
      if (filters.author) params.append('author', filters.author);
      if (filters.categories && filters.categories.length > 0) {
        filters.categories.forEach((cat) => {
          params.append('category', cat);
        });
      }

      const path = params.toString()
        ? `/api/books?${params.toString()}`
        : '/api/books';

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
    fetchBooks(filters);
  };

  const handleBuy = async () => {
    if (!selectedBook) return;
    setPurchaseMessage('');

    const userId = '69343ae0e302ca6d98f6c15c';

    try {
      if (quantity < 1 || quantity > 5) {
        setPurchaseMessage('You can buy between 1 and 5 copies.');
        return;
      }

      const result = await apiPost('/api/purchases', {
        userId,
        bookId: selectedBook._id,
        quantity: Number(quantity),
      });

      setPurchaseMessage(
        result.discountApplied
          ? 'Purchase successful! 5% discount applied.'
          : 'Purchase successful!'
      );
      
      fetchBooks({ ...searchFilters, categories: selectedCategories });
      setSelectedBook(null);
      setQuantity(1);
    } catch (err) {
      setPurchaseMessage(err.message || 'Purchase failed');
    }
  };

  return (
    <Layout>
      <h2 className="text-xl font-semibold mb-4">Customer – Books</h2>

      <SearchBar onSearch={handleSearch} categories={categories} />

      {loading && <p>Loading books...</p>}
      {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

      {books.length === 0 && !loading && <p>No books found.</p>}

      <div className="grid gap-4 md:grid-cols-2">
        {books.map((book) => (
          <BookCard
            key={book._id}
            book={book}
            onSelect={setSelectedBook}
          />
        ))}
      </div>

      {selectedBook && (
        <div className="mt-6 border rounded-lg p-4 bg-white shadow-sm max-w-md">
          <h3 className="font-semibold mb-2">
            Buy: {selectedBook.title}
          </h3>
          <label className="text-sm mb-2 block">
            Quantity (1–5):
            <input
              type="number"
              min={1}
              max={5}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="border rounded px-2 py-1 ml-2 w-20 text-sm"
            />
          </label>
          <button
            onClick={handleBuy}
            className="px-4 py-2 text-sm rounded bg-slate-900 text-white hover:bg-slate-700"
          >
            Confirm purchase
          </button>
          {purchaseMessage && (
            <p className="mt-2 text-sm">{purchaseMessage}</p>
          )}
        </div>
      )}
    </Layout>
  );
}
