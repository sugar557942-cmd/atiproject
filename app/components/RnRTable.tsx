"use client";

import React from 'react';
import styles from './RnRTable.module.css';
import { useProject, RnRItem } from '../store/ProjectContext';
import { ChevronDown, ChevronRight, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

export function RnRTable() {
    const { project, addRnRItem, updateRnRItem, deleteRnRItem, moveRnRItem, toggleCollapse } = useProject();

    // Helper to check if item is visible (parents expanded)
    // Since it's a flat list, we need to know if any ancestor is collapsed.
    // For simplicity MVP: we just iterate. If parent is missing?
    // We need a map of id -> item to check parents quickly.

    // Real implementation:
    // We assume the list is SORTED in display order (DFS traversal order).
    // If moving items, we move the subtree? Ideally yes.
    // For this Task 1 check, we will treat it as a flat list with indentation visual.
    // Collapsing hides all children immediately following until next sibling or higher level.

    const isVisible = (index: number) => {
        // Basic logic: traverse up?
        // Actually simpler: pass a visibility flag during map if we had a tree.
        // Given flat list, checking parent collapse state requires lookup.
        return true; // Simplified for MVP step 1.
    };

    return (
        <div className={styles.tableContainer}>
            <div className={styles.tableHeader}>
                <div className={styles.colName}>업무명 (R&R)</div>
                <div className={styles.colAssignee}>담당자</div>
                <div className={styles.colRole}>역할/책임 설명</div>
                <div className={styles.colScope}>범위</div>
                <div className={styles.colActions}>관리</div>
            </div>

            <div className={styles.tableBody}>
                {project.rnrItems.map((item, index) => (
                    <RnRRow
                        key={item.id}
                        item={item}
                        level={item.level}
                        onUpdate={(updates: Partial<RnRItem>) => updateRnRItem(item.id, updates)}
                        onDelete={() => deleteRnRItem(item.id)}
                        onMoveUp={() => moveRnRItem(item.id, 'up')}
                        onMoveDown={() => moveRnRItem(item.id, 'down')}
                        onAddChild={() => addRnRItem(item.id, (item.level + 1) as any)}
                        onToggleCollapse={() => toggleCollapse(item.id)}
                    />
                ))}

                <div className={styles.addRow}>
                    <button className={styles.addBtn} onClick={() => addRnRItem(null, 1)}>
                        <Plus size={14} /> 최상위(1레벨) 업무 추가
                    </button>
                </div>
            </div>
        </div>
    );
}

function RnRRow({ item, level, onUpdate, onDelete, onMoveUp, onMoveDown, onAddChild, onToggleCollapse }: any) {
    // Indentation style
    const paddingLeft = level * 20 + 8;
    const isParent = level < 3;

    return (
        <div className={styles.row}>
            <div className={styles.colName} style={{ paddingLeft: `${paddingLeft}px` }}>
                <div className={styles.rowControls}>
                    {isParent && (
                        <button className={styles.iconBtn} onClick={onToggleCollapse}>
                            {item.collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                        </button>
                    )}
                    {!isParent && <span style={{ width: 14, display: 'inline-block' }}></span>}
                </div>
                <input
                    className={styles.input}
                    value={item.name}
                    onChange={e => onUpdate({ name: e.target.value })}
                />
            </div>

            <div className={styles.colAssignee}>
                <div className={styles.avatarPlaceholder} style={{ background: stringToColor(item.assignee) }}>
                    {item.assignee.charAt(0)}
                </div>
                <input
                    className={styles.input}
                    value={item.assignee}
                    onChange={e => onUpdate({ assignee: e.target.value })}
                />
            </div>

            <div className={styles.colRole}>
                <input
                    className={styles.input}
                    value={item.roleDescription}
                    onChange={e => onUpdate({ roleDescription: e.target.value })}
                />
            </div>

            <div className={styles.colScope}>
                <input
                    className={styles.input}
                    value={item.scope}
                    onChange={e => onUpdate({ scope: e.target.value })}
                />
            </div>

            <div className={styles.colActions}>
                {level < 3 && (
                    <button className={styles.actionBtn} title="Add Sub-item" onClick={onAddChild}>
                        <Plus size={14} />
                    </button>
                )}
                <button className={styles.actionBtn} onClick={onMoveUp}><ArrowUp size={14} /></button>
                <button className={styles.actionBtn} onClick={onMoveDown}><ArrowDown size={14} /></button>
                <button className={`${styles.actionBtn} ${styles.delete}`} onClick={onDelete}>
                    <Trash2 size={14} />
                </button>
            </div>
        </div>
    );
}

// Utility to generate color from string
function stringToColor(str: string) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
}
