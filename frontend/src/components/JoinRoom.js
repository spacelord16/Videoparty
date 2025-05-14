import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const JoinRoom = () => {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/api/rooms/${roomCode}/join`);
      navigate(`/room/${roomCode}`);
    } catch (err) {
      setError("Failed to join room. Please check the room code.");
    }
  };

  return (
    <div className="join-room-container">
      <h2>Join a Room</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="roomCode">Room Code:</label>
          <input
            type="text"
            id="roomCode"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            required
            placeholder="Enter room code"
            maxLength={6}
          />
        </div>
        <button type="submit">Join Room</button>
      </form>
    </div>
  );
};

export default JoinRoom;
