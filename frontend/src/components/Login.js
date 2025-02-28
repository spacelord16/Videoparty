import React, { useState } from 'react';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    
    const handleLogin = () => {
        console.log('Login attempt:', username, password)
    };

    return (
        <div>
            <h2>Login</h2>
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
                onChange={(e) => setPassword(e.target.values)}
            />
            <button onClick={handleLogin}>Login</button>
        </div>
    );
}

export default Login;