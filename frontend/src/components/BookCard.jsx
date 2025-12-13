export default function BookCard({ book, onSelect }) {
  return (
    <div className="mx-auto bg-white shadow-md rounded-xl overflow-hidden 
                    w-[450px] h-[260px] flex">

      <div className="w-[40%] h-full">
        <img
          src={book.imageUrl}
          alt={book.title}
          className="w-full h-full object-cover"
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
          <p className="text-xs text-slate-500">In stock: {book.amount}</p>
        </div>

        {onSelect && (
          <button
            onClick={() => onSelect(book)}
            className="text-sm border rounded px-3 py-1 hover:bg-slate-100 w-fit"
          >
            Buy
          </button>
        )}

      </div>
    </div>
  );
}
