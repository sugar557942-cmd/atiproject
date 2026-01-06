"use client";

import React, { useState } from 'react';
import { useAuth } from '../store/AuthContext';
import { Lock, User } from 'lucide-react';
import { RegisterModal } from './RegisterModal';

export function LoginView() {
    const { login } = useAuth();
    const [id, setId] = useState('');
    const [pw, setPw] = useState('');
    const [error, setError] = useState('');
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const success = await login(id, pw);
            if (success) {
                setError('');
            } else {
                setError('아이디 또는 비밀번호가 올바르지 않습니다.');
            }
        } catch (err) {
            setError('로그인 중 오류가 발생했습니다.');
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            background: '#f5f6f8'
        }}>
            <div style={{
                background: 'white',
                padding: '40px',
                borderRadius: '12px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
                width: '100%',
                maxWidth: '400px'
            }}>
                <h1 style={{ marginBottom: '24px', textAlign: 'center', color: '#323338' }}>로그인</h1>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#676879' }}>아이디</label>
                        <div style={{ position: 'relative' }}>
                            <User size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#676879' }} />
                            <input
                                type="text"
                                value={id}
                                onChange={e => setId(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px 10px 10px 36px',
                                    borderRadius: '6px',
                                    border: '1px solid #c3c6d4',
                                    fontSize: '14px'
                                }}
                                placeholder="kim"
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#676879' }}>비밀번호</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#676879' }} />
                            <input
                                type="password"
                                value={pw}
                                onChange={e => setPw(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px 10px 10px 36px',
                                    borderRadius: '6px',
                                    border: '1px solid #c3c6d4',
                                    fontSize: '14px'
                                }}
                                placeholder="1234"
                            />
                        </div>
                    </div>

                    {error && <div style={{ color: '#e2445c', fontSize: '13px', textAlign: 'center' }}>{error}</div>}

                    <button
                        type="submit"
                        style={{
                            background: '#0073ea',
                            color: 'white',
                            border: 'none',
                            padding: '12px',
                            borderRadius: '6px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            marginTop: '8px'
                        }}
                    >
                        로그인
                    </button>

                    <button
                        type="button"
                        onClick={() => setIsRegisterOpen(true)}
                        style={{
                            background: 'white',
                            color: '#0073ea',
                            border: '1px solid #d0d4e4',
                            padding: '12px',
                            borderRadius: '6px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            marginTop: '0px'
                        }}
                    >
                        A.T.I. 멤버 가입
                    </button>


                </form>
            </div>

            <RegisterModal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} />
        </div>
    );
}
