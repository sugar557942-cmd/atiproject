"use client";

import React, { useState } from 'react';
import styles from './BoardView.module.css';
import { useProject, RnRItem } from '../store/ProjectContext';
import { Plus, ChevronDown, ChevronRight, User, MoreHorizontal, Calendar, Info, Search, Filter, ArrowUpDown, CircleUser } from 'lucide-react';

import { FileManageModal } from './FileManageModal';
import { Paperclip } from 'lucide-react';

export function BoardView() {
    const { project, addRnRItem, addGroup, updateRnRItem } = useProject(); // Added updateRnRItem
    const [searchTerm, setSearchTerm] = useState('');
    const [fileModalItem, setFileModalItem] = useState<RnRItem | null>(null);

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
                    <button className={styles.filterBtn}><User size={16} /> 사람</button>
                    <button className={styles.filterBtn}><Filter size={16} /> 필터</button>
                    <button className={styles.filterBtn}><ArrowUpDown size={16} /> 정렬</button>
                </div>
                <div className={styles.actionsRight}>
                    <button className={styles.iconBtn}><MoreHorizontal size={18} /></button>
                </div>
            </div>

            {/* Board Content */}
            <div className={styles.boardContent}>
                {project.groups.map(groupName => (
                    <BoardGroup key={groupName} groupName={groupName} onOpenFile={(item) => setFileModalItem(item)} />
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

function BoardGroup({ groupName, onOpenFile }: { groupName: string, onOpenFile: (item: RnRItem) => void }) {
    const { project, updateRnRItem, deleteRnRItem, addRnRItem } = useProject();
    const [collapsed, setCollapsed] = useState(false);

    // Filter items for this group
    const items = project.rnrItems.filter(item => item.group === groupName);

    // Color based on group name (simple hash or preset)
    const groupColor = groupName === '완료됨' ? '#00c875' : '#579bfc';

    // Hierarchy Logic
    const rootItems = items.filter(i => !i.parentId && i.level === 1);

    const renderHierarchy = (parentId: string | null, level: number) => {
        // Find children for this parent (within this group)
        // Note: Cross-group parenting is edge case; assuming children stay in same group for now
        const children = items.filter(i => i.parentId === parentId);

        if (level === 1) {
            // Level 1: Iterate roots
            return rootItems.map(root => (
                <React.Fragment key={root.id}>
                    <BoardRow item={root} groupColor={groupColor} hasChildren={items.some(i => i.parentId === root.id)} onOpenFile={onOpenFile} />
                    {!root.collapsed && renderHierarchy(root.id, level + 1)}
                </React.Fragment>
            ));
        }

        // Level 2 & 3: Iterate children of passed parent
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
                    {/* Table Header */}
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

                    {/* Hierarchy Rows */}
                    {renderHierarchy(null, 1)}

                    {/* Add Row Input */}
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

                    {/* Footer / Summary */}
                    <div className={styles.groupFooter}>
                        <div className={styles.thName}></div>
                        <div className={styles.thOwner}></div>
                        <div className={styles.thStatus}>
                            <div className={styles.progressBar}>
                                <div className={styles.progressFill} style={{ width: '60%', background: '#fdab3d' }}></div>
                                <div className={styles.progressFill} style={{ width: '40%', background: '#00c875' }}></div>
                            </div>
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
    const { updateRnRItem, addRnRItem, toggleCollapse } = useProject();

    // Mapping for colors
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

    // Indentation Style
    const borderLeftColor = item.level === 1 ? groupColor : 'transparent';
    const paddingLeft = (item.level - 1) * 24 + 10;

    // Sub-item connector visual (simple approximation)
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
                {/* Visual Connector for Levels 2,3 */}
                {item.level > 1 && <div style={connectorStyle}></div>}

                <div style={{ marginLeft: `${item.level > 1 ? paddingLeft : 0}px`, display: 'flex', alignItems: 'center', width: '100%' }}>
                    {/* Collapse/Expand for Parent */}
                    {(item.level < 3) && (
                        <button
                            className={styles.rowActionBtn}
                            onClick={() => toggleCollapse(item.id)}
                            style={{ opacity: hasChildren ? 1 : 0.3, marginRight: 4 }}
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

                    {/* Add Sub-item Btn (hover only usually, but visible for now) */}
                    {item.level < 3 && (
                        <button
                            className={styles.addSubBtn}
                            onClick={() => addRnRItem(item.id, (item.level + 1) as any, item.group)}
                            title="하위 태스크 추가"
                        >
                            <Plus size={12} />
                        </button>
                    )}
                </div>
            </div>
            <div className={styles.cellOwner}>
                <div className={styles.avatar} title={item.assignee}>
                    {item.assignee ? item.assignee.charAt(0) : <User size={14} />}
                </div>
            </div>
            <div
                className={styles.cellStatus}
                style={{ backgroundColor: getStatusColor(item.status) }}
                onClick={() => {
                    // Simple rotation for demo. Real app needs dropdown.
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
