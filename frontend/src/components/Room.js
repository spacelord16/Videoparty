import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const Room = () => {
  const { code } = useParams();
  const videoRef = useRef(null);
  const [room, setRoom] = useState(null);
  const [isHost, setIsHost] = useState(true); // Everyone can control for now
  const [error, setError] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [playlist, setPlaylist] = useState([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [videoInfo, setVideoInfo] = useState(null);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/rooms/${code}`);
        setRoom(response.data);
        setVideoUrl(response.data.video_url);
        // Initialize with a sample playlist for demo
        if (playlist.length === 0) {
          setPlaylist([
            {
              title: "Current Video",
              url: response.data.video_url,
              platform: "youtube",
            },
          ]);
        }
      } catch (err) {
        setError("Failed to fetch room data. Creating offline demo room...");
        // Create a demo room for offline testing
        setRoom({
          id: 1,
          name: "Demo Room",
          code: code,
          is_playing: false,
          current_time: 0,
        });
      }
    };

    fetchRoom();
    const interval = setInterval(fetchRoom, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, [code, playlist.length]);

  const analyzeVideo = async (url) => {
    try {
      const response = await axios.post(`${API_URL}/api/video/analyze`, {
        url,
      });
      setVideoInfo(response.data);
      return response.data;
    } catch (err) {
      console.log("Video analysis failed, using direct URL");
      return { platform: "direct", embed_url: url, original_url: url };
    }
  };

  const addToPlaylist = async () => {
    if (!newVideoUrl.trim()) return;

    const videoData = await analyzeVideo(newVideoUrl);
    const newItem = {
      title: `${videoData.platform.toUpperCase()} Video`,
      url: videoData.embed_url,
      original_url: videoData.original_url,
      platform: videoData.platform,
      thumbnail: videoData.thumbnail,
    };

    setPlaylist((prev) => [...prev, newItem]);
    setNewVideoUrl("");
  };

  const playVideo = (index) => {
    setCurrentVideoIndex(index);
    const video = playlist[index];
    setVideoUrl(video.url);
    // Update backend if available
    updateRoomState(video.url, false, 0);
  };

  const updateRoomState = async (url, isPlaying, currentTime) => {
    try {
      await axios.put(`${API_URL}/api/rooms/${code}/state`, {
        video_url: url,
        is_playing: isPlaying,
        current_time: currentTime,
      });
    } catch (err) {
      console.log("Backend update failed, continuing offline");
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
      <div className="main-content">
        <div className="video-section">
          <div className="video-container">
            {videoUrl ? (
              <iframe
                ref={videoRef}
                src={videoUrl}
                title="Watch Party Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ width: "100%", height: "400px" }}
              />
            ) : (
              <div className="video-placeholder">
                <h3>🎬 No video selected</h3>
                <p>Add a video URL to start watching!</p>
              </div>
            )}
          </div>

          <div className="video-info">
            {videoInfo && (
              <div className="platform-badge">
                📺 {videoInfo.platform.toUpperCase()} Video
              </div>
            )}
          </div>
        </div>

        <div className="playlist-section">
          <h3>🎵 Playlist ({playlist.length} videos)</h3>

          <div className="add-video">
            <input
              type="text"
              value={newVideoUrl}
              onChange={(e) => setNewVideoUrl(e.target.value)}
              placeholder="🔗 Add YouTube, Vimeo, or any video URL..."
              style={{ width: "70%", marginRight: "10px" }}
            />
            <button onClick={addToPlaylist} style={{ padding: "8px 16px" }}>
              ➕ Add to Playlist
            </button>
          </div>

          <div className="playlist-items">
            {playlist.map((item, index) => (
              <div
                key={index}
                className={`playlist-item ${
                  index === currentVideoIndex ? "active" : ""
                }`}
                onClick={() => playVideo(index)}
                style={{
                  padding: "10px",
                  margin: "5px 0",
                  border: "1px solid #ddd",
                  borderRadius: "5px",
                  cursor: "pointer",
                  backgroundColor:
                    index === currentVideoIndex ? "#e3f2fd" : "#fff",
                }}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  {item.thumbnail && (
                    <img
                      src={item.thumbnail}
                      alt="thumbnail"
                      style={{
                        width: "60px",
                        height: "45px",
                        marginRight: "10px",
                        borderRadius: "3px",
                      }}
                    />
                  )}
                  <div>
                    <div style={{ fontWeight: "bold" }}>{item.title}</div>
                    <div style={{ fontSize: "12px", color: "#666" }}>
                      {item.platform.toUpperCase()} •{" "}
                      {item.original_url.substring(0, 50)}...
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="room-info">
        <h2>🎪 Room: {code}</h2>
        <p>📤 Share this code with friends to join the party!</p>
        {error && (
          <div
            className="error-message"
            style={{ color: "#ff6b6b", fontSize: "14px" }}
          >
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default Room;
