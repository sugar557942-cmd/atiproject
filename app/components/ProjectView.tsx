"use client";

import React, { useState } from 'react';
import styles from './ProjectView.module.css';
import { useProject } from '../store/ProjectContext';
import { getDepartmentTheme, getThemeStyles } from '../utils/theme';
import { BoardView } from './BoardView';
import { AnalyticsView } from './AnalyticsView'; // New
import { GanttChart } from './GanttChart';
import { MeetingList } from './MeetingList';
import { Calendar, LayoutDashboard, FileText, PieChart, Users } from 'lucide-react';
import { InviteMemberModal } from './InviteMemberModal';
import { useAuth } from '../store/AuthContext';

// Export ProjectView directly as the content component
import { getProjectStatus, getStatusStyle, getStatusLabel } from '../utils/projectUtils';
import { ProjectEditModal } from './ProjectEditModal';
import { Edit2 } from 'lucide-react';

// Export ProjectView directly as the content component
export function ProjectView() {
    const { project, updateProjectInfo } = useProject();
    // Auth
    const [activeTab, setActiveTab] = useState<'analytics' | 'board' | 'gantt' | 'meetings'>('analytics');
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const themeName = getDepartmentTheme(project.department);
    const themeStyles = getThemeStyles(themeName);

    // Dynamic Status Calculation
    const currentStatus = getProjectStatus(project.startDate, project.endDate);
    const statusStyle = getStatusStyle(currentStatus);
    const statusLabel = getStatusLabel(currentStatus);

    return (
        <div className={styles.container}>
            {/* Header */}
            <header className={styles.header} style={{
                background: themeStyles.background,
                color: themeStyles.color,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
                <div className={styles.titleInfo}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h1 style={{ margin: 0, fontSize: '24px' }}>{project.name}</h1>
                        <button
                            onClick={() => setIsEditOpen(true)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'inherit',
                                opacity: 0.7,
                                display: 'flex',
                                alignItems: 'center',
                                padding: '4px'
                            }}
                            title="프로젝트 정보 수정"
                        >
                            <Edit2 size={16} />
                        </button>
                    </div>

                    <div className={styles.metaRow} style={{ color: 'inherit', opacity: 0.9, marginTop: '8px' }}>
                        <span className={styles.tag} style={{
                            ...statusStyle,
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '600'
                        }}>{statusLabel}</span>
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
                        <Users size={14} />
                        초대하기
                    </button>
                    <button
                        onClick={() => window.print()}
                        style={{
                            background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.4)',
                            padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px'
                        }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        Export
                    </button>
                </div>
            </header>

            {/* Invite Modal */}
            <InviteMemberModal
                isOpen={isInviteOpen}
                onClose={() => setIsInviteOpen(false)}
            />

            {/* Project Edit Modal */}
            <ProjectEditModal
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
            />



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
