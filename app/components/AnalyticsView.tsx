
"use client";

import React, { useState, useEffect } from 'react';
import styles from './AnalyticsView.module.css';
import { useProject } from '../store/ProjectContext';
import {
    PieChart, Pie, Cell, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, Tooltip, Legend
} from 'recharts';
import { CheckCircle2, Clock, AlertCircle, ListTodo, Download, Share2 } from 'lucide-react';
import { DrillDownModal } from './DrillDownModal';
import { InviteMemberModal } from './InviteMemberModal';

export function AnalyticsView({ onNavigate }: { onNavigate?: (tab: 'board', filter?: string) => void }) {
    const { project } = useProject();
    const [mounted, setMounted] = useState(false);

    // Popup State
    const [drillDownData, setDrillDownData] = useState<{ title: string, items: any[] } | null>(null);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // 1. Calculate Summary Stats
    const totalTasks = project.rnrItems.length;
    const workingOnIt = project.rnrItems.filter(i => i.status === 'Working on it').length;
    const stuck = project.rnrItems.filter(i => i.status === 'Stuck').length;
    const done = project.rnrItems.filter(i => i.status === 'Done').length;

    // 2. Prepare Chart Data (Status)
    const statusData = [
        { name: 'Working on it', value: workingOnIt, color: '#fdab3d' },
        { name: 'Done', value: done, color: '#00c875' },
        { name: 'Stuck', value: stuck, color: '#e2445c' },
        { name: 'Empty', value: totalTasks - (workingOnIt + stuck + done), color: '#c4c4c4' },
    ].filter(d => d.value > 0);

    // 3. Prepare Chart Data (By Owner)
    const ownerCounts: Record<string, number> = {};
    project.rnrItems.forEach(item => {
        const owner = item.assignee || 'Unassigned';
        ownerCounts[owner] = (ownerCounts[owner] || 0) + 1;
    });
    const ownerData = Object.keys(ownerCounts).map(name => ({
        name,
        count: ownerCounts[name]
    }));

    // 4. Prepare Chart Data (By Group/Deadline approximation)
    // For MVP, let's show Tasks by Priority
    const priorityCounts: Record<string, number> = {};
    project.rnrItems.forEach(item => {
        const p = item.priority === 'Empty' ? 'No Priority' : item.priority;
        priorityCounts[p] = (priorityCounts[p] || 0) + 1;
    });
    const priorityData = Object.keys(priorityCounts).map(name => ({
        name,
        count: priorityCounts[name]
    }));

    // Handler for Chart Clicks
    const handleChartClick = (type: 'status' | 'owner' | 'priority', key: string) => {
        let items: any[] = [];
        let title = '';

        if (type === 'status') {
            title = `상태: ${key}`;
            if (key === 'Empty') {
                items = project.rnrItems.filter(i => !['Working on it', 'Done', 'Stuck'].includes(i.status));
            } else {
                items = project.rnrItems.filter(i => i.status === key);
            }
        } else if (type === 'owner') {
            title = `담당자: ${key}`;
            const target = key === 'Unassigned' ? '' : key;
            items = project.rnrItems.filter(i => (i.assignee || '') === target);
        } else if (type === 'priority') {
            title = `우선순위: ${key}`;
            const target = key === 'No Priority' ? 'Empty' : key;
            items = project.rnrItems.filter(i => i.priority === target);
        }

        setDrillDownData({ title, items });
    };

    return (
        <div className={styles.container}>
            {/* Drill Down Modal */}
            <DrillDownModal
                isOpen={!!drillDownData}
                onClose={() => setDrillDownData(null)}
                title={drillDownData?.title || ''}
                items={drillDownData?.items || []}
                onNavigate={(itemId) => {
                    // Navigate to Board and highlight/filter would be ideal, 
                    // for now just go to board.
                    if (onNavigate) onNavigate('board');
                    setDrillDownData(null);
                }}
            />

            <InviteMemberModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
            />

            {/* Header / Actions */}
            <div className={styles.header}>
                <h2 className={styles.title}>대시보드 및 보고</h2>
                <div className={styles.actions}>
                    <button className={styles.actionBtn} onClick={() => setIsInviteModalOpen(true)}>
                        <Share2 size={14} /> 초대하기
                    </button>
                    <button className={styles.actionBtnPrimary}>
                        <Download size={14} /> Export
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className={styles.cardsGrid}>
                {/* ... existing cards ... */}
                <div className={styles.card}>
                    <div className={styles.cardIcon} style={{ background: '#e5f4ff', color: '#0073ea' }}>
                        <ListTodo size={24} />
                    </div>
                    <div className={styles.cardContent}>
                        <div className={styles.cardLabel}>모든 태스크</div>
                        <div className={styles.cardValue}>{totalTasks}</div>
                    </div>
                </div>
                <div className={styles.card}>
                    <div className={styles.cardIcon} style={{ background: '#fff0db', color: '#fdab3d' }}>
                        <Clock size={24} />
                    </div>
                    <div className={styles.cardContent}>
                        <div className={styles.cardLabel}>진행 중</div>
                        <div className={styles.cardValue}>{workingOnIt}</div>
                    </div>
                </div>
                <div className={styles.card}>
                    <div className={styles.cardIcon} style={{ background: '#ffe3e6', color: '#e2445c' }}>
                        <AlertCircle size={24} />
                    </div>
                    <div className={styles.cardContent}>
                        <div className={styles.cardLabel}>막힘 (Stuck)</div>
                        <div className={styles.cardValue}>{stuck}</div>
                    </div>
                </div>
                <div className={styles.card}>
                    <div className={styles.cardIcon} style={{ background: '#e3fcef', color: '#00c875' }}>
                        <CheckCircle2 size={24} />
                    </div>
                    <div className={styles.cardContent}>
                        <div className={styles.cardLabel}>완료</div>
                        <div className={styles.cardValue}>{done}</div>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className={styles.chartsGrid}>
                {/* Status Chart */}
                <div className={styles.chartCard}>
                    <div className={styles.chartTitle}>상태별 태스크 (Click to view)</div>
                    <div style={{ height: 300 }}>
                        {mounted ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                        onClick={(data) => handleChartClick('status', data.name)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>
                        )}
                    </div>
                </div>

                {/* Owner Chart */}
                <div className={styles.chartCard}>
                    <div className={styles.chartTitle}>소유자별 태스크 (Click to view)</div>
                    <div style={{ height: 300 }}>
                        {mounted ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={ownerData}>
                                    <XAxis dataKey="name" />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip cursor={{ fill: '#f5f6f8' }} />
                                    <Bar
                                        dataKey="count"
                                        fill="#579bfc"
                                        radius={[4, 4, 0, 0]}
                                        barSize={40}
                                        onClick={(data) => handleChartClick('owner', data.name)}
                                        style={{ cursor: 'pointer' }}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>
                        )}
                    </div>
                </div>

                {/* Priority Chart */}
                <div className={styles.chartCard}>
                    <div className={styles.chartTitle}>우선순위별 태스크 (Click to view)</div>
                    <div style={{ height: 300 }}>
                        {mounted ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={priorityData} layout="vertical">
                                    <XAxis type="number" allowDecimals={false} />
                                    <YAxis dataKey="name" type="category" width={80} />
                                    <Tooltip cursor={{ fill: '#f5f6f8' }} />
                                    <Bar
                                        dataKey="count"
                                        fill="#ffcb00"
                                        radius={[0, 4, 4, 0]}
                                        barSize={20}
                                        onClick={(data) => handleChartClick('priority', data.name)}
                                        style={{ cursor: 'pointer' }}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>
                        )}
                    </div>
                </div>

                {/* Placeholder for Timeline/Deadline */}
                <div className={styles.chartCard}>
                    <div className={styles.chartTitle}>마감일별 태스크 (데모)</div>
                    <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>
                        차트 데이터 준비 중...
                    </div>
                </div>
            </div>
        </div>
    );
}

