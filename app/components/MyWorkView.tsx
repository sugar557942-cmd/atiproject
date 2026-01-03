"use client";

import React, { useMemo, useState } from 'react';
import styles from './MyWorkView.module.css';
import { useProject, RnRItem } from '../store/ProjectContext';
import { useAuth } from '../store/AuthContext';
import {
    CheckCircle2, Clock, Calendar, AlertCircle,
    ChevronDown, ChevronRight, User as UserIcon
} from 'lucide-react';

// Helper to calculate date difference in days
const getDaysDiff = (dateStr: string) => {
    if (!dateStr) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Helper for date formatting (MM월 dd일)
const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
};

export function MyWorkView() {
    const { projects, updateRnRItem } = useProject();
    const { user } = useAuth();
    const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

    // Collect all tasks assigned to the current user across ALL projects
    const myTasks = useMemo(() => {
        if (!user) return [];
        const tasks: (RnRItem & { projectName: string })[] = [];

        projects.forEach(project => {
            project.rnrItems.forEach(item => {
                if (item.assignee === user.name) {
                    tasks.push({ ...item, projectName: project.name });
                }
            });
        });
        return tasks;
    }, [projects, user]);

    // Group tasks by Date logic
    const groupedTasks = useMemo(() => {
        const groups = {
            overdue: [] as typeof myTasks,
            today: [] as typeof myTasks,
            thisWeek: [] as typeof myTasks,
            nextWeek: [] as typeof myTasks,
            later: [] as typeof myTasks,
            noDate: [] as typeof myTasks
        };

        myTasks.forEach(task => {
            const diff = getDaysDiff(task.endDate);

            if (!task.endDate) {
                groups.noDate.push(task);
            } else if (diff === null) {
                groups.noDate.push(task);
            } else if (diff < 0) {
                if (task.status !== 'Done') groups.overdue.push(task);
                else groups.today.push(task); // Completed past tasks shown in today or separate? Let's hide or put in separate? 
                // Logic update: "My Work" usually focuses on pending. 
                // But users might want to see what they did. 
                // For now, let's just categorize by date regardless of status, 
                // BUT typically overdue is only for unfinished.
            } else if (diff === 0) {
                groups.today.push(task);
            } else if (diff <= 7) {
                groups.thisWeek.push(task);
            } else if (diff <= 14) {
                groups.nextWeek.push(task);
            } else {
                groups.later.push(task);
            }
        });

        // Clean up Overdue: only show if not Done
        groups.overdue = groups.overdue.filter(t => t.status !== 'Done');

        return groups;
    }, [myTasks]);

    const toggleGroup = (groupKey: string) => {
        setCollapsedGroups(prev => ({ ...prev, [groupKey]: !prev[groupKey] }));
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const colors: Record<string, string> = {
            'Working on it': '#fdab3d',
            'Done': '#00c875',
            'Stuck': '#e2445c',
            'Empty': '#c4c4c4'
        };
        const bg = colors[status] || '#c4c4c4';
        return (
            <div style={{ backgroundColor: bg, color: 'white', padding: '4px 12px', borderRadius: '4px', fontSize: '12px', textAlign: 'center', minWidth: '80px' }}>
                {status === 'Empty' ? '-' : status}
            </div>
        );
    };

    const renderGroup = (title: string, items: typeof myTasks, groupKey: string, icon: React.ReactNode) => {
        if (items.length === 0) return null;
        const isCollapsed = collapsedGroups[groupKey];

        return (
            <div className={styles.groupContainer}>
                <div className={styles.groupHeader} onClick={() => toggleGroup(groupKey)}>
                    <button className={styles.collapseBtn}>
                        {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                    </button>
                    <div className={styles.groupTitleInfo}>
                        <span className={styles.groupIcon}>{icon}</span>
                        <span className={styles.groupTitle}>{title}</span>
                        <span className={styles.groupCount}>{items.length}개의 아이템</span>
                    </div>
                </div>

                {!isCollapsed && (
                    <div className={styles.table}>
                        {/* Table Header - Only show for first group? Or each? usually each in Monday */}
                        <div className={styles.row} style={{ background: '#f5f6f8', borderBottom: '1px solid #d0d4e4', fontWeight: 600 }}>
                            <div className={styles.cellMain}>테스크</div>
                            <div className={styles.cell}>프로젝트</div>
                            <div className={styles.cell}>상태</div>
                            <div className={styles.cell}>마감일</div>
                            <div className={styles.cell}>우선순위</div>
                        </div>
                        {items.map(item => (
                            <div key={item.id} className={styles.row}>
                                <div className={styles.cellMain} style={{ borderLeft: `6px solid ${item.status === 'Done' ? '#00c875' : '#fdab3d'}` }}>
                                    {item.name}
                                </div>
                                <div className={styles.cell} style={{ color: '#676879' }}>
                                    {item.projectName}
                                </div>
                                <div className={styles.cell}>
                                    <StatusBadge status={item.status} />
                                </div>
                                <div className={styles.cell}>
                                    {formatDate(item.endDate)}
                                </div>
                                <div className={styles.cell}>
                                    {item.priority}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    if (!user) return <div>로그인이 필요합니다.</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerTop}>
                    <h1>마이 워크</h1>
                    <div style={{ fontSize: '14px', color: '#676879' }}>
                        {user.name}님에게 할당된 업무입니다.
                    </div>
                </div>
            </div>

            <div className={styles.content}>
                {renderGroup('지난 날짜 (Overdue)', groupedTasks.overdue, 'overdue', <AlertCircle size={16} color="#e2445c" />)}
                {renderGroup('오늘', groupedTasks.today, 'today', <CheckCircle2 size={16} color="#00c875" />)}
                {renderGroup('이번 주', groupedTasks.thisWeek, 'thisWeek', <Calendar size={16} color="#579bfc" />)}
                {renderGroup('다음 주', groupedTasks.nextWeek, 'nextWeek', <Calendar size={16} color="#a25ddc" />)}
                {renderGroup('다가올 할 일', groupedTasks.later, 'later', <Clock size={16} color="#ffcb00" />)}
                {renderGroup('날짜 없음', groupedTasks.noDate, 'noDate', <AlertCircle size={16} color="#c4c4c4" />)}
            </div>
        </div>
    );
}
