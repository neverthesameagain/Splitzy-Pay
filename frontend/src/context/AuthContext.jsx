import { createContext, useState, useContext, useEffect } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check valid session on load
    useEffect(() => {
        const initAuth = async () => {
            try {
                const storedUser = localStorage.getItem('splitzy_user');
                if (storedUser) {
                    const parsedUser = JSON.parse(storedUser);
                    setUser(parsedUser);

                    // We don't have a backend to verify against anymore, so just trust local storage or clear it
                    // For now, since we are frontend-only, we accept the stored user
                }
            } catch (e) {
                console.error("Failed to parse stored user", e);
                localStorage.removeItem('splitzy_user');
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    const login = async (email, password) => {
        // Mock Login for Frontend Only
        // In a real app without backend, we might check hardcoded credentials or just allow any login
        const mockUser = {
            user_id: 1,
            first_name: "Demo",
            last_name: "User",
            email: email,
            phone_number: "0000000000",
            opening_balance: 1000
        };

        setUser(mockUser);
        localStorage.setItem('splitzy_user', JSON.stringify(mockUser));
        return true;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('splitzy_user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
