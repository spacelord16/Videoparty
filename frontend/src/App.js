import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import CreateRoom from "./components/CreateRoom";
import JoinRoom from "./components/JoinRoom";
import Room from "./components/Room";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <Link to="/" className="nav-brand">
            VideoParty
          </Link>
          <div className="nav-links">
            <Link to="/create-room" className="nav-link">
              Create Room
            </Link>
            <Link to="/join-room" className="nav-link">
              Join Room
            </Link>
          </div>
        </nav>
        <div className="content">
          <Routes>
            <Route
              path="/"
              element={
                <div className="home">
                  <h1>Welcome to VideoParty!</h1>
                  <p>
                    Create a room or join an existing one to start watching
                    videos with friends.
                  </p>
                  <div className="home-buttons">
                    <Link to="/create-room" className="button">
                      Create Room
                    </Link>
                    <Link to="/join-room" className="button">
                      Join Room
                    </Link>
                  </div>
                </div>
              }
            />
            <Route path="/create-room" element={<CreateRoom />} />
            <Route path="/join-room" element={<JoinRoom />} />
            <Route path="/room/:code" element={<Room />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
