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
    category?: 'Internal' | 'Government Support' | 'Other'; // New category
    groups: string[]; // Ordered list of groups
    rnrItems: RnRItem[];
    meetings: Meeting[];
    members: Member[];
}

interface ProjectContextType {
    project: Project;
    projects: Project[];
    activeProjectId: string;
    createProject: (name: string, department: string, startDate: string, endDate: string, category: string) => void; // Updated
    switchProject: (id: string) => void;
    deleteProject: (id: string) => void;
    updateProjectInfo: (info: Partial<Project>) => void;
    addRnRItem: (parentId: string | null, level: RnRLevel, group?: string) => void;
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
    addGroup: (name: string) => void;
    deleteGroup: (name: string) => void;

    viewMode: 'project' | 'my-work' | 'home' | 'performance' | 'certification' | 'admin-settings';
    setViewMode: (mode: 'project' | 'my-work' | 'home' | 'performance' | 'certification' | 'admin-settings') => void;

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
    category: 'Internal',
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

import { useAuth } from './AuthContext'; // Added import

// ... types ...

// ... (keep interfaces)

export function ProjectProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth(); // Added user
    const [projects, setProjects] = useState<Project[]>([]);
    const [activeProjectId, setActiveProjectId] = useState<string>('');
    const [viewMode, setViewMode] = useState<'project' | 'my-work' | 'home' | 'performance' | 'certification' | 'admin-settings'>('home'); // Default to Home
    const [boardFilter, setBoardFilter] = useState<string | null>(null);

    // Fetch Projects
    const refreshProjects = async () => {
        try {
            const res = await fetch('/api/projects');
            if (res.ok) {
                const data = await res.json();
                // Map Backend Groups Object to String Array if needed
                // Backend: groups: { name: string }[] -> Frontend: groups: string[]
                const mapped = data.map((p: any) => ({
                    ...p,
                    groups: p.groups ? p.groups.map((g: any) => g.name) : ['할 일', '완료됨'],
                    // Ensure rnrItems and meetings are arrays
                    rnrItems: p.rnrItems || [],
                    meetings: p.meetings || [],
                    members: p.members || []
                }));
                setProjects(mapped);

                // Set active if not set
                if (!activeProjectId && mapped.length > 0) {
                    setActiveProjectId(mapped[0].id);
                }
            } else {
                console.error('Failed to fetch projects');
            }
        } catch (e) {
            console.error(e);
        }
    };

    // Initial Fetch
    React.useEffect(() => {
        if (user) refreshProjects();
    }, [user]);

    // Filter Projects based on Role
    const visibleProjects = React.useMemo(() => {
        if (!user) return []; // No user, no projects
        if (projects.length === 0) return [];
        if (user.role === 'admin') return projects; // Admin sees all
        // Member sees only projects they are in
        return projects.filter(p => p.members.some(m => m.id === user.id));
    }, [user, projects]);

    // Auto-switch if active project is not visible
    React.useEffect(() => {
        if (visibleProjects.length === 0) {
            if (activeProjectId) setActiveProjectId('');
        } else if (!visibleProjects.find(p => p.id === activeProjectId)) {
            setActiveProjectId(visibleProjects[0].id);
        }
    }, [visibleProjects, activeProjectId]);

    const activeProject = visibleProjects.find(p => p.id === activeProjectId) || visibleProjects[0];

