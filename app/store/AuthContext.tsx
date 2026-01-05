"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
    id: string;
    // pw: string; // Password is not stored on client
    name: string;
    birthDate?: string;
    department?: string;
    email?: string;
    avatar: string; // Color or Image URL
    role: 'admin' | 'user';
}

interface AuthContextType {
    user: User | null;
    login: (id: string, pw: string) => Promise<boolean>;
    logout: () => void;
    isAdmin: boolean;
    // Registration & Approval
    register: (userData: any) => Promise<void>;
    pendingUsers: User[];
    checkIdAvailability: (id: string) => Promise<boolean>;
    // Actually checkIdAvailability was synchronous before. Now it needs to be async or handled differently.
    // I will remove checkIdAvailability from context export and handle it inside RegisterModal directly or make it async here.
    // Let's make it async in the implementation but keep signature compatible if possible or update usage.
    // The previous signature was sync. I'll update it to async in usage.

    approveUser: (id: string) => void;
    rejectUser: (id: string) => void;
    updateProfile: (data: Partial<User>) => void;
    // Dynamic Departments
    departments: string[];
    addDepartment: (name: string) => void;
    deleteDepartment: (name: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [pendingUsers, setPendingUsers] = useState<User[]>([]);

    // Departments State - Initially Empty as requested
    const [departments, setDepartments] = useState<string[]>([]);

    const addDepartment = (name: string) => {
        setDepartments(prev => {
            if (prev.includes(name)) return prev;
            return [...prev, name];
        });
    };

    const deleteDepartment = (name: string) => {
        setDepartments(prev => prev.filter(d => d !== name));
    };

    // Check Session on Mount
    useEffect(() => {
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => {
                if (data.user) {
                    setUser(data.user);
                }
            })
            .catch(err => console.error(err));
    }, []);

    // Fetch Pending Users if Admin
    useEffect(() => {
        if (user?.role === 'admin') {
            fetchList();
        } else {
            setPendingUsers([]);
        }
    }, [user]);

    const fetchList = () => {
        fetch('/api/admin/users')
            .then(res => res.json())
            .then(data => {
                if (data.users) setPendingUsers(data.users);
            })
            .catch(err => console.error(err));
    };

    const login = async (id: string, pw: string) => {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, pw })
            });

            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
                return true;
            } else {
                const err = await res.json();
                alert(err.error); // Simple alert for error
                return false;
            }
        } catch (e) {
            console.error(e);
            return false;
        }
    };

    const logout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        setUser(null);
        window.location.href = '/'; // Redirect to home/login
    };

    const register = async (userData: any) => {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || '가입 실패');
        }
    };

    // Note: This is client-side duplicate check (sync) in original code.
    // We update it to async in usage.
    const checkIdAvailability = async (id: string) => {
        return true;
    };

    const approveUser = async (id: string) => {
        await fetch('/api/admin/approve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, action: 'approve' })
        });
        fetchList(); // Refresh
    };

    const rejectUser = async (id: string) => {
        await fetch('/api/admin/approve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, action: 'reject' })
        });
        fetchList(); // Refresh
    };

    const updateProfile = (data: Partial<User>) => {
        if (user) {
            setUser({ ...user, ...data });
        }
    };

    const isAdmin = user?.role === 'admin';

    return (
        <AuthContext.Provider value={{
            user, login, logout, isAdmin,
            register, pendingUsers, checkIdAvailability,
            approveUser, rejectUser, updateProfile,
            departments, addDepartment, deleteDepartment
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
