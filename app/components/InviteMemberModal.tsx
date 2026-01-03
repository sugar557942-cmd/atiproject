import React, { useState } from 'react';
import { Search, UserPlus, Check, X, Trash2 } from 'lucide-react'; // Added X for consistency if needed, but user wants buttons
import { useProject, Member } from '../store/ProjectContext';

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

    // Mock Current User Check (Ideally from AuthContext, but using ProjectContext manager check for UI demo)
    // Assume we are 'u1' (Kim) for this demo, or we can simply check if the *viewer* has permission.
    // Let's assume the current user is 'u1'.
    const currentUserId = 'u1';
    const isManager = project.members.find(m => m.id === currentUserId)?.projectRole === 'manager';



    if (!isOpen) return null;

    // Filter Logic:
    // 1. Must match search term
    // 2. Must NOT be already in the project (Context)
    const existingMemberIds = project.members.map(m => m.id);

    const searchResults = ALL_USERS.filter(user => {
        const matchesSearch = user.name.includes(searchTerm) || user.role.toLowerCase().includes(searchTerm.toLowerCase());
        const isProjectMember = existingMemberIds.includes(user.id);
        // We show users who are NOT project members.
        // Even if they are already "selected" locally, we still show them so user can toggle/see them in list.
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
        setSelectedUsers([]); // Clear selection
        onClose();
    };

    const handleCancel = () => {
        setSelectedUsers([]); // Clear selection on cancel
        onClose();
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', zIndex: 2000,
            display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
            <div style={{
                background: 'white', borderRadius: '12px', width: '500px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)', overflow: 'hidden',
                display: 'flex', flexDirection: 'column', maxHeight: '80vh'
            }}>
                {/* Header with Confirm/Cancel Buttons */}
                <div style={{
                    padding: '20px 24px', borderBottom: '1px solid #e6e9ef',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>팀원 초대하기</h2>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={handleCancel}
                            style={{
                                background: 'white', border: '1px solid #d0d4e4',
                                padding: '8px 16px', borderRadius: '6px', cursor: 'pointer',
                                fontSize: '13px', fontWeight: 500, color: '#323338'
                            }}
                        >
                            취소
                        </button>
                        <button
                            onClick={handleConfirm}
                            style={{
                                background: '#0073ea', border: 'none',
                                padding: '8px 16px', borderRadius: '6px', cursor: 'pointer',
                                fontSize: '13px', fontWeight: 500, color: 'white',
                                opacity: selectedUsers.length === 0 ? 0.5 : 1,
                                pointerEvents: selectedUsers.length === 0 ? 'none' : 'auto'
                            }}
                        >
                            확인 ({selectedUsers.length})
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div style={{ padding: '20px 24px' }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        background: '#f5f6f8', padding: '10px 16px', borderRadius: '8px',
                        border: '1px solid #d0d4e4'
                    }}>
                        <Search size={18} color="#676879" />
                        <input
                            type="text"
                            placeholder="이름 또는 역할로 검색하세요..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                border: 'none', background: 'transparent', outline: 'none',
                                fontSize: '14px', flex: 1
                            }}
                            autoFocus
                        />
                    </div>
                </div>

                {/* Results List */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 24px' }}>
                    {searchTerm && searchResults.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#676879', padding: '20px' }}>
                            검색 결과가 없습니다.
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {(searchTerm ? searchResults : ALL_USERS.filter(u => !existingMemberIds.includes(u.id))).map(user => {
                                const isSelected = selectedUsers.some(u => u.id === user.id);
                                return (
                                    <div key={user.id}
                                        onClick={() => toggleSelection(user)}
                                        style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            padding: '12px', border: isSelected ? '1px solid #0073ea' : '1px solid #e6e9ef',
                                            borderRadius: '8px', cursor: 'pointer',
                                            transition: '0.2s', background: isSelected ? '#f0f7ff' : 'white'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            {/* Avatar */}
                                            <div style={{
                                                width: '36px', height: '36px', borderRadius: '50%',
                                                background: user.avatar, color: 'white',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontWeight: 600, fontSize: '14px'
                                            }}>
                                                {user.name[0]}
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '14px', fontWeight: 500, color: '#323338' }}>{user.name}</div>
                                                <div style={{ fontSize: '12px', color: '#676879' }}>{user.role} • {user.email}</div>
                                            </div>
                                        </div>

                                        <div style={{
                                            width: '24px', height: '24px', borderRadius: '50%',
                                            border: isSelected ? 'none' : '1px solid #d0d4e4',
                                            background: isSelected ? '#0073ea' : 'white',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: 'white'
                                        }}>
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
                    <div style={{ padding: '16px 24px', background: '#f9fafb', borderTop: '1px solid #e6e9ef' }}>
                        <div style={{ fontSize: '12px', color: '#676879', marginBottom: '8px' }}>
                            프로젝트 멤버 ({project.members.length}명) + <span>추가 대기 ({selectedUsers.length}명)</span>
                        </div>

                        {/* Member List with Roles */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '150px', overflowY: 'auto' }}>
                            {project.members.map(m => (
                                <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{
                                            width: '24px', height: '24px', borderRadius: '50%',
                                            background: m.avatar, color: 'white', fontSize: '11px',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
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