    const createProject = async (name: string, department: string, startDate: string, endDate: string, category: string) => {
        if (!user) return;
        try {
            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, department, startDate, endDate, category })
            });
            if (res.ok) {
                const newProject = await res.json();
                await refreshProjects();
                setActiveProjectId(newProject.id);
            } else {
                const err = await res.json();
                alert(`프로젝트 생성 실패: ${err.error || '알 수 없는 오류'}`);
            }
        } catch (e: any) {
            console.error(e);
            alert(`프로젝트 생성 실패: ${e.message}`);
        }
    };

    const switchProject = (id: string) => {
        if (visibleProjects.some(p => p.id === id)) {
            setActiveProjectId(id);
        }
    };

    const deleteProject = async (id: string) => {
        if (!confirm('정말 삭제하시겠습니까?')) return;
        try {
            const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
            if (res.ok) {
                await refreshProjects();
            } else {
                alert('삭제 실패 (권한이 없거나 오류)');
            }
        } catch (e) {
            console.error(e);
        }
    };

    const updateProjectInfo = async (info: Partial<Project>) => {
        if (!activeProjectId) return;
        try {
            await fetch(`/api/projects/${activeProjectId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(info)
            });
            refreshProjects();
        } catch (e) {
            console.error(e);
        }
    };

    const addRnRItem = async (parentId: string | null, level: RnRLevel, group: string = '할 일') => {
        if (!activeProjectId) return;
        try {
            await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId: activeProjectId,
                    level,
                    parentId,
                    group,
                    startDate: new Date().toISOString().split('T')[0],
                    endDate: new Date().toISOString().split('T')[0]
                })
            });
            refreshProjects();
        } catch (e) {
            console.error(e);
        }
    };

    const updateRnRItem = async (id: string, updates: Partial<RnRItem>) => {
        try {
            await fetch(`/api/tasks/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            refreshProjects();
        } catch (e) {
            console.error(e);
        }
    };

    const deleteRnRItem = async (id: string) => {
        if (!confirm('삭제하시겠습니까?')) return;
        try {
            await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
            refreshProjects();
        } catch (e) {
            console.error(e);
        }
    };

    const moveRnRItem = (id: string, direction: 'up' | 'down') => {
        alert('순서 변경은 아직 저장되지 않습니다.');
    };

    const toggleCollapse = (id: string) => {
        // Toggle locally + save logic if needed, or just keep local state for UI toggle?
        // Let's implement full persistence for collapsed state as schema has it.
        const project = projects.find(p => p.id === activeProjectId);
        const item = project?.rnrItems.find(i => i.id === id);
        if (item) {
            updateRnRItem(id, { collapsed: !item.collapsed });
        }
    };

    const addMeeting = async (meeting?: Meeting) => {
        if (!activeProjectId) return;
        try {
            await fetch('/api/meetings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(meeting || {
                    projectId: activeProjectId,
                    date: new Date().toISOString().split('T')[0],
                    agenda: '새 회의'
                })
            });
            refreshProjects();
        } catch (e) {
            console.error(e);
        }
    };

    const updateMeeting = async (id: string, updates: Partial<Meeting>) => {
        try {
            await fetch(`/api/meetings/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            refreshProjects();
        } catch (e) {
            console.error(e);
        }
    };

    const deleteMeeting = async (id: string) => {
        try {
            await fetch(`/api/meetings/${id}`, { method: 'DELETE' });
            refreshProjects();
        } catch (e) {
            console.error(e);
        }
    };

    const addMember = (projectId: string, member: Member) => {
        alert('멤버 추가는 관리자 페이지나 프로젝트 설정에서 가능합니다 (개발 중)');
    };

    const updateMemberRole = (projectId: string, memberId: string, newRole: 'manager' | 'sub-manager' | 'member') => {
        alert('멤버 권한 변경은 아직 저장되지 않습니다.');
    };

    const removeMember = (projectId: string, memberId: string) => {
        alert('멤버 제거는 아직 저장되지 않습니다.');
    };

    const addGroup = async (name: string) => {
        if (!activeProjectId) return;
        try {
            await fetch('/api/groups', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId: activeProjectId, name })
            });
            refreshProjects();
        } catch (e) {
            console.error(e);
        }
    };

    const deleteGroup = (name: string) => {
        alert('그룹 삭제는 아직 지원되지 않습니다.');
    };

    return (
        <ProjectContext.Provider value={{
            project: activeProject,
            projects: visibleProjects,
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
