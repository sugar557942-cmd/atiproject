import React from 'react';
import { useAuth } from '../store/AuthContext';
import { X, Check, XCircle } from 'lucide-react';

interface UserApprovalModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function UserApprovalModal({ isOpen, onClose }: UserApprovalModalProps) {
    const { pendingUsers, approveUser, rejectUser } = useAuth();

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000,
            display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
            <div style={{
                background: 'white', padding: '24px', borderRadius: '12px', width: '600px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.2)', maxHeight: '80vh', overflowY: 'auto',
                display: 'flex', flexDirection: 'column'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #e6e9ef' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>가입 승인 대기 ({pendingUsers.length})</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <X size={20} color="#676879" />
                    </button>
                </div>

                {pendingUsers.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#676879' }}>
                        승인 대기 중인 사용자가 없습니다.
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {pendingUsers.map(user => (
                            <div key={user.id} style={{
                                padding: '16px', border: '1px solid #d0d4e4', borderRadius: '8px',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9fafb'
                            }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <div style={{ fontSize: '15px', fontWeight: 600, color: '#323338' }}>
                                        {user.name} <span style={{ fontSize: '13px', fontWeight: 400, color: '#676879' }}>({user.id})</span>
                                    </div>
                                    <div style={{ fontSize: '13px', color: '#676879' }}>
                                        {user.department || '-'} • {user.email} • {user.birthDate || '-'}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={() => {
                                            if (window.confirm(`${user.name} 님의 가입을 거절하시겠습니까?`)) {
                                                rejectUser(user.id);
                                            }
                                        }}
                                        style={{
                                            padding: '6px 12px', border: '1px solid #e2445c', background: 'white',
                                            borderRadius: '6px', color: '#e2445c', fontSize: '13px', fontWeight: 500,
                                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                                        }}
                                    >
                                        <XCircle size={14} /> 거절
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (window.confirm(`${user.name} 님의 가입을 승인하시겠습니까?`)) {
                                                approveUser(user.id);
                                            }
                                        }}
                                        style={{
                                            padding: '6px 12px', border: 'none', background: '#0073ea',
                                            borderRadius: '6px', color: 'white', fontSize: '13px', fontWeight: 500,
                                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                                        }}
                                    >
                                        <Check size={14} /> 승인
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
