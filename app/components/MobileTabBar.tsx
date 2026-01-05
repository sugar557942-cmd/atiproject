"use client";

import React from 'react';
import styles from './MobileTabBar.module.css';
import { Home, Folder, ListTodo, Menu } from 'lucide-react';
import { useProject } from '../store/ProjectContext';

interface MobileTabBarProps {
    onOpenMenu: () => void;
}

export function MobileTabBar({ onOpenMenu }: MobileTabBarProps) {
    const { viewMode, setViewMode } = useProject();

    return (
        <div className={styles.tabBar}>
            <button
                className={`${styles.tabItem} ${viewMode === 'home' ? styles.active : ''}`}
                onClick={() => setViewMode('home')}
            >
                <Home size={24} />
                <span className={styles.label}>홈</span>
            </button>

            <button
                className={`${styles.tabItem} ${viewMode === 'project' ? styles.active : ''}`}
                onClick={() => setViewMode('project')}
            >
                <Folder size={24} />
                <span className={styles.label}>프로젝트</span>
            </button>

            <button
                className={`${styles.tabItem} ${viewMode === 'my-work' ? styles.active : ''}`}
                onClick={() => setViewMode('my-work')}
            >
                <ListTodo size={24} />
                <span className={styles.label}>마이 워크</span>
            </button>

            <button
                className={styles.tabItem}
                onClick={onOpenMenu}
            >
                <Menu size={24} />
                <span className={styles.label}>전체</span>
            </button>
        </div>
    );
}
