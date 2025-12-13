import { useState } from "react";

export default function SearchBar({ onSearch, categories }) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);

  const [open, setOpen] = useState(false);

  const toggleCategory = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat)
        ? prev.filter((c) => c !== cat)
        : [...prev, cat]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({
      title,
      author,
      categories: selectedCategories,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-4 flex flex-wrap gap-3 items-end relative"
    >
      {/* TITLE */}
      <div className="flex flex-col">
        <label className="text-xs text-slate-600 mb-1">Title</label>
        <input
          className="border rounded px-2 py-1 text-sm"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Clean Code"
        />
      </div>

      {/* AUTHOR */}
      <div className="flex flex-col">
        <label className="text-xs text-slate-600 mb-1">Author</label>
        <input
          className="border rounded px-2 py-1 text-sm"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="e.g. Martin"
        />
      </div>

      {/* CATEGORY INPUT WITH CHECKBOX DROPDOWN */}
      <div className="flex flex-col relative max-w-sm">
        <label className="text-xs text-slate-600 mb-1">Category</label>

        {/* INPUT (looks like Author input) */}
        <input
          readOnly
          onClick={() => setOpen((prev) => !prev)}
          value={
            selectedCategories.length === 0
              ? ""
              : selectedCategories.join(", ")
          }
          placeholder="Select categories"
          className="border rounded px-2 py-1 text-sm cursor-pointer "
        />

        {/* DROPDOWN */}
        {open && (
          <div
            className="absolute left-0 top-full mt-1 w-full bg-white 
                      border border-slate-300 rounded shadow p-2 z-20"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-600 uppercase">
                Categories
              </span>
              <button
                type="button"
                onClick={() => setSelectedCategories([])}
                className="text-[11px] text-slate-500 hover:text-slate-700"
              >
                Clear
              </button>
            </div>

            <div className="max-h-40 overflow-y-auto space-y-1">
              {categories.length === 0 && (
                <p className="text-xs text-slate-500">No categories found</p>
              )}

              {categories.map((cat) => (
                <label
                  key={cat}
                  className="flex items-center gap-2 text-sm cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat)}
                    onChange={() => toggleCategory(cat)}
                  />
                  {cat}
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SEARCH BUTTON */}
      <button
        type="submit"
        className="px-4 py-2 text-sm rounded bg-slate-900 text-white hover:bg-slate-700"
      >
        Search
      </button>
    </form>
  );
}
