import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext'; // Ensure you have this context for global state management

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { setAuth } = useContext(AuthContext); // Use this to set global auth state

    const handleLogin = async () => {
        setError('');
        try {
            const response = await axios.post('http://localhost:8080/login', {
                username,
                password
            });
            setAuth({ isLoggedIn: true, user: response.data.user });
            localStorage.setItem('token', response.data.token); // Save token to local storage
            // Redirect user or handle successful login logic here
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button onClick={handleLogin}>Login</button>
            {error && <p>{error}</p>}
        </div>
    );
}

export default Login;
