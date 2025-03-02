import React, { useState } from 'react';
import axios from 'axios'; // Ensure axios is imported

function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleRegister = async () => {
        setLoading(true);
        setMessage('');
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/register`, {
                username,
                password
            });
            setMessage('Registration successful! Please login.');
            setUsername(''); // Reset username
            setPassword(''); // Reset password
            // Optionally, redirect to login page or elsewhere after successful registration
        } catch (error) {
            setMessage('Registration failed: ' + (error.response?.data?.error || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Register</h2>
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleRegister} disabled={loading}>
                {loading ? 'Registering...' : 'Register'}
            </button>
            {message && <p>{message}</p>}
        </div>
    );
}

export default Register;
