"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
    id: string;
    name: string;
    avatar: string; // Color or Image URL
    role: 'admin' | 'user';
}

interface AuthContextType {
    user: User | null;
    login: (id: string, pw: string) => boolean;
    logout: () => void;
    isAdmin: boolean;
}

const MOCK_USERS: Record<string, { pw: string, name: string, avatar: string, role: 'admin' | 'user' }> = {
    'kim': { pw: '1234', name: '김철수', avatar: '#579bfc', role: 'admin' },
    'lee': { pw: '1234', name: '이영희', avatar: '#ffcb00', role: 'user' },
    'park': { pw: '1234', name: '박지민', avatar: '#00c875', role: 'user' },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);

    // Persist login (optional, implemented for convenience)
    useEffect(() => {
        const stored = localStorage.getItem('ati_user');
        if (stored) {
            setUser(JSON.parse(stored));
        }
    }, []);

    const login = (id: string, pw: string) => {
        const target = MOCK_USERS[id];
        if (target && target.pw === pw) {
            const newUser: User = {
                id,
                name: target.name,
                avatar: target.avatar,
                role: target.role
            };
            setUser(newUser);
            localStorage.setItem('ati_user', JSON.stringify(newUser));
            return true;
        }
        return false;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('ati_user');
    };

    const isAdmin = user?.role === 'admin';

    return (
        <AuthContext.Provider value={{ user, login, logout, isAdmin }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
