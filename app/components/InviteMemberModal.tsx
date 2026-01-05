import React, { useState } from 'react';
import { Search, UserPlus, Check, X, Trash2 } from 'lucide-react';
import { useProject, Member } from '../store/ProjectContext';
import styles from './InviteMemberModal.module.css';

// MOCK COMPANY DATABASE
const ALL_USERS: Member[] = [
    { id: 'u1', name: '김철수', role: 'Project Manager', projectRole: 'manager', avatar: '#579bfc', email: 'kim@ati.com' },
    { id: 'u2', name: '이영희', role: 'UX Researcher', projectRole: 'member', avatar: '#ffcb00', email: 'lee@ati.com' },
    { id: 'u3', name: '박지민', role: 'Frontend Dev', projectRole: 'member', avatar: '#00c875', email: 'park@ati.com' },
    { id: 'u4', name: '최디자', role: 'Product Designer', projectRole: 'member', avatar: '#e2445c', email: 'choi@ati.com' },
    { id: 'u5', name: '정백엔', role: 'Backend Dev', projectRole: 'member', avatar: '#784bd1', email: 'jung@ati.com' },
    { id: 'u6', name: '강데옵', role: 'DevOps Engineer', projectRole: 'member', avatar: '#a25ddc', email: 'kang@ati.com' },
];

interface InviteMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function InviteMemberModal({ isOpen, onClose }: InviteMemberModalProps) {
    const { project, addMember, updateMemberRole, removeMember } = useProject();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUsers, setSelectedUsers] = useState<Member[]>([]);

    const currentUserId = 'u1';
    const isManager = project.members.find(m => m.id === currentUserId)?.projectRole === 'manager';

    if (!isOpen) return null;

    const existingMemberIds = project.members.map(m => m.id);

    const searchResults = ALL_USERS.filter(user => {
        const matchesSearch = user.name.includes(searchTerm) || user.role.toLowerCase().includes(searchTerm.toLowerCase());
        const isProjectMember = existingMemberIds.includes(user.id);
        return matchesSearch && !isProjectMember;
    });

    const toggleSelection = (user: Member) => {
        if (selectedUsers.some(u => u.id === user.id)) {
            setSelectedUsers(prev => prev.filter(u => u.id !== user.id));
        } else {
            setSelectedUsers(prev => [...prev, user]);
        }
    };

    const handleConfirm = () => {
        selectedUsers.forEach(user => {
            addMember(project.id, user);
        });
        setSelectedUsers([]);
        onClose();
    };

    const handleCancel = () => {
        setSelectedUsers([]);
        onClose();
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                {/* Header with Confirm/Cancel Buttons */}
                <div className={styles.header}>
                    <h2 className={styles.title}>팀원 초대하기</h2>
                    <div className={styles.headerActions}>
                        <button onClick={handleCancel} className={styles.cancelBtn}>
                            취소
                        </button>
                        <button
                            onClick={handleConfirm}
                            className={styles.confirmBtn}
                            disabled={selectedUsers.length === 0}
                        >
                            확인 ({selectedUsers.length})
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className={styles.searchContainer}>
                    <div className={styles.searchBox}>
                        <Search size={18} color="#676879" />
                        <input
                            type="text"
                            placeholder="이름 또는 역할로 검색하세요..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={styles.searchInput}
                            autoFocus
                        />
                    </div>
                </div>

                {/* Results List */}
                <div className={styles.resultsList}>
                    {searchTerm && searchResults.length === 0 ? (
                        <div className={styles.emptyState}>
                            검색 결과가 없습니다.
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {(searchTerm ? searchResults : ALL_USERS.filter(u => !existingMemberIds.includes(u.id))).map(user => {
                                const isSelected = selectedUsers.some(u => u.id === user.id);
                                return (
                                    <div key={user.id}
                                        onClick={() => toggleSelection(user)}
                                        className={`${styles.userItem} ${isSelected ? styles.selected : ''}`}
                                    >
                                        <div className={styles.userInfo}>
                                            <div className={styles.avatar} style={{ background: user.avatar }}>
                                                {user.name[0]}
                                            </div>
                                            <div className={styles.userDetails}>
                                                <div>{user.name}</div>
                                                <div>{user.role} • {user.email}</div>
                                            </div>
                                        </div>

                                        <div className={styles.checkCircle}>
                                            {isSelected && <Check size={14} />}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* New Members Preview (Bottom Bar) */}
                {(selectedUsers.length > 0 || project.members.length > 0) && (
                    <div className={styles.footer}>
                        <div style={{ fontSize: '12px', color: '#676879', marginBottom: '8px' }}>
                            프로젝트 멤버 ({project.members.length}명) + <span>추가 대기 ({selectedUsers.length}명)</span>
                        </div>

                        {/* Member List with Roles */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '150px', overflowY: 'auto' }}>
                            {project.members.map(m => (
                                <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div className={styles.avatar} style={{ width: '24px', height: '24px', fontSize: '11px', background: m.avatar }}>
                                            {m.name[0]}
                                        </div>
                                        <span>{m.name}</span>
                                        <span style={{
                                            fontSize: '11px', padding: '2px 6px', borderRadius: '4px',
                                            background: m.projectRole === 'manager' ? '#e5f4ff' : (m.projectRole === 'sub-manager' ? '#fff0db' : '#f5f6f8'),
                                            color: m.projectRole === 'manager' ? '#0073ea' : (m.projectRole === 'sub-manager' ? '#fdab3d' : '#676879')
                                        }}>
                                            {m.projectRole === 'manager' ? '관리자' : (m.projectRole === 'sub-manager' ? '부관리자' : '멤버')}
                                        </span>
                                    </div>

                                    {/* Role Management Dropdown (Only for Manager) */}
                                    {isManager && m.projectRole !== 'manager' && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <select
                                                value={m.projectRole}
                                                onChange={(e) => updateMemberRole(project.id, m.id, e.target.value as any)}
                                                style={{ fontSize: '12px', padding: '2px', border: '1px solid #d0d4e4', borderRadius: '4px' }}
                                            >
                                                <option value="member">멤버</option>
                                                <option value="sub-manager">부관리자</option>
                                            </select>
                                            <button
                                                onClick={() => {
                                                    if (window.confirm(`${m.name}님을 프로젝트에서 제외하시겠습니까?`)) {
                                                        removeMember(project.id, m.id);
                                                    }
                                                }}
                                                style={{
                                                    background: 'none', border: 'none', cursor: 'pointer',
                                                    padding: '4px', color: '#ff4d4f', display: 'flex', alignItems: 'center'
                                                }}
                                                title="팀원 제외"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
