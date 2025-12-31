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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        let success;
        if (isSignup) {
            success = await signup(formData.name, formData.email, formData.password);
        } else {
            success = await login(formData.email, formData.password);
        }

        if (success) {
            onLoginSuccess();
        } else {
            setError('Authentication failed. Please check your credentials.');
        }
    };

    const handleGoogleLogin = async () => {
        // Simulated Google Login Flow for Demo
        // In production, use Firebase Auth or Google Identity Services
        const mockGoogleUser = {
            name: 'Google User',
            email: `google.user.${Math.floor(Math.random() * 1000)}@gmail.com`,
            photoUrl: 'https://lh3.googleusercontent.com/a/default-user=s96-c'
        };

        const success = await socialLogin(mockGoogleUser);

        if (success) {
            onLoginSuccess();
        }
    };

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
                        onSuccess={credentialResponse => {
                            const decoded = jwtDecode(credentialResponse.credential);
                            const userPayload = {
                                name: decoded.name,
                                email: decoded.email,
                                photoUrl: decoded.picture
                            };
                            socialLogin(userPayload).then(success => {
                                if (success) onLoginSuccess();
                            });
                        }}
                        onError={() => {
                            console.log('Login Failed');
                        }}
                        useOneTap
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
