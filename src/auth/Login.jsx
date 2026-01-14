import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import './Login.css';

export default function Login({ onLoginSuccess }) {
    const [isSignup, setIsSignup] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const { login, signup, socialLogin } = useAuth();
    const [error, setError] = useState('');

    // Google login handled via the <GoogleLogin> component below.
    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            // Decode the JWT token returned by Google to extract user info
            const base64Url = credentialResponse?.credential?.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            const userInfo = JSON.parse(jsonPayload);

            const userPayload = {
                name: userInfo.name,
                email: userInfo.email,
                photoUrl: userInfo.picture,
            };
            const success = await socialLogin(userPayload);
            if (success) onLoginSuccess();
        } catch (error) {
            console.error('Google login error:', error);
            setError('Google login failed.');
        }
    };

    const handleGoogleError = () => {
        setError('Google login failed.');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        let success;
        if (isSignup) {
            // Attempt to create a new account
            success = await signup(formData.name, formData.email, formData.password);
            // If signup succeeded, automatically log the user in
            if (success) {
                success = await login(formData.email, formData.password);
            }
        } else {
            success = await login(formData.email, formData.password);
        }

        if (success) {
            onLoginSuccess();
        } else {
            setError('Authentication failed. Please check your credentials.');
        }
    };

    // removed handleGoogleLogin mock function as we use real google login now

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <span className="logo-icon-lg">🌿</span>
                    <h2>{isSignup ? "Create Account" : "Welcome Back"}</h2>
                    <p>{isSignup ? "Join the eco-travel revolution" : "Login to access your trips"}</p>
                </div>

                <form onSubmit={handleSubmit}>
                    {isSignup && (
                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                placeholder="John Doe"
                                className="input"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                    )}
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            placeholder="name@example.com"
                            className="input"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="input"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>

                    {error && <p className="error-text">{error}</p>}

                    <button type="submit" className="btn btn-primary btn-block">
                        {isSignup ? "Sign Up" : "Log In"}
                    </button>
                </form>

                <div className="social-login-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div className="divider" style={{ width: '100%' }}><span>OR</span></div>

                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        use_fedcm_for_prompt={true}
                    />
                </div>

                <div className="login-footer">
                    <p onClick={() => setIsSignup(!isSignup)}>
                        {isSignup ? "Already have an account? Login" : "Don't have an account? Sign Up"}
                    </p>
                </div>
            </div>
        </div>
    );
}
