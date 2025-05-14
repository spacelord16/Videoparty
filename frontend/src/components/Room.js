import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const Room = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [room, setRoom] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [error, setError] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await axios.get(`/api/rooms/${code}`);
        setRoom(response.data);
        setIsHost(response.data.host_id === localStorage.getItem("userId"));
        setVideoUrl(response.data.video_url);
      } catch (err) {
        setError("Failed to fetch room data");
      }
    };

    fetchRoom();
    const interval = setInterval(fetchRoom, 5000); // Poll for updates
    return () => clearInterval(interval);
  }, [code]);

  const handleVideoChange = async (e) => {
    const url = e.target.value;
    setVideoUrl(url);
    if (isHost) {
      try {
        await axios.put(`/api/rooms/${code}/state`, {
          video_url: url,
          is_playing: false,
          current_time: 0,
        });
      } catch (err) {
        setError("Failed to update video URL");
      }
    }
  };

  const handlePlayPause = async () => {
    if (isHost) {
      try {
        await axios.put(`/api/rooms/${code}/state`, {
          is_playing: !room.is_playing,
          current_time: videoRef.current.currentTime,
        });
      } catch (err) {
        setError("Failed to update playback state");
      }
    }
  };

  const handleTimeUpdate = async () => {
    if (isHost) {
      try {
        await axios.put(`/api/rooms/${code}/state`, {
          current_time: videoRef.current.currentTime,
        });
      } catch (err) {
        setError("Failed to update video time");
      }
    }
  };

  useEffect(() => {
    if (videoRef.current && room) {
      if (Math.abs(videoRef.current.currentTime - room.current_time) > 1) {
        videoRef.current.currentTime = room.current_time;
      }
      if (videoRef.current.paused && room.is_playing) {
        videoRef.current.play();
      } else if (!videoRef.current.paused && !room.is_playing) {
        videoRef.current.pause();
      }
    }
  }, [room]);

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!room) {
    return <div>Loading...</div>;
  }

  return (
    <div className="room-container">
      <div className="video-container">
        <video
          ref={videoRef}
          src={videoUrl}
          controls={isHost}
          onTimeUpdate={handleTimeUpdate}
          onPlay={handlePlayPause}
          onPause={handlePlayPause}
        />
      </div>
      <div className="room-controls">
        <input
          type="text"
          value={videoUrl}
          onChange={handleVideoChange}
          placeholder="Enter video URL"
        />
        <div className="room-info">
          <h2>Room Code: {code}</h2>
          <p>Share this code with friends to join!</p>
        </div>
      </div>
    </div>
  );
};

export default Room;
