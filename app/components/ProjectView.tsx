"use client";

import React, { useState } from 'react';
import styles from './ProjectView.module.css';
import { useProject } from '../store/ProjectContext';
import { getDepartmentTheme, getThemeStyles } from '../utils/theme';
import { BoardView } from './BoardView';
import { AnalyticsView } from './AnalyticsView'; // New
import { GanttChart } from './GanttChart';
import { MeetingList } from './MeetingList';
import { Calendar, LayoutDashboard, FileText, PieChart } from 'lucide-react';

// Export ProjectView directly as the content component
export function ProjectView() {
    const { project, updateProjectInfo } = useProject();
    const [activeTab, setActiveTab] = useState<'analytics' | 'board' | 'gantt' | 'meetings'>('analytics');
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');

    const themeName = getDepartmentTheme(project.department);
    const themeStyles = getThemeStyles(themeName);

    const handleInvite = (e: React.FormEvent) => {
        e.preventDefault();
        if (inviteEmail) {
            alert(`${inviteEmail} 님에게 초대 메일을 보냈습니다.`);
            setInviteEmail('');
            setIsInviteOpen(false);
        }
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <header className={styles.header} style={{
                background: themeStyles.background,
                color: themeStyles.color,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
                <div className={styles.titleInfo}>
                    <input
                        value={project.name}
                        onChange={(e) => updateProjectInfo({ name: e.target.value })}
                        className={styles.projectTitleInput}
                    />
                    <div className={styles.metaRow} style={{ color: 'inherit', opacity: 0.9 }}>
                        <span className={styles.tag} style={{
                            background: 'rgba(255,255,255,0.2)',
                            color: 'inherit',
                            border: '1px solid rgba(255,255,255,0.3)'
                        }}>{project.status}</span>
                        <span className={styles.metaItem}>{project.startDate} ~ {project.endDate}</span>
                        <span className={styles.metaItem}>{project.department}</span>
                    </div>
                </div>

                {/* Header Actions */}
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => setIsInviteOpen(true)}
                        style={{
                            background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.4)',
                            padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px'
                        }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                        초대하기
                    </button>
                    <button
                        onClick={() => window.print()}
                        style={{
                            background: 'white', color: themeStyles.color, border: 'none',
                            padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px'
                        }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        Export
                    </button>
                </div>
            </header>

            {/* Invite Modal */}
            {isInviteOpen && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000,
                    display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                    <div style={{ background: 'white', padding: '24px', borderRadius: '8px', width: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                        <h3 style={{ marginBottom: '16px', fontWeight: 600 }}>멤버 초대하기</h3>
                        <form onSubmit={handleInvite} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <input
                                type="email"
                                placeholder="이메일 주소 입력"
                                value={inviteEmail}
                                onChange={e => setInviteEmail(e.target.value)}
                                style={{ padding: '10px', borderRadius: '4px', border: '1px solid #d0d4e4' }}
                                autoFocus
                            />
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                                <button type="button" onClick={() => setIsInviteOpen(false)} style={{ padding: '8px 16px', background: '#f5f6f8', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>취소</button>
                                <button type="submit" style={{ padding: '8px 16px', background: '#0073ea', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>보내기</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'analytics' ? styles.active : ''}`}
                    onClick={() => setActiveTab('analytics')}
                >
                    <PieChart size={16} /> 대시보드
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'board' ? styles.active : ''}`}
                    onClick={() => setActiveTab('board')}
                >
                    <LayoutDashboard size={16} /> 메인 테이블
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'gantt' ? styles.active : ''}`}
                    onClick={() => setActiveTab('gantt')}
                >
                    <Calendar size={16} /> 프로젝트 일정 (Gantt)
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'meetings' ? styles.active : ''}`}
                    onClick={() => setActiveTab('meetings')}
                >
                    <FileText size={16} /> 회의록
                </button>
            </div>

            {/* Content */}
            <div className={styles.contentArea}>
                {activeTab === 'analytics' && <AnalyticsView onNavigate={(tab) => setActiveTab(tab)} />}
                {activeTab === 'board' && <BoardView />}
                {activeTab === 'gantt' && <GanttChart />}
                {activeTab === 'meetings' && <MeetingList />}
            </div>
        </div>
    );
}

function ProjectContent_Deprecated() { // Removed
    return null;
}
