import React, { useState } from 'react';
import { Users, Building2 } from 'lucide-react';
import { UserApprovalSection } from './UserApprovalSection';
import { DepartmentManager } from './DepartmentManager';

export function AdminSettingsView() {
    const [activeTab, setActiveTab] = useState<'users' | 'dept'>('users');

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'white', borderLeft: '1px solid #e6e9ef' }}>
            {/* Header */}
            <div style={{ padding: '24px', borderBottom: '1px solid #e6e9ef' }}>
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>관리자 설정</h2>
                <p style={{ margin: '8px 0 0 0', color: '#676879', fontSize: '14px' }}>
                    사용자 가입 승인 및 프로젝트 부서를 관리합니다.
                </p>
            </div>

            {/* Tabs */}
            <div style={{ padding: '0 24px', borderBottom: '1px solid #e6e9ef', display: 'flex', gap: '24px' }}>
                <button
                    onClick={() => setActiveTab('users')}
                    style={{
                        padding: '16px 0',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'users' ? '2px solid #0073ea' : '2px solid transparent',
                        color: activeTab === 'users' ? '#0073ea' : '#676879',
                        fontWeight: activeTab === 'users' ? 600 : 400,
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '8px'
                    }}
                >
                    <Users size={18} />
                    사용자 승인
                </button>
                <button
                    onClick={() => setActiveTab('dept')}
                    style={{
                        padding: '16px 0',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'dept' ? '2px solid #0073ea' : '2px solid transparent',
                        color: activeTab === 'dept' ? '#0073ea' : '#676879',
                        fontWeight: activeTab === 'dept' ? 600 : 400,
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '8px'
                    }}
                >
                    <Building2 size={18} />
                    부서 관리
                </button>
            </div>

            {/* Content */}
            <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
                {activeTab === 'users' ? (
                    <UserApprovalSection />
                ) : (
                    <DepartmentManager />
                )}
            </div>
        </div>
    );
}
