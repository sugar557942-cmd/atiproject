"use client";

import React, { useMemo } from 'react';
import { useProject } from '../store/ProjectContext';
import { Folder, AlertCircle, CheckCircle2, Clock, Layout } from 'lucide-react';

import styles from './HomeDashboard.module.css';

export function HomeDashboard() {
    const { projects, setViewMode, switchProject } = useProject();

    // Global Stats Calculation
    const stats = useMemo(() => {
        let totalProjects = projects.length;
        let totalTasks = 0;
        let activeTasks = 0;
        let issueTasks = 0; // Stuck or specific priority? using 'Stuck' status

        projects.forEach(p => {
            p.rnrItems.forEach(item => {
                totalTasks++;
                if (item.status === 'Working on it') activeTasks++;
                if (item.status === 'Stuck') issueTasks++;
            });
        });

        return { totalProjects, totalTasks, activeTasks, issueTasks };
    }, [projects]);

    return (
        <div className={styles.container}>
            {/* Top Half: Company Image */}
            <div className={styles.heroSection}>
                <div>
                    <h1 className={styles.title}>ATI Project Platform</h1>
                    <p className={styles.subtitle}>Efficient Project Management & Collaboration</p>
                </div>
                {/* Decorative overlay or real image if provided */}
                <div className={styles.overlayBottom} />
            </div>

            {/* Bottom Half: Summary */}
            <div className={styles.summarySection}>
                <h2 className={styles.sectionTitle}>
                    전체 현황 요약
                </h2>

                <div className={styles.grid}>
                    {/* Stat Cards */}
                    <div className={styles.card}>
                        <div className={styles.cardIcon} style={{ background: '#e5f4ff', color: '#0073ea' }}>
                            <Folder size={24} />
                        </div>
                        <div>
                            <div className={styles.cardLabel}>진행 중인 프로젝트</div>
                            <div className={styles.cardValue}>{stats.totalProjects}</div>
                        </div>
                    </div>

                    <div className={styles.card}>
                        <div className={styles.cardIcon} style={{ background: '#fff0db', color: '#fdab3d' }}>
                            <Clock size={24} />
                        </div>
                        <div>
                            <div className={styles.cardLabel}>진행 중인 태스크</div>
                            <div className={styles.cardValue}>{stats.activeTasks}</div>
                        </div>
                    </div>

                    <div className={styles.card}>
                        <div className={styles.cardIcon} style={{ background: '#ffe4e8', color: '#e2445c' }}>
                            <AlertCircle size={24} />
                        </div>
                        <div>
                            <div className={styles.cardLabel}>이슈 (Stuck)</div>
                            <div className={styles.cardValue}>{stats.issueTasks}</div>
                        </div>
                    </div>

                    <div className={styles.card}>
                        <div className={styles.cardIcon} style={{ background: '#dcfce7', color: '#00c875' }}>
                            <Layout size={24} />
                        </div>
                        <div>
                            <div className={styles.cardLabel}>총 태스크</div>
                            <div className={styles.cardValue}>{stats.totalTasks}</div>
                        </div>
                    </div>
                </div>

                {/* Major Issues or Recent Activity Snippet - User asked for "Major Issues" */}
                {stats.issueTasks > 0 && (
                    <div className={styles.issueSection}>
                        <h3 className={styles.issueHeader}>
                            <AlertCircle size={18} color="#e2445c" /> 주요 이슈 (Stuck Items)
                        </h3>
                        <div className={styles.issueList}>
                            {projects.map(p =>
                                p.rnrItems.filter(i => i.status === 'Stuck').map(item => (
                                    <div key={item.id} className={styles.issueItem}>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <span className={styles.issueName}>{item.name}</span>
                                            <span className={styles.issueProject}>{p.name}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <span style={{ fontSize: '13px', color: '#676879' }}>{item.assignee}</span>
                                            <button
                                                onClick={() => { switchProject(p.id); setViewMode('project'); }}
                                                className={styles.actionBtn}
                                            >
                                                바로가기 &gt;
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
