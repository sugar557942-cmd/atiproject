"use client";

import React, { createContext, useContext, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Types
export type RnRLevel = 1 | 2 | 3;

export interface RnRItem {
    id: string;
    level: RnRLevel;
    parentId: string | null;
    name: string;
    assignee: string;
    roleDescription: string;
    scope: string;
    startDate: string; // ISO Date
    endDate: string;   // ISO Date
    collapsed?: boolean;
    // New Board Fields
    group: string; // '할 일', '완료됨' etc.
    status: 'Working on it' | 'Done' | 'Stuck' | 'Empty';
    priority: 'High' | 'Medium' | 'Low' | 'Empty';
    budget: number;
    memo: string;
    files?: string[]; // New
    lastUpdated: string;
}

export interface Meeting {
    id: string;
    date: string;
    time?: string; // New
    attendees: string;
    agenda: string;
    decisions: string;
    actionItems: string;
    transcript?: string; // For auto-generated text
}

export interface Member {
    id: string;
    name: string;
    role: string; // 'PM', 'Designer', etc.
    projectRole: 'manager' | 'sub-manager' | 'member'; // New role for project management
    avatar: string; // Color code
    email?: string;
}

export interface Project {
    id: string;
    name: string;
    description: string;
    department: string;
    status: 'Planning' | 'In Progress' | 'Done';
    startDate: string;
    endDate: string;
    groups: string[]; // Ordered list of groups
    rnrItems: RnRItem[];
    meetings: Meeting[];
    members: Member[];
}

interface ProjectContextType {
    project: Project;
    projects: Project[];
    activeProjectId: string;
    createProject: (name: string, department: string) => void;
    switchProject: (id: string) => void;
    deleteProject: (id: string) => void;
    updateProjectInfo: (info: Partial<Project>) => void;
    addRnRItem: (parentId: string | null, level: RnRLevel, group?: string) => void; // Updated signature
    updateRnRItem: (id: string, updates: Partial<RnRItem>) => void;
    deleteRnRItem: (id: string) => void;
    moveRnRItem: (id: string, direction: 'up' | 'down') => void;
    toggleCollapse: (id: string) => void;
    addMeeting: (meeting?: Meeting) => void;
    updateMeeting: (id: string, updates: Partial<Meeting>) => void;
    deleteMeeting: (id: string) => void;
    addMember: (projectId: string, member: Member) => void;
    updateMemberRole: (projectId: string, memberId: string, newRole: 'manager' | 'sub-manager' | 'member') => void;
    removeMember: (projectId: string, memberId: string) => void;
    addGroup: (name: string) => void; // New
    deleteGroup: (name: string) => void; // New
    // New View Mode
    // New View Mode
    viewMode: 'project' | 'my-work' | 'home' | 'performance' | 'certification' | 'admin-settings';
    setViewMode: (mode: 'project' | 'my-work' | 'home' | 'performance' | 'certification' | 'admin-settings') => void;

    // Board Filter for Dashboard Interaction
    boardFilter: string | null;
    setBoardFilter: (filter: string | null) => void;
}

// Initial Mock Data
const initialProject: Project = {
    id: 'p1',
    name: '차세대 뱅킹 플랫폼 구축',
    description: '접근성 향상을 위한 핵심 뱅킹 UI/UX 개편 프로젝트',
    department: '제품 디자인팀',
    status: 'In Progress',
    startDate: '2024-01-01',
    endDate: '2024-06-30',
    groups: ['할 일', '완료됨'],
    rnrItems: [
        {
            id: 'r1', level: 1, parentId: null, name: 'UX 전략 수립', assignee: '김철수',
            roleDescription: '전체 사용자 경험 방향성 정의', scope: '디자인 전체',
            startDate: '2024-01-01', endDate: '2024-02-28', collapsed: false,
            group: '할 일', status: 'Working on it', priority: 'High', budget: 1000, memo: '초기 기획 단계', lastUpdated: new Date().toISOString()
        },
        {
            id: 'r2', level: 2, parentId: 'r1', name: '사용자 리서치', assignee: '이영희',
            roleDescription: '사용자 인터뷰 및 데이터 수집', scope: '리서치 단계',
            startDate: '2024-01-01', endDate: '2024-01-31', collapsed: false,
            group: '완료됨', status: 'Done', priority: 'Medium', budget: 500, memo: '', lastUpdated: new Date().toISOString()
        },
        {
            id: 'r3', level: 3, parentId: 'r2', name: '심층 인터뷰 (5명)', assignee: '이영희',
            roleDescription: '타겟 유저 심층 인터뷰 진행', scope: '데이터 수집',
            startDate: '2024-01-10', endDate: '2024-01-20', collapsed: false,
            group: '완료됨', status: 'Done', priority: 'High', budget: 200, memo: '녹취 완료', lastUpdated: new Date().toISOString()
        },
        {
            id: 'r4', level: 1, parentId: null, name: '프론트엔드 개발', assignee: '박지민',
            roleDescription: '웹 UI 구현', scope: '웹 애플리케이션',
            startDate: '2024-03-01', endDate: '2024-05-30', collapsed: false,
            group: '할 일', status: 'Empty', priority: 'Low', budget: 3000, memo: '개발 환경 세팅 중', lastUpdated: new Date().toISOString()
        }
    ],
    meetings: [
        {
            id: 'm1', date: '2024-01-05', attendees: '김철수, 이영희',
            agenda: '킥오프 미팅', decisions: '전체 일정 확정', actionItems: 'JIRA 프로젝트 생성',
            transcript: '상세 회의록 내용이 여기에 표시됩니다...'
        }
    ],
    members: [
        { id: 'u1', name: '김철수', role: 'Project Manager', projectRole: 'manager', avatar: '#579bfc' },
        { id: 'u2', name: '이영희', role: 'UX Researcher', projectRole: 'member', avatar: '#ffcb00' }
    ]
};

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
    const [projects, setProjects] = useState<Project[]>([initialProject]);
    const [activeProjectId, setActiveProjectId] = useState<string>(initialProject.id);
    const [viewMode, setViewMode] = useState<'project' | 'my-work' | 'home' | 'performance' | 'certification' | 'admin-settings'>('home'); // Default to Home
    const [boardFilter, setBoardFilter] = useState<string | null>(null);

    const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];

    const createProject = (name: string, department: string) => {
        // Find current user (mock: kim / u1) to set as Manager
        const currentUser: Member = { id: 'u1', name: '김철수', role: 'Project Manager', projectRole: 'manager', avatar: '#579bfc', email: 'kim@ati.com' };

        const newProject: Project = {
            id: uuidv4(),
            name,
            description: '',
            department,
            status: 'Planning',
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date().toISOString().split('T')[0],
            groups: ['할 일'],
            rnrItems: [],
            meetings: [],
            members: [currentUser] // Creator is manager
        };
        setProjects(prev => [...prev, newProject]);
        setActiveProjectId(newProject.id);
    };

    const switchProject = (id: string) => {
        if (projects.some(p => p.id === id)) {
            setActiveProjectId(id);
        }
    };

    const deleteProject = (id: string) => {
        if (projects.length <= 1) return; // Prevent deleting last project
        setProjects(prev => prev.filter(p => p.id !== id));
        if (activeProjectId === id) {
            setActiveProjectId(projects.find(p => p.id !== id)?.id || projects[0].id);
        }
    };

    const updateProjectInfo = (info: Partial<Project>) => {
        setProjects(prev => prev.map(p =>
            p.id === activeProjectId ? { ...p, ...info } : p
        ));
    };

    const addRnRItem = (parentId: string | null, level: RnRLevel, group: string = '할 일') => {
        const newItem: RnRItem = {
            id: uuidv4(),
            level,
            parentId,
            name: '새로운 업무',
            assignee: '미정',
            roleDescription: '-',
            scope: '-',
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date().toISOString().split('T')[0],
            collapsed: false,
            group,
            status: 'Empty',
            priority: 'Empty',
            budget: 0,
            memo: '',
            lastUpdated: new Date().toISOString()
        };

        setProjects(prev => prev.map(p => {
            if (p.id !== activeProjectId) return p;
            return {
                ...p,
                rnrItems: [...p.rnrItems, newItem]
            };
        }));
    };

    const addGroup = (name: string) => {
        setProjects(prev => prev.map(p => {
            if (p.id !== activeProjectId) return p;
            if (p.groups.includes(name)) return p;
            return { ...p, groups: [...p.groups, name] };
        }));
    };

    const deleteGroup = (name: string) => {
        setProjects(prev => prev.map(p => {
            if (p.id !== activeProjectId) return p;
            // Move items in deleted group to default or just delete?
            // Re-assign to first group or delete items. Let's delete items for simplicity or move to first group.
            // Safe: move to first remaining group.
            const remainingGroups = p.groups.filter(g => g !== name);
            if (remainingGroups.length === 0) return p; // Cannot delete last group

            const fallbackGroup = remainingGroups[0];
            const updatedItems = p.rnrItems.map(item => item.group === name ? { ...item, group: fallbackGroup } : item);

            return { ...p, groups: remainingGroups, rnrItems: updatedItems };
        }));
    };

    const updateRnRItem = (id: string, updates: Partial<RnRItem>) => {
        setProjects(prev => prev.map(p => {
            if (p.id !== activeProjectId) return p;
            return {
                ...p,
                rnrItems: p.rnrItems.map(item => item.id === id ? { ...item, ...updates } : item)
            };
        }));
    };

    const deleteRnRItem = (id: string) => {
        setProjects(prev => prev.map(p => {
            if (p.id !== activeProjectId) return p;
            return {
                ...p,
                rnrItems: p.rnrItems.filter(item => item.id !== id)
            };
        }));
    };

    const moveRnRItem = (id: string, direction: 'up' | 'down') => {
        setProjects(prev => prev.map(p => {
            if (p.id !== activeProjectId) return p;
            const index = p.rnrItems.findIndex(i => i.id === id);
            if (index === -1) return p;

            const newItems = [...p.rnrItems];
            const swapIndex = direction === 'up' ? index - 1 : index + 1;

            if (swapIndex >= 0 && swapIndex < newItems.length) {
                [newItems[index], newItems[swapIndex]] = [newItems[swapIndex], newItems[index]];
            }
            return { ...p, rnrItems: newItems };
        }));
    };

    const toggleCollapse = (id: string) => {
        setProjects(prev => prev.map(p => {
            if (p.id !== activeProjectId) return p;
            return {
                ...p,
                rnrItems: p.rnrItems.map(item => item.id === id ? { ...item, collapsed: !item.collapsed } : item)
            };
        }));
    };

    const addMeeting = (meeting?: Meeting) => {
        const newMeeting: Meeting = meeting || {
            id: uuidv4(),
            date: new Date().toISOString().split('T')[0],
            attendees: '',
            agenda: '새 회의',
            decisions: '',
            actionItems: '',
            transcript: ''
        };
        setProjects(prev => prev.map(p => {
            if (p.id !== activeProjectId) return p;
            return {
                ...p,
                meetings: [newMeeting, ...p.meetings]
            };
        }));
    };

    const updateMeeting = (id: string, updates: Partial<Meeting>) => {
        setProjects(prev => prev.map(p => {
            if (p.id !== activeProjectId) return p;
            return {
                ...p,
                meetings: p.meetings.map(m => m.id === id ? { ...m, ...updates } : m)
            };
        }));
    };

    const deleteMeeting = (id: string) => {
        setProjects(prev => prev.map(p => {
            if (p.id !== activeProjectId) return p;
            return {
                ...p,
                meetings: p.meetings.filter(m => m.id !== id)
            };
        }));
    };

    const addMember = (projectId: string, member: Member) => {
        setProjects(prev => prev.map(p => {
            if (p.id !== projectId) return p;
            if (p.members.some(m => m.id === member.id)) return p; // Already exists
            return {
                ...p,
                members: [...p.members, { ...member, projectRole: 'member' }] // Default to 'member'
            };
        }));
    };

    const updateMemberRole = (projectId: string, memberId: string, newRole: 'manager' | 'sub-manager' | 'member') => {
        setProjects(prev => prev.map(p => {
            if (p.id !== projectId) return p;

            // Logic: Max 2 sub-managers
            if (newRole === 'sub-manager') {
                const currentSubManagers = p.members.filter(m => m.projectRole === 'sub-manager').length;
                const isAlreadySub = p.members.find(m => m.id === memberId)?.projectRole === 'sub-manager';
                if (!isAlreadySub && currentSubManagers >= 2) {
                    alert('부관리자는 최대 2명까지만 지정할 수 있습니다.'); // Simple alert for now
                    return p;
                }
            }

            return {
                ...p,
                members: p.members.map(m => m.id === memberId ? { ...m, projectRole: newRole } : m)
            };
        }));
    };

    const removeMember = (projectId: string, memberId: string) => {
        setProjects(prev => prev.map(p => {
            if (p.id !== projectId) return p;
            return {
                ...p,
                members: p.members.filter(m => m.id !== memberId)
            };
        }));
    };

    return (
        <ProjectContext.Provider value={{
            project: activeProject,
            projects,
            activeProjectId,
            createProject,
            switchProject,
            deleteProject,
            updateProjectInfo,
            addRnRItem, updateRnRItem, deleteRnRItem, moveRnRItem, toggleCollapse,
            addMeeting, updateMeeting, deleteMeeting,
            addMember, updateMemberRole, removeMember,
            addGroup, deleteGroup,
            viewMode, setViewMode,
            boardFilter, setBoardFilter
        }}>
            {children}
        </ProjectContext.Provider>
    );
}

export const useProject = () => {
    const context = useContext(ProjectContext);
    if (!context) throw new Error('useProject must be used within ProjectProvider');
    return context;
};
