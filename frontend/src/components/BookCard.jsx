export default function BookCard({ book, onSelect }) {
  return (
    <div className="mx-auto bg-white shadow-md rounded-xl overflow-hidden 
                    w-[450px] h-[260px] flex">

      <div className="w-[40%] h-full">
      <img
        src={`https://covers.openlibrary.org/b/isbn/${String(book.isbn).replaceAll('-', '')}-L.jpg`}
        alt={book.title}
        className="w-full h-full object-cover"
        onError={(e) => {
          e.currentTarget.src = "https://i.imgur.com/sJ3CT4V.gif";
        }}
      />
    </div>
      <div className="w-[60%] p-4 flex flex-col justify-between">

        <div>
          <div className="text-sm font-semibold tracking-wide text-indigo-500 uppercase">
            {book.category}
          </div>

          <div className="mt-1 text-lg font-medium text-black line-clamp-2">
            {book.title}
          </div>

          <p className="mt-1 text-gray-500 text-sm line-clamp-1">
            {book.author}
          </p>

          <p className="mt-2 font-semibold text-black">
            {book.price}€
          </p>

          <p className="text-xs text-slate-500">ISBN: {book.isbn}</p>
          <p className="text-xs text-slate-500">In stock: {book.stock}</p>
        </div>

        {onSelect && (
          <button
            onClick={() => onSelect(book)}
            className="px-2 py-2 text-sm rounded bg-emerald-600 text-white hover:bg-emerald-700"
          >
            Buy
          </button>
        )}

      </div>
    </div>
  );
}
