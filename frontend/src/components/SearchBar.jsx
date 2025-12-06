import { useState } from 'react';

export default function SearchBar({ onSearch }) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ title, author, category });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-4 flex flex-wrap gap-3 items-end"
    >
      <div className="flex flex-col">
        <label className="text-xs text-slate-600 mb-1">Title</label>
        <input
          className="border rounded px-2 py-1 text-sm"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Clean Code"
        />
      </div>

      <div className="flex flex-col">
        <label className="text-xs text-slate-600 mb-1">Author</label>
        <input
          className="border rounded px-2 py-1 text-sm"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="e.g. Martin"
        />
      </div>

      <div className="flex flex-col">
        <label className="text-xs text-slate-600 mb-1">Category</label>
        <input
          className="border rounded px-2 py-1 text-sm"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="e.g. programming"
        />
      </div>

      <button
        type="submit"
        className="px-4 py-2 text-sm rounded bg-slate-900 text-white hover:bg-slate-700"
      >
        Search
      </button>
    </form>
  );
}
