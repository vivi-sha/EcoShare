import { useState, useEffect, createContext, useContext } from 'react';

const AuthContext = createContext();
const API_URL = import.meta.env.VITE_API_URL || '/api';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        // Initialize from localStorage
        const saved = localStorage.getItem('user');
        return saved ? JSON.parse(saved) : null;
    });

    useEffect(() => {
        // Persist to localStorage whenever user changes
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            localStorage.removeItem('user');
        }
    }, [user]);

    const login = async (email, password) => {
        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (res.ok) {
                setUser(data);
                return true;
            }
        } catch (e) {
            console.error(e);
            return false;
        }
        return false;
    };

    const signup = async (name, email, password) => {
        try {
            const res = await fetch(`${API_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });
            const data = await res.json();
            if (res.ok) {
                setUser(data);
                return true;
            }
        } catch (e) { console.error(e); }
        return false;
    };

    const socialLogin = async (userInfo) => {
        try {
            const res = await fetch(`${API_URL}/auth/google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userInfo),
            });
            const data = await res.json();
            if (res.ok) {
                setUser(data);
                return true;
            }
        } catch (e) {
            console.error(e);
            return false;
        }
        return false;
    };

    const logout = () => {
        setUser(null);
    };

    const refreshUser = async () => {
        if (!user?.id) return;
        try {
            const res = await fetch(`${API_URL}/users/${user.id}`);
            if (res.ok) {
                const updatedUser = await res.json();
                setUser(updatedUser);
            }
        } catch (e) {
            console.error('Failed to refresh user:', e);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, socialLogin, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
