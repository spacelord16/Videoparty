import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const CreateRoom = () => {
  const navigate = useNavigate();
  const [roomName, setRoomName] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/api/rooms`, {
        name: roomName,
        video_url: videoUrl,
      });
      navigate(`/room/${response.data.code}`);
    } catch (err) {
      setError("Failed to create room");
    }
  };

  return (
    <div className="create-room-container">
      <h2>Create a New Room</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="roomName">Room Name:</label>
          <input
            type="text"
            id="roomName"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            required
            placeholder="Enter room name"
          />
        </div>
        <div className="form-group">
          <label htmlFor="videoUrl">Video URL:</label>
          <input
            type="text"
            id="videoUrl"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            required
            placeholder="YouTube, Vimeo, Twitch, or direct video URL"
          />
          <small>
            🎬 We support YouTube, Vimeo, Twitch, and direct video links!
          </small>
        </div>
        <button type="submit">Create Room</button>
      </form>
    </div>
  );
};

export default CreateRoom;
