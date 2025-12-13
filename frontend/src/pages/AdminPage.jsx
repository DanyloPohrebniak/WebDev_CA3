
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { apiGet, apiPost, apiPut, apiDelete } from '../api/client';

export default function AdminPage() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importError, setImportError] = useState('');
  const [importInfo, setImportInfo] = useState('');
  const [importing, setImporting] = useState(false);

  // edit form
  const [editingBook, setEditingBook] = useState(null);
  const [title, setTitle] = useState('');
  const [isbn, setIsbn] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');

  const [formMessage, setFormMessage] = useState('');

  const resetForm = () => {
    setEditingBook(null);
    setTitle('');
    setIsbn('');
    setAuthor('');
    setCategory('');
    setPrice('');
    setStock('');
    setFormMessage('');
  };

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiGet('/api/books');
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
    console.error(err);
    setError(err.message || 'Failed to load categories');
  }
};

  useEffect(() => {
    fetchBooks();
    fetchCategories();
  }, []);

  const handleEditClick = (book) => {
    setEditingBook(book);
    setTitle(book.title || '');
    setIsbn(book.isbn || '');
    setAuthor(book.author || '');
    setCategory(book.category || '');
    setPrice(book.price ?? '');
    setAmount(book.stock ?? '');
    setFormMessage('');
  };

  const handleDeleteClick = async (bookId) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;

    try {
      await apiDelete(`/api/books/${bookId}`);
      await fetchBooks();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to delete book');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormMessage('');

    if (!title || !isbn || !author || !category || !price || !stock) {
      setFormMessage('Please fill in all fields.');
      return;
    }

    const payload = {
      title,
      isbn,
      author,
      category,
      price: Number(price),
      stock: Number(stock),
    };

    try {
      if (editingBook) {
        await apiPut(`/api/books/${editingBook._id}`, payload);
        setFormMessage('Book updated successfully.');
      } else {
        await apiPost('/api/books', payload);
        setFormMessage('Book created successfully.');
      }

      await fetchBooks();
      resetForm();
    } catch (err) {
      console.error(err);
      setFormMessage(err.message || 'Failed to save book');
    }
  };

  const handleCreateNew = () => {
      setImportError('');
      setImportInfo('');
      setIsImportOpen(true);
  };

  const validateBooksJson = (books) => {
    if (!Array.isArray(books) || books.length === 0) {
      return 'JSON must be an array of books (not empty).';
    }

    const required = ['title', 'isbn', 'author', 'category', 'price', 'stock'];

    for (let i = 0; i < books.length; i++) {
      const b = books[i];
      if (!b || typeof b !== 'object') return `Book #${i + 1} is not an object`;

      const hasStock = b.stock !== undefined || b.amount !== undefined;

      const missing = required.filter((k) => k !== 'stock' && (b[k] === undefined || b[k] === null || b[k] === ''));
      if (!hasStock) missing.push('stock');

      if (missing.length > 0) {
        return `Book #${i + 1} missing fields: ${missing.join(', ')}`;
      }

      const priceNum = Number(b.price);
      const stockNum = Number(b.stock ?? b.amount);

      if (Number.isNaN(priceNum) || priceNum < 0) return `Book #${i + 1} has invalid price`;
      if (!Number.isInteger(stockNum) || stockNum < 0) return `Book #${i + 1} has invalid stock`;
    }

    return null;
  };

  const handleImportFile = async (file) => {
    setImportError('');
    setImportInfo('');

    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.json')) {
      setImportError('Please upload a .json file.');
      return;
    }

    try {
      setImporting(true);

      const text = await file.text();
      const parsed = JSON.parse(text);

      const validationError = validateBooksJson(parsed);
      if (validationError) {
        setImportError(validationError);
        return;
      }

      const res = await apiPost('/api/books/import', { books: parsed });

      setImportInfo(`Imported successfully. Inserted: ${res.insertedCount}`);
      await fetchBooks();
      await fetchCategories();
    } catch (err) {
      console.error(err);
      setImportError(err.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Admin – Manage Books</h2>
          <button
            type="button"
            onClick={handleCreateNew}
            className="px-4 py-2 text-sm rounded bg-slate-900 text-white hover:bg-slate-700"
          >
            Insert Book
          </button>
        </div>

        {/* Create / edit book */}
        <section className="bg-white rounded-lg shadow-sm p-4 border border-slate-200">
          <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-slate-600">
            {editingBook ? 'Edit Book' : 'Create New Book'}
          </h3>

          <form
            onSubmit={handleSubmit}
            className="grid gap-3 md:grid-cols-2"
          >
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-600">Title</label>
              <input
                className="border rounded px-2 py-1 text-sm"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Book title"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-600">ISBN</label>
              <input
                className="border rounded px-2 py-1 text-sm"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                placeholder="ISBN"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-600">Author</label>
              <input
                className="border rounded px-2 py-1 text-sm"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Author"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-600">Category</label>
              <input
                className="border rounded px-2 py-1 text-sm"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. fiction, history, programming"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-600">Price (€)</label>
              <input
                type="number"
                step="0.01"
                className="border rounded px-2 py-1 text-sm"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Price"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-600">Amount in stock</label>
              <input
                type="number"
                className="border rounded px-2 py-1 text-sm"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="Amount"
              />
            </div>

            <div className="md:col-span-2 flex items-center gap-3 mt-2">
              <button
                type="submit"
                className="px-4 py-2 text-sm rounded bg-emerald-600 text-white hover:bg-emerald-700"
              >
                {editingBook ? 'Save changes' : 'Create book'}
              </button>
              {formMessage && (
                <span className="text-xs text-slate-600">{formMessage}</span>
              )}
            </div>
          </form>
        </section>

        {/* Table of books */}
        <section className="bg-white rounded-lg shadow-sm p-4 border border-slate-200">
          <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-slate-600">
            Books List
          </h3>

          {loading && <p className="text-sm">Loading books...</p>}
          {error && (
            <p className="text-sm text-red-600 mb-2">
              {error}
            </p>
          )}

          {!loading && books.length === 0 && (
            <p className="text-sm">No books found.</p>
          )}

          {!loading && books.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border border-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="border-b border-slate-200 px-2 py-1 text-left">Title</th>
                    <th className="border-b border-slate-200 px-2 py-1 text-left">Author</th>
                    <th className="border-b border-slate-200 px-2 py-1 text-left">Category</th>
                    <th className="border-b border-slate-200 px-2 py-1 text-left">ISBN</th>
                    <th className="border-b border-slate-200 px-2 py-1 text-right">Price</th>
                    <th className="border-b border-slate-200 px-2 py-1 text-right">Stock</th>
                    <th className="border-b border-slate-200 px-2 py-1 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((book) => (
                    <tr key={book._id} className="hover:bg-slate-50">
                      <td className="border-b border-slate-100 px-2 py-1">
                        {book.title}
                      </td>
                      <td className="border-b border-slate-100 px-2 py-1">
                        {book.author}
                      </td>
                      <td className="border-b border-slate-100 px-2 py-1">
                        {book.category}
                      </td>
                      <td className="border-b border-slate-100 px-2 py-1">
                        {book.isbn}
                      </td>
                      <td className="border-b border-slate-100 px-2 py-1 text-right">
                        {book.price}€
                      </td>
                      <td className="border-b border-slate-100 px-2 py-1 text-right">
                        {book.stock}
                      </td>
                      <td className="border-b border-slate-100 px-2 py-1 text-right">
                        <button
                          onClick={() => handleEditClick(book)}
                          className="text-xs px-2 py-1 rounded border border-slate-300 hover:bg-slate-100 mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(book._id)}
                          className="text-xs px-2 py-1 rounded border border-red-300 text-red-700 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {isImportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-4 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                Import books from JSON
              </h3>
              <button
                type="button"
                onClick={() => setIsImportOpen(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-3">
              JSON must be an array of books with fields:
              <span className="font-semibold"> title, isbn, author, category, price, stock</span>
            </p>

            <input
              type="file"
              accept=".json,application/json"
              onChange={(e) => handleImportFile(e.target.files?.[0])}
              className="cursor-pointer bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full shadow-xs placeholder:text-body"
              disabled={importing}
            />

            {importError && (
              <p className="mt-3 text-sm text-red-600">{importError}</p>
            )}

            {importInfo && (
              <p className="mt-3 text-sm text-emerald-700">{importInfo}</p>
            )}

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsImportOpen(false)}
                className="px-3 py-2 text-sm rounded border border-slate-300 hover:bg-slate-100"
                disabled={importing}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
