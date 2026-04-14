import React, { createContext, useContext, useState } from 'react';

interface AuthContextType {
    token: string | null;
    login: (token: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(() => {
        const storedToken = localStorage.getItem('token');
        console.log('AuthContext Initialization: token found?', !!storedToken);
        return storedToken;
    });

    const login = (newToken: string) => {
        console.log('AuthContext: Setting token', newToken ? 'Present' : 'Empty');
        localStorage.setItem('token', newToken);
        setToken(newToken);
    };

    const logout = () => {
        console.log('AuthContext: Logging out, clearing token');
        localStorage.removeItem('token');
        setToken(null);
    };

    const isAuthenticated = !!token;
    console.log('AuthContext: isAuthenticated?', isAuthenticated);

    return (
        <AuthContext.Provider value={{ token, login, logout, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
