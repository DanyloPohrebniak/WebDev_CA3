export default function BookCard({ book, onSelect }) {
  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm flex flex-col gap-2">
      <div className="flex justify-between items-start gap-2">
        <div>
          <h3 className="font-semibold text-lg">{book.title}</h3>
          <p className="text-sm text-slate-600">
            {book.author} • {book.category}
          </p>
        </div>
        <span className="font-semibold">{book.price}€</span>
      </div>

      <p className="text-xs text-slate-500">ISBN: {book.isbn}</p>
      <p className="text-xs text-slate-500">In stock: {book.stock}</p>

      {onSelect && (
        <button
          onClick={() => onSelect(book)}
          className="mt-2 text-sm border rounded px-3 py-1 hover:bg-slate-100 self-start"
        >
          Buy
        </button>
      )}
    </div>
  );
}
