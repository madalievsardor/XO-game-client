function Board({ board, onClick }) {
  return (
    <div className="grid grid-cols-3 gap-2 w-72">
      {board.map((cell, idx) => (
        <button
          key={idx}
          className="btn h-20 text-3xl font-bold"
          onClick={() => onClick(idx)}
        >
          {cell}
        </button>
      ))}
    </div>
  );
}

export default Board;
