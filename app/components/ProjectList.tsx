"use client";

import React, { useState } from 'react';
import styles from './ProjectList.module.css';
import { useProject } from '../store/ProjectContext';
import { Plus, Folder, Trash2, ListTodo, X } from 'lucide-react';

interface ProjectListProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export function ProjectList({ isOpen, onClose }: ProjectListProps) {
    const { projects, activeProjectId, switchProject, createProject, deleteProject, setViewMode, viewMode } = useProject();
    const [isCreating, setIsCreating] = useState(false);
    const [newName, setNewName] = useState('');
    const [newDept, setNewDept] = useState('');

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (newName && newDept) {
            createProject(newName, newDept);
            setNewName('');
            setNewDept('');
            setIsCreating(false);
        }
    };

    const handleNavigation = (action: () => void) => {
        action();
        if (onClose && window.innerWidth <= 768) {
            onClose();
        }
    };

    return (
        <div className={`${styles.container} ${isOpen ? styles.open : ''}`}>
            <div className={styles.header}>
                <h2 className={styles.title}>내 프로젝트</h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        className={styles.addButton}
                        onClick={() => setIsCreating(!isCreating)}
                    >
                        <Plus size={16} />
                    </button>
                    <button className={styles.closeMobileBtn} onClick={onClose}>
                        <X size={16} />
                    </button>
                </div>
            </div>

            {isCreating && (
                <form onSubmit={handleCreate} className={styles.createForm}>
                    <input
                        placeholder="프로젝트 명"
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        className={styles.input}
                        autoFocus
                    />
                    <input
                        placeholder="부서 (예: 마케팅)"
                        value={newDept}
                        onChange={e => setNewDept(e.target.value)}
                        className={styles.input}
                    />
                    <div className={styles.formActions}>
                        <button type="submit" className={styles.submitBtn}>생성</button>
                        <button type="button" onClick={() => setIsCreating(false)} className={styles.cancelBtn}>취소</button>
                    </div>
                </form>
            )}

            <div className={styles.list}>
                {/* Home Item */}
                <div
                    className={`${styles.item} ${viewMode === 'home' ? styles.active : ''}`}
                    onClick={() => handleNavigation(() => setViewMode('home'))}
                    style={{ marginBottom: '4px' }}
                >
                    <div className={styles.itemContent}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: 4, background: '#323338' }}>
                            <span style={{ color: 'white', fontWeight: 'bold', fontSize: '12px' }}>A</span>
                        </div>
                        <div className={styles.info}>
                            <div className={styles.name} style={{ fontWeight: 600 }}>ATI Home</div>
                        </div>
                    </div>
                </div>

                {/* Sub-menus for ATI Home */}
                <div
                    className={`${styles.item} ${viewMode === 'performance' ? styles.active : ''}`}
                    onClick={() => handleNavigation(() => setViewMode('performance'))}
                    style={{ marginBottom: '2px', paddingLeft: '32px' }}
                >
                    <div className={styles.itemContent}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: viewMode === 'performance' ? '#0073ea' : '#d0d4e4', marginRight: 12 }}></div>
                        <div className={styles.info}>
                            <div className={styles.name} style={{ fontSize: '13px', color: viewMode === 'performance' ? '#0073ea' : '#676879' }}>실적 현황</div>
                        </div>
                    </div>
                </div>

                <div
                    className={`${styles.item} ${viewMode === 'certification' ? styles.active : ''}`}
                    onClick={() => handleNavigation(() => setViewMode('certification'))}
                    style={{ marginBottom: '16px', paddingLeft: '32px' }}
                >
                    <div className={styles.itemContent}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: viewMode === 'certification' ? '#0073ea' : '#d0d4e4', marginRight: 12 }}></div>
                        <div className={styles.info}>
                            <div className={styles.name} style={{ fontSize: '13px', color: viewMode === 'certification' ? '#0073ea' : '#676879' }}>인증현황</div>
                        </div>
                    </div>
                </div>

                {/* My Work Item */}
                <div
                    className={`${styles.item} ${viewMode === 'my-work' ? styles.active : ''}`}
                    onClick={() => handleNavigation(() => setViewMode('my-work'))}
                    style={{ marginBottom: '16px' }}
                >
                    <div className={styles.itemContent}>
                        <ListTodo size={16} className={styles.icon} color="#0073ea" />
                        <div className={styles.info}>
                            <div className={styles.name} style={{ fontWeight: 600 }}>마이 워크</div>
                            <div className={styles.dept} style={{ fontSize: '11px' }}>모든 업무 모아보기</div>
                        </div>
                    </div>
                </div>

                <div className={styles.divider} style={{ height: 1, background: '#e6e9ef', margin: '0 8px 16px 8px' }}></div>

                {projects.map(p => (
                    <div
                        key={p.id}
                        className={`${styles.item} ${viewMode === 'project' && p.id === activeProjectId ? styles.active : ''}`}
                        onClick={() => handleNavigation(() => {
                            switchProject(p.id);
                            setViewMode('project');
                        })}
                    >
                        <div className={styles.itemContent}>
                            <Folder size={16} className={styles.icon} />
                            <div className={styles.info}>
                                <div className={styles.name}>{p.name}</div>
                                <div className={styles.dept}>{p.department}</div>
                            </div>
                        </div>
                        {projects.length > 1 && (
                            <button
                                className={styles.deleteBtn}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm('정말 삭제하시겠습니까?')) deleteProject(p.id);
                                }}
                            >
                                <Trash2 size={14} />
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
