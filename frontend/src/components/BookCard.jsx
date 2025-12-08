export default function BookCard({ book, onSelect }) {
  return (
    <div className="max-h-xs max-w-md overflow-hidden rounded-xl bg-white shadow-md md:max-w-2xl">
      <div className="md:flex">
        
        {/* Image */}
        <div className="md:shrink-0">
          <img
            className="h-48 w-full object-cover md:h-full md:w-48"
            src={book.imageUrl}
            alt={book.title}
          />
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Category */}
          <div className="text-sm font-semibold tracking-wide text-indigo-500 uppercase">
            {book.category}
          </div>

          {/* Title */}
          <div className="mt-1 block text-lg leading-tight font-medium text-black">
            {book.title}
          </div>

          {/* Author */}
          <p className="mt-2 text-gray-500">
            {book.author}
          </p>

          {/* Price */}
          <p className="mt-2 font-semibold text-black">
            {book.price}€
          </p>

          {/* Extra Info */}
          <p className="mt-2 text-xs text-slate-500">ISBN: {book.isbn}</p>
          <p className="text-xs text-slate-500">In stock: {book.stock}</p>

          {/* Button */}
          {onSelect && (
            <button
              onClick={() => onSelect(book)}
              className="mt-4 text-sm border rounded px-3 py-1 hover:bg-slate-100"
            >
              Buy
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
