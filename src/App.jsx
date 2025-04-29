import { useEffect, useState } from "react";
import io from "socket.io-client";
import Board from "./components/Board";

const socket = io("https://xo-game-client-1.onrender.com/");

function App() {
  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("");
  const [joined, setJoined] = useState(false);
  const [board, setBoard] = useState(Array(9).fill(null));
  const [symbol, setSymbol] = useState(null);
  const [turn, setTurn] = useState("X");
  const [winner, setWinner] = useState(null);
  const [players, setPlayers] = useState([]);
  const [error, setError] = useState("");
  const [start, setStart] = useState(false);
  const [roomsList, setRoomsList] = useState([]);

  useEffect(() => {
    socket.on("init", ({ symbol, board }) => {
      setSymbol(symbol);
      setBoard(board);
      setJoined(true);
    });

    socket.on("board_update", ({ board, turn, winner }) => {
      setBoard(board);
      setTurn(turn);
      setWinner(winner);
    });

    socket.on("players", (players) => {
      setPlayers(players);
    });

    socket.on("error", (message) => {
      setError(message);
    });

    socket.on("start_game", ({ start, players }) => {
      setStart(start);
      setPlayers(players);
    });

    socket.on("rooms_list", (availableRooms) => {
      setRoomsList(availableRooms);
    });

    socket.emit("get_rooms");
  }, []);

  const handleJoin = () => {
    if (username.trim() && roomId.trim()) {
      socket.emit("join_game", { username: username.trim(), roomId: roomId.trim() });
      setError("");
    }
  };

  const handleCreateRoom = () => {
    if (username.trim()) {
      const newRoomId = Math.random().toString(36).substring(2, 8);
      setRoomId(newRoomId);
      socket.emit("join_game", { username: username.trim(), roomId: newRoomId });
      setError("");
    }
  };

  const handleClick = (index) => {
    if (winner || board[index] !== null || symbol !== turn) return;
    socket.emit("move", index);
  };

  const restart = () => {
    socket.emit("restart");
  };

  if (!joined) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-3xl font-bold">Tic-Tac-Toe</h1>
        <input
          type="text"
          placeholder="Enter your name"
          className="input input-bordered"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="text"
          placeholder="Enter room ID"
          className="input input-bordered"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />
        <div className="flex gap-4">
          <button className="btn btn-primary" onClick={handleJoin}>Join Room</button>
          <button className="btn btn-secondary" onClick={handleCreateRoom}>Create Room</button>
        </div>
        {error && <p className="text-red-500">{error}</p>}

        <div className="mt-4">
          <h2 className="text-lg font-bold">Available Rooms:</h2>
          <ul className="list-disc list-inside">
            {roomsList.length === 0 && <p>No available rooms</p>}
            {roomsList.map((id) => (
              <li key={id}>
                {id} 
                <button className="ml-2 btn btn-xs btn-outline" onClick={() => setRoomId(id)}>Join</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  if (players.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold">Waiting for another player...</h1>
        <p>Room ID: <b>{roomId}</b></p>
        <p>Players: {players.map(p => `${p.username} (${p.symbol})`).join(" & ")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4 min-h-screen">
      <h1 className="text-3xl font-bold">Tic-Tac-Toe (XO)</h1>

      <p className="text-gray-500">
        You are: <b>{symbol}</b> — {symbol === turn ? "Your turn" : "Waiting..."}
      </p>

      {start && <Board board={board} onClick={handleClick} />}

      {winner && (
        <div className="text-xl font-bold mt-2">
          {winner === "draw" ? "🤝 Draw!" : `🎉 ${winner} wins!`}
        </div>
      )}

      <button className="btn btn-outline mt-4" onClick={restart}>🔁 Restart</button>

      <div className="text-sm text-base-content">
        Players: {players.map(p => `${p.username} (${p.symbol})`).join(" & ")}
      </div>
    </div>
  );
}

export default App;
