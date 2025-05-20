// src/pages/LoginPage.js
import React, { useState } from 'react';
import LoginForm from '../components/auth/LoginForm';
// import authService from '../services/authService'; // You'll uncomment and use this later

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    // const navigate = useNavigate(); // If using React Router for navigation after login

    const handleLoginSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setError('');

        console.log('Attempting login with:', { username, password });

        // Simulate API call
        // In a real app, you would call your authService here:
        // try {
        //     const data = await authService.login(username, password);
        //     console.log('Login successful (simulated):', data);
        //     // navigate('/dashboard'); // Redirect on success
        // } catch (err) {
        //     setError(err.message || 'Login failed. Please try again.');
        //     console.error('Login error (simulated):', err);
        // } finally {
        //     setIsLoading(false);
        // }

        // --- Simulated Logic ---
        setTimeout(() => {
            if (username === "admin" && password === "password") {
                console.log("Login successful (simulated)");
                // In a real app, you'd update auth state and navigate
                alert("Login Successful! (Simulated)"); // Placeholder
            } else {
                setError('Invalid username or password.');
                console.log("Login failed (simulated)");
            }
            setIsLoading(false);
        }, 1500);
        // --- End Simulated Logic ---
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
            <LoginForm
                username={username}
                password={password}
                onUsernameChange={(e) => setUsername(e.target.value)}
                onPasswordChange={(e) => setPassword(e.target.value)}
                onSubmit={handleLoginSubmit}
                isLoading={isLoading}
                error={error}
            />
        </div>
    );
};

export default LoginPage;