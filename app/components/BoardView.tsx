"use client";

import React, { useState } from 'react';
import styles from './BoardView.module.css';
import { useProject, RnRItem } from '../store/ProjectContext';
import { Plus, ChevronDown, ChevronRight, User, MoreHorizontal, Calendar, Info, Search, Filter, ArrowUpDown, CircleUser } from 'lucide-react';

import { FileManageModal } from './FileManageModal';
import { Paperclip } from 'lucide-react';

import { Trash2 } from 'lucide-react'; // Added Trash2

export function BoardView() {
    const { project, addRnRItem, addGroup, updateRnRItem } = useProject();
    const [searchTerm, setSearchTerm] = useState('');
    const [fileModalItem, setFileModalItem] = useState<RnRItem | null>(null);

    // Filter & Sort State
    const [filterStatus, setFilterStatus] = useState<string | null>(null); // Simple single filter for demo
    const [filterPriority, setFilterPriority] = useState<string | null>(null);
    const [sortKey, setSortKey] = useState<'status' | 'priority' | 'endDate' | null>(null);
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

    // Advanced Filter UI State
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);

    const toggleSort = (key: 'status' | 'priority' | 'endDate') => {
        if (sortKey === key) {
            setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDir('asc');
        }
    };

    return (
        <div className={styles.boardContainer}>
            {/* Toolbar */}
            <div className={styles.toolbar}>
                <div className={styles.actionsLeft}>
                    <button className={styles.newActionBtn} onClick={() => addRnRItem(null, 1)}>
                        새로운 태스크 <ChevronDown size={14} />
                    </button>
                    <div className={styles.searchBox}>
                        <Search size={16} className={styles.searchIcon} />
                        <input
                            placeholder="검색"
                            className={styles.searchInput}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {/* Removed People Button */}

                    <div style={{ position: 'relative' }}>
                        <button
                            className={`${styles.filterBtn} ${isFilterOpen ? styles.active : ''}`}
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                        >
                            <Filter size={16} /> 필터
                        </button>
                        {isFilterOpen && (
                            <div style={{
                                position: 'absolute', top: '100%', left: 0, background: 'white',
                                border: '1px solid #ddd', borderRadius: '8px', padding: '12px', zIndex: 100,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)', minWidth: '200px'
                            }}>
                                <div style={{ marginBottom: '8px', fontWeight: 600, fontSize: '13px' }}>상태</div>
                                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '12px' }}>
                                    {['Working on it', 'Done', 'Stuck', 'Empty'].map(st => (
                                        <button key={st}
                                            onClick={() => setFilterStatus(filterStatus === st ? null : st)}
                                            style={{
                                                padding: '4px 8px', borderRadius: '4px', fontSize: '12px',
                                                background: filterStatus === st ? '#0073ea' : '#f0f0f0',
                                                color: filterStatus === st ? 'white' : '#333', border: 'none', cursor: 'pointer'
                                            }}
                                        >
                                            {st}
                                        </button>
                                    ))}
                                </div>

                                <div style={{ marginBottom: '8px', fontWeight: 600, fontSize: '13px' }}>우선순위</div>
                                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                    {['High', 'Medium', 'Low', 'Empty'].map(pr => (
                                        <button key={pr}
                                            onClick={() => setFilterPriority(filterPriority === pr ? null : pr)}
                                            style={{
                                                padding: '4px 8px', borderRadius: '4px', fontSize: '12px',
                                                background: filterPriority === pr ? '#0073ea' : '#f0f0f0',
                                                color: filterPriority === pr ? 'white' : '#333', border: 'none', cursor: 'pointer'
                                            }}
                                        >
                                            {pr}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div style={{ position: 'relative' }}>
                        <button
                            className={styles.filterBtn}
                            onClick={() => setIsSortOpen(!isSortOpen)}
                        >
                            <ArrowUpDown size={16} /> 정렬
                        </button>
                        {isSortOpen && (
                            <div style={{
                                position: 'absolute', top: '100%', left: 0, background: 'white',
                                border: '1px solid #ddd', borderRadius: '8px', padding: '8px', zIndex: 100,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)', minWidth: '150px',
                                display: 'flex', flexDirection: 'column', gap: '4px'
                            }}>
                                <button onClick={() => toggleSort('status')} style={{ background: sortKey === 'status' ? '#eef' : 'white', border: 'none', textAlign: 'left', padding: '6px', fontSize: '13px', cursor: 'pointer', borderRadius: '4px' }}>
                                    상태 {sortKey === 'status' && (sortDir === 'asc' ? '↑' : '↓')}
                                </button>
                                <button onClick={() => toggleSort('priority')} style={{ background: sortKey === 'priority' ? '#eef' : 'white', border: 'none', textAlign: 'left', padding: '6px', fontSize: '13px', cursor: 'pointer', borderRadius: '4px' }}>
                                    우선순위 {sortKey === 'priority' && (sortDir === 'asc' ? '↑' : '↓')}
                                </button>
                                <button onClick={() => toggleSort('endDate')} style={{ background: sortKey === 'endDate' ? '#eef' : 'white', border: 'none', textAlign: 'left', padding: '6px', fontSize: '13px', cursor: 'pointer', borderRadius: '4px' }}>
                                    마감일 {sortKey === 'endDate' && (sortDir === 'asc' ? '↑' : '↓')}
                                </button>
                                <div style={{ borderTop: '1px solid #eee', marginTop: '4px', paddingTop: '4px' }}>
                                    <button onClick={() => { setSortKey(null); setIsSortOpen(false); }} style={{ background: 'white', border: 'none', textAlign: 'left', padding: '6px', fontSize: '13px', cursor: 'pointer', color: '#e2445c' }}>
                                        초기화
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className={styles.actionsRight}>
                    <button className={styles.iconBtn}><MoreHorizontal size={18} /></button>
                </div>
            </div>

            {/* Board Content */}
            <div className={styles.boardContent}>
                {project.groups.map(groupName => (
                    <BoardGroup
                        key={groupName}
                        groupName={groupName}
                        onOpenFile={(item) => setFileModalItem(item)}
                        filterStatus={filterStatus}
                        filterPriority={filterPriority}
                        sortKey={sortKey}
                        sortDir={sortDir}
                    />
                ))}

                <div className={styles.addGroupSection}>
                    <button className={styles.btnAddGroup} onClick={() => addGroup('New Group')}>+ 새 그룹 추가하기</button>
                </div>
            </div>

            {/* File Modal */}
            {fileModalItem && (
                <FileManageModal
                    isOpen={!!fileModalItem}
                    onClose={() => setFileModalItem(null)}
                    item={fileModalItem}
                    onSave={(id, files) => updateRnRItem(id, { files })}
                />
            )}
        </div>
    );
}

function BoardGroup({ groupName, onOpenFile, filterStatus, filterPriority, sortKey, sortDir }: {
    groupName: string,
    onOpenFile: (item: RnRItem) => void,
    filterStatus: string | null,
    filterPriority: string | null,
    sortKey: 'status' | 'priority' | 'endDate' | null,
    sortDir: 'asc' | 'desc'
}) {
    const { project, updateRnRItem, deleteRnRItem, addRnRItem } = useProject();
    const [collapsed, setCollapsed] = useState(false);

    // Initial Filter by Group
    let items = project.rnrItems.filter(item => item.group === groupName);

    // Apply Filters
    if (filterStatus) {
        items = items.filter(item => item.status === filterStatus);
    }
    if (filterPriority) {
        items = items.filter(item => item.priority === filterPriority);
    }

    // Apply Sorting (Only logic for flat list mainly, hierarchy complicates specific sort, but we apply to filtered list)
    // Note: Hierarchy sorting is complex. For now, if sort is active, we might flatten or sort roots and children recursively.
    // Let's sort simply by property for now.
    if (sortKey) {
        items.sort((a, b) => {
            const valA = a[sortKey] || '';
            const valB = b[sortKey] || '';
            if (valA < valB) return sortDir === 'asc' ? -1 : 1;
            if (valA > valB) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });
    }

    // Color based on group name
    const groupColor = groupName === '완료됨' ? '#00c875' : '#579bfc';

    // Hierarchy Logic
    // If Filter/Sort is active, hierarchy might be broken visually if parents are filtered out.
    // Enhanced Logic: If filtered, show flat list? Or just filtered items.
    // For simplicity: Simple traversal. If parent missing, it shows as root (due to parentId check in local list).
    // Actually, `rootItems` checks `parentId`. If parent is filtered out, child won't show if we rely on recursive render from parent.
    // Fix: If filter/sort active, render flat list.
    const isFilteredOrSorted = !!filterStatus || !!filterPriority || !!sortKey;

    // If not filtered/sorted, use hierarchy.
    // If filtered/sorted, use flat list.

    const rootItems = isFilteredOrSorted ? items : items.filter(i => !i.parentId && i.level === 1);

    const renderHierarchy = (parentId: string | null, level: number) => {
        if (isFilteredOrSorted) return null; // Logic handled in flat map below

        const children = items.filter(i => i.parentId === parentId);

        // ... (copy previous logic, adapted)
        if (level === 1) {
            return rootItems.map(root => (
                <React.Fragment key={root.id}>
                    <BoardRow item={root} groupColor={groupColor} hasChildren={items.some(i => i.parentId === root.id)} onOpenFile={onOpenFile} />
                    {!root.collapsed && renderHierarchy(root.id, level + 1)}
                </React.Fragment>
            ));
        }

        return children.map(child => (
            <React.Fragment key={child.id}>
                <BoardRow item={child} groupColor={groupColor} hasChildren={items.some(i => i.parentId === child.id)} onOpenFile={onOpenFile} />
                {!child.collapsed && renderHierarchy(child.id, level + 1)}
            </React.Fragment>
        ));
    };

    return (
        <div className={styles.groupContainer}>
            <div className={styles.groupHeader}>
                <div className={styles.groupTitleRow}>
                    <button className={styles.collapseBtn} onClick={() => setCollapsed(!collapsed)}>
                        <ChevronDown size={18} className={collapsed ? styles.rotated : ''} style={{ color: groupColor }} />
                    </button>
                    <h3 className={styles.groupTitle} style={{ color: groupColor }}>{groupName}</h3>
                    <span className={styles.itemCount}>{items.length} 항목</span>
                </div>
            </div>

            {!collapsed && (
                <div className={styles.tableWrapper}>
                    {/* ... Header ... */}
                    <div className={styles.tableHeaderRow}>
                        <div className={styles.thName} style={{ borderLeft: `6px solid ${groupColor}` }}>태스크</div>
                        <div className={styles.thOwner}>소유자</div>
                        <div className={styles.thStatus}>상태 <Info size={12} /></div>
                        <div className={styles.thDate}>마감일 <Info size={12} /></div>
                        <div className={styles.thPriority}>우선순위</div>
                        <div className={styles.thMemo}>메모</div>
                        <div className={styles.thBudget}>예산</div>
                        <div className={styles.thFiles}>파일<Plus size={12} style={{ marginLeft: 4, cursor: 'pointer', opacity: 0.5 }} /></div>
                        <div className={styles.thTimeline}>타임라인</div>
                        <div className={styles.thLastUpdate}>지난 업데이트</div>
                    </div>

                    {/* Hierarchy Rows or Flat List */}
                    {isFilteredOrSorted ? (
                        items.map(item => (
                            <BoardRow key={item.id} item={item} groupColor={groupColor} hasChildren={false} onOpenFile={onOpenFile} />
                        ))
                    ) : (
                        renderHierarchy(null, 1)
                    )}

                    {/* Input Row */}
                    {!isFilteredOrSorted && (
                        <div className={styles.addRowContainer}>
                            <div className={styles.addRowInputWrapper} style={{ borderLeft: `6px solid ${groupColor}40` }}>
                                <input
                                    className={styles.addRowInput}
                                    placeholder="+ 태스크 추가"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            addRnRItem(null, 1, groupName);
                                            (e.target as HTMLInputElement).value = '';
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className={styles.groupFooter}>
                        {/* ... */}
                        <div className={styles.thName}></div>
                        <div className={styles.thOwner}></div>
                        <div className={styles.thStatus}>
                            {/* Summary bars */}
                        </div>
                        <div className={styles.thDate}></div>
                        <div className={styles.thPriority}></div>
                        <div className={styles.thMemo}></div>
                        <div className={styles.thBudget}>
                            <span className={styles.sumText}>${items.reduce((acc, cur) => acc + (cur.budget || 0), 0).toLocaleString()}</span>
                            <span className={styles.sumLabel}>합계</span>
                        </div>
                        <div className={styles.thFiles}></div>
                        <div className={styles.thTimeline}></div>
                        <div className={styles.thLastUpdate}></div>
                    </div>
                </div>
            )}
        </div>
    );
}

function BoardRow({ item, groupColor, hasChildren, onOpenFile }: { item: RnRItem, groupColor: string, hasChildren: boolean, onOpenFile: (item: RnRItem) => void }) {
    const { updateRnRItem, addRnRItem, toggleCollapse, deleteRnRItem } = useProject(); // Added deleteRnRItem

    // ... color helpers ...
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Done': return '#00c875'; // Green
            case 'Working on it': return '#fdab3d'; // Orange
            case 'Stuck': return '#e2445c'; // Red
            default: return '#c4c4c4'; // Grey
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'High': return '#401694'; // Dark Purple
            case 'Medium': return '#5559df'; // Purple
            case 'Low': return '#579bfc'; // Blue
            default: return '#c4c4c4'; // Grey
        }
    };

    const borderLeftColor = item.level === 1 ? groupColor : 'transparent';
    const paddingLeft = (item.level - 1) * 24 + 10;

    const connectorStyle = item.level > 1 ? {
        borderLeft: '2px solid #e6e9ef',
        borderBottom: '2px solid #e6e9ef',
        width: '12px',
        height: '18px',
        position: 'absolute' as const,
        left: `${paddingLeft - 18}px`,
        top: '-10px'
    } : {};

    return (
        <div className={styles.row}>
            <div className={styles.cellName} style={{ borderLeft: `6px solid ${borderLeftColor}`, position: 'relative' }}>
                {item.level > 1 && <div style={connectorStyle}></div>}

                <div style={{ marginLeft: `${item.level > 1 ? paddingLeft : 0}px`, display: 'flex', alignItems: 'center', width: '100%', gap: '4px' }}>
                    {/* Delete Icon (Trash2) - Always visible or hover */}
                    <button
                        className={styles.iconBtn}
                        onClick={() => deleteRnRItem(item.id)}
                        style={{ color: '#e2445c', padding: 2 }}
                        title="삭제"
                    >
                        <Trash2 size={12} />
                    </button>

                    {(item.level < 3) && (
                        <button
                            className={styles.rowActionBtn}
                            onClick={() => toggleCollapse(item.id)}
                            style={{ opacity: hasChildren ? 1 : 0.3 }}
                        >
                            {item.collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                        </button>
                    )}

                    <input
                        className={styles.nameInput}
                        value={item.name}
                        onChange={(e) => updateRnRItem(item.id, { name: e.target.value })}
                        style={{ fontWeight: item.level === 1 ? 500 : 400 }}
                    />
                    {item.level < 3 && (
                        <button
                            className={styles.addSubBtn}
                            onClick={() => addRnRItem(item.id, (item.level + 1) as any, item.group)}
                        >
                            <Plus size={12} />
                        </button>
                    )}
                </div>
            </div>
            {/* ... other cells (Owner, Status, etc) ... */}
            <div className={styles.cellOwner}>
                <div className={styles.avatar} title={item.assignee}>
                    {item.assignee ? item.assignee.charAt(0) : <User size={14} />}
                </div>
            </div>
            <div
                className={styles.cellStatus}
                style={{ backgroundColor: getStatusColor(item.status) }}
                onClick={() => {
                    const next = item.status === 'Working on it' ? 'Done' : item.status === 'Done' ? 'Stuck' : 'Working on it';
                    updateRnRItem(item.id, { status: next });
                }}
            >
                {item.status === 'Empty' ? '' : item.status}
            </div>
            <div className={styles.cellDate}>
                {item.endDate.substring(5)}
            </div>
            <div
                className={styles.cellPriority}
                style={{ backgroundColor: getPriorityColor(item.priority) }}
                onClick={() => {
                    const next = item.priority === 'High' ? 'Medium' : item.priority === 'Medium' ? 'Low' : 'High';
                    updateRnRItem(item.id, { priority: next });
                }}
            >
                {item.priority === 'Empty' ? '' : item.priority}
            </div>
            <div className={styles.cellMemo}>
                <input
                    className={styles.memoInput}
                    value={item.memo}
                    onChange={(e) => updateRnRItem(item.id, { memo: e.target.value })}
                    placeholder="메모..."
                />
            </div>
            <div className={styles.cellBudget}>
                <input
                    type="number"
                    className={styles.budgetInput}
                    value={item.budget || ''}
                    onChange={(e) => updateRnRItem(item.id, { budget: Number(e.target.value) })}
                    placeholder="$0"
                />
            </div>
            <div
                className={styles.cellFiles}
                onClick={() => onOpenFile(item)}
                style={{ cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
                {item.files && item.files.length > 0 ? (
                    <div style={{ background: '#0073ea', color: 'white', borderRadius: '50%', width: 20, height: 20, fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {item.files.length}
                    </div>
                ) : (
                    <Plus size={14} color="#d0d4e4" className="plus-icon" />
                )}
            </div>
            <div className={styles.cellTimeline}>
                <div className={styles.timelineBar} style={{ background: getStatusColor(item.status) }}>
                    <span className={styles.timelineDate}>{item.startDate.substring(5)} - {item.endDate.substring(5)}</span>
                </div>
            </div>
            <div className={styles.cellLastUpdate}>
                <CircleUser size={24} color="#ccc" />
            </div>
        </div>
    );
}
