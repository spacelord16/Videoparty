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
  const [recommendations, setRecommendations] = useState([]);
  const [selectedMood, setSelectedMood] = useState("chill");

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
        setError("Backend offline - Running in demo mode! 🎬");
        // Create a demo room for offline testing
        setRoom({
          id: 1,
          name: "Demo Room",
          code: code,
          is_playing: false,
          current_time: 0,
        });

        // Add sample playlist items for demo
        if (playlist.length === 0) {
          setPlaylist([
            {
              title: "🎵 Chill Lofi Hip Hop",
              url: "https://www.youtube.com/embed/jfKfPfyJRdk",
              original_url: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
              platform: "youtube",
              thumbnail:
                "https://img.youtube.com/vi/jfKfPfyJRdk/maxresdefault.jpg",
            },
            {
              title: "🌙 Relaxing Night Jazz",
              url: "https://www.youtube.com/embed/Dx5qFachd3A",
              original_url: "https://www.youtube.com/watch?v=Dx5qFachd3A",
              platform: "youtube",
              thumbnail:
                "https://img.youtube.com/vi/Dx5qFachd3A/maxresdefault.jpg",
            },
            {
              title: "🎸 Acoustic Guitar Session",
              url: "https://www.youtube.com/embed/tum7eTWFk88",
              original_url: "https://www.youtube.com/watch?v=tum7eTWFk88",
              platform: "youtube",
              thumbnail:
                "https://img.youtube.com/vi/tum7eTWFk88/maxresdefault.jpg",
            },
          ]);
          setVideoUrl("https://www.youtube.com/embed/jfKfPfyJRdk");
        }
      }
    };

    fetchRoom();
    const interval = setInterval(fetchRoom, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, [code, playlist.length]);

  // Load AI recommendations when playlist changes
  useEffect(() => {
    if (playlist.length > 0) {
      loadRecommendations("smart");
    }
  }, [playlist.length]);

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

  const loadRecommendations = async (type = "smart") => {
    try {
      let response;
      if (type === "smart") {
        response = await axios.post(`${API_URL}/api/recommendations/smart`, {
          playlist: playlist,
          limit: 6,
        });
      } else if (type === "trending") {
        response = await axios.get(`${API_URL}/api/recommendations/trending`);
      } else if (type === "mood") {
        response = await axios.post(`${API_URL}/api/recommendations/mood`, {
          mood: selectedMood,
          limit: 4,
        });
      }

      setRecommendations(response.data.recommendations);
    } catch (err) {
      console.log("Recommendations unavailable, using fallback");
      // Fallback recommendations
      setRecommendations([
        {
          title: "🎵 Chill Study Beats",
          url: "https://www.youtube.com/embed/jfKfPfyJRdk",
          original_url: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
          platform: "youtube",
          thumbnail: "https://img.youtube.com/vi/jfKfPfyJRdk/maxresdefault.jpg",
        },
        {
          title: "🌙 Night Jazz Vibes",
          url: "https://www.youtube.com/embed/Dx5qFachd3A",
          original_url: "https://www.youtube.com/watch?v=Dx5qFachd3A",
          platform: "youtube",
          thumbnail: "https://img.youtube.com/vi/Dx5qFachd3A/maxresdefault.jpg",
        },
      ]);
    }
  };

  const addRecommendationToPlaylist = (recommendation) => {
    const newItem = {
      title: recommendation.title,
      url: recommendation.url,
      original_url: recommendation.original_url || recommendation.url,
      platform: recommendation.platform,
      thumbnail: recommendation.thumbnail,
    };

    setPlaylist((prev) => [...prev, newItem]);
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

        <div className="recommendations-section">
          <h3>🤖 AI Recommendations</h3>

          <div className="recommendation-controls">
            <button
              onClick={() => loadRecommendations("smart")}
              style={{ margin: "5px", padding: "5px 10px" }}
            >
              🧠 Smart
            </button>
            <button
              onClick={() => loadRecommendations("trending")}
              style={{ margin: "5px", padding: "5px 10px" }}
            >
              🔥 Trending
            </button>

            <select
              value={selectedMood}
              onChange={(e) => setSelectedMood(e.target.value)}
              style={{ margin: "5px", padding: "5px" }}
            >
              <option value="chill">😌 Chill</option>
              <option value="focus">🎯 Focus</option>
              <option value="relax">🧘 Relax</option>
              <option value="energy">⚡ Energy</option>
              <option value="study">📚 Study</option>
            </select>
            <button
              onClick={() => loadRecommendations("mood")}
              style={{ margin: "5px", padding: "5px 10px" }}
            >
              🎭 Mood
            </button>
          </div>

          <div
            className="recommendations-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "10px",
              marginTop: "10px",
            }}
          >
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className="recommendation-card"
                style={{
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  padding: "10px",
                  cursor: "pointer",
                  backgroundColor: "#fff",
                  transition: "transform 0.2s",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
                onClick={() => addRecommendationToPlaylist(rec)}
                onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
                onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
              >
                {rec.thumbnail && (
                  <img
                    src={rec.thumbnail}
                    alt="thumbnail"
                    style={{
                      width: "100%",
                      height: "100px",
                      objectFit: "cover",
                      borderRadius: "4px",
                      marginBottom: "8px",
                    }}
                  />
                )}
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: "bold",
                    marginBottom: "4px",
                  }}
                >
                  {rec.title}
                </div>
                <div style={{ fontSize: "12px", color: "#666" }}>
                  {rec.platform?.toUpperCase()} {rec.views && `• ${rec.views}`}
                </div>
                <div
                  style={{ fontSize: "11px", color: "#999", marginTop: "4px" }}
                >
                  Click to add to playlist
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
