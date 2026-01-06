"use client";

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, MoreHorizontal } from 'lucide-react';
// import styles from './PerformanceView.module.css'; // We might need to create this or use inline styles

// Type definitions for the data structure
export interface ProjectItem {
    id: string;
    projectName: string;
    startDate: string;
    endDate: string;
    weight: string; // Keeping as string for input flexibility, can parse to number later
}

export interface CompanyGroup {
    id: string;
    companyName: string;
    projects: ProjectItem[];
}

export interface PerformanceData {
    us: CompanyGroup[];
    jp: CompanyGroup[];
}

interface PerformanceDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    year: number;
    initialData?: PerformanceData;
    onSave: (data: PerformanceData) => void;
    initialTab?: 'us' | 'jp';
}

export function PerformanceDetailModal({ isOpen, onClose, year, initialData, onSave, initialTab = 'jp' }: PerformanceDetailModalProps) {
    const [activeTab, setActiveTab] = useState<'us' | 'jp'>('jp');
    const [data, setData] = useState<PerformanceData>({ us: [], jp: [] });

    useEffect(() => {
        if (isOpen) {
            setActiveTab(initialTab);
        }
    }, [isOpen, initialTab]);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setData(initialData);
            } else {
                // Default empty state or mock data if needed
                setData({ us: [], jp: [] });
            }
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const currentList = data[activeTab];

    const addCompany = () => {
        const newCompany: CompanyGroup = {
            id: Date.now().toString(),
            companyName: '',
            projects: [{
                id: Date.now().toString() + '-p',
                projectName: '',
                startDate: `${year}-01-01`,
                endDate: `${year}-12-31`,
                weight: ''
            }]
        };
        setData(prev => ({
            ...prev,
            [activeTab]: [...prev[activeTab], newCompany]
        }));
    };

    const removeCompany = (companyId: string) => {
        setData(prev => ({
            ...prev,
            [activeTab]: prev[activeTab].filter(c => c.id !== companyId)
        }));
    };

    const addProject = (companyId: string) => {
        setData(prev => ({
            ...prev,
            [activeTab]: prev[activeTab].map(c => {
                if (c.id === companyId) {
                    return {
                        ...c,
                        projects: [...c.projects, {
                            id: Date.now().toString(),
                            projectName: '',
                            startDate: `${year}-01-01`,
                            endDate: `${year}-12-31`,
                            weight: ''
                        }]
                    };
                }
                return c;
            })
        }));
    };

    const removeProject = (companyId: string, projectId: string) => {
        setData(prev => ({
            ...prev,
            [activeTab]: prev[activeTab].map(c => {
                if (c.id === companyId) {
                    // Start by filtering
                    const newProjects = c.projects.filter(p => p.id !== projectId);
                    // If no projects left, maybe we should keep one empty one or remove company? 
                    // Let's keep strict for now: if user deletes last project, company remains project-less or we enforce at least one?
                    // User experience: usually removing the last row of a group might imply removing the group or just emptying it.
                    // Let's allow empty projects list for flexibility.
                    return { ...c, projects: newProjects };
                }
                return c;
            })
        }));
    };

    const updateCompany = (companyId: string, field: keyof CompanyGroup, value: string) => {
        setData(prev => ({
            ...prev,
            [activeTab]: prev[activeTab].map(c =>
                c.id === companyId ? { ...c, [field]: value } : c
            )
        }));
    };

    const updateProject = (companyId: string, projectId: string, field: keyof ProjectItem, value: string) => {
        setData(prev => ({
            ...prev,
            [activeTab]: prev[activeTab].map(c => {
                if (c.id === companyId) {
                    return {
                        ...c,
                        projects: c.projects.map(p =>
                            p.id === projectId ? { ...p, [field]: value } : p
                        )
                    };
                }
                return c;
            })
        }));
    };

    const handleSave = () => {
        onSave(data);
        onClose();
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div style={{
                background: 'white', width: '900px', maxWidth: '95%', height: '80vh', borderRadius: '12px',
                display: 'flex', flexDirection: 'column', boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
            }}>
                {/* Header */}
                <div style={{ padding: '20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>{activeTab === 'jp' ? '일본팀' : '미국팀'} - {year} 실적 입력</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid #eee', padding: '0 20px' }}>
                    <button
                        onClick={() => setActiveTab('jp')}
                        style={{
                            padding: '12px 24px',
                            borderBottom: activeTab === 'jp' ? '2px solid #0073ea' : 'none',
                            color: activeTab === 'jp' ? '#0073ea' : '#666',
                            fontWeight: activeTab === 'jp' ? 'bold' : 'normal',
                            background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px'
                        }}
                    >
                        일본팀
                    </button>
                    <button
                        onClick={() => setActiveTab('us')}
                        style={{
                            padding: '12px 24px',
                            borderBottom: activeTab === 'us' ? '2px solid #0073ea' : 'none',
                            color: activeTab === 'us' ? '#0073ea' : '#666',
                            fontWeight: activeTab === 'us' ? 'bold' : 'normal',
                            background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px'
                        }}
                    >
                        미국팀
                    </button>
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                        <thead>
                            <tr style={{ background: '#548ad7', color: 'white', textAlign: 'center' }}>
                                <th style={{ padding: '10px', border: '1px solid #4a7ac2', width: '20%' }}>업체명</th>
                                <th style={{ padding: '10px', border: '1px solid #4a7ac2', width: '30%' }}>프로젝트명</th>
                                <th style={{ padding: '10px', border: '1px solid #4a7ac2', width: '30%' }}>공사기간</th>
                                <th style={{ padding: '10px', border: '1px solid #4a7ac2', width: '15%' }}>중량 (kg)</th>
                                <th style={{ padding: '10px', border: '1px solid #4a7ac2', width: '5%' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentList.map((company) => (
                                <React.Fragment key={company.id}>
                                    {company.projects.map((project, index) => (
                                        <tr key={project.id}>
                                            {index === 0 && (
                                                <td
                                                    rowSpan={company.projects.length}
                                                    style={{ border: '1px solid #ddd', padding: '12px', background: 'white', verticalAlign: 'middle', textAlign: 'center' }}
                                                >
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                                                        <input
                                                            type="text"
                                                            value={company.companyName}
                                                            onChange={(e) => updateCompany(company.id, 'companyName', e.target.value)}
                                                            placeholder="업체명 입력"
                                                            style={{ width: '100%', textAlign: 'center', border: '1px solid #eee', padding: '4px' }}
                                                        />
                                                        <div style={{ display: 'flex', gap: '4px' }}>
                                                            <button
                                                                onClick={() => addProject(company.id)}
                                                                title="프로젝트 추가"
                                                                style={{ padding: '4px', background: '#e5f4ff', border: 'none', borderRadius: '4px', cursor: 'pointer', color: '#0073ea' }}
                                                            >
                                                                <Plus size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => removeCompany(company.id)}
                                                                title="업체 삭제"
                                                                style={{ padding: '4px', background: '#ffe4e8', border: 'none', borderRadius: '4px', cursor: 'pointer', color: '#e2445c' }}
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </td>
                                            )}
                                            <td style={{ border: '1px solid #ddd', padding: '8px', background: 'white' }}>
                                                <input
                                                    type="text"
                                                    value={project.projectName}
                                                    onChange={(e) => updateProject(company.id, project.id, 'projectName', e.target.value)}
                                                    placeholder="프로젝트명"
                                                    style={{ width: '100%', border: '1px solid #eee', padding: '4px' }}
                                                />
                                            </td>
                                            <td style={{ border: '1px solid #ddd', padding: '8px', background: 'white' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <input
                                                        type="text"
                                                        value={project.startDate}
                                                        onChange={(e) => updateProject(company.id, project.id, 'startDate', e.target.value)}
                                                        placeholder="YYYY.MM"
                                                        style={{ width: '80px', border: '1px solid #eee', padding: '4px', textAlign: 'center' }}
                                                    />
                                                    <span>~</span>
                                                    <input
                                                        type="text"
                                                        value={project.endDate}
                                                        onChange={(e) => updateProject(company.id, project.id, 'endDate', e.target.value)}
                                                        placeholder="YYYY.MM"
                                                        style={{ width: '80px', border: '1px solid #eee', padding: '4px', textAlign: 'center' }}
                                                    />
                                                </div>
                                            </td>
                                            <td style={{ border: '1px solid #ddd', padding: '8px', background: 'white' }}>
                                                <input
                                                    type="text"
                                                    value={project.weight}
                                                    onChange={(e) => updateProject(company.id, project.id, 'weight', e.target.value)}
                                                    placeholder="0"
                                                    style={{ width: '100%', border: '1px solid #eee', padding: '4px', textAlign: 'right' }}
                                                />
                                            </td>
                                            <td style={{ border: '1px solid #ddd', padding: '8px', background: 'white' }}>
                                                {company.projects.length > 1 && (
                                                    <button
                                                        onClick={() => removeProject(company.id, project.id)}
                                                        style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer' }}
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>

                    <button
                        onClick={addCompany}
                        style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#f5f6f8', border: '1px dashed #ccc', borderRadius: '4px', cursor: 'pointer', width: '100%', justifyContent: 'center', color: '#666' }}
                    >
                        <Plus size={16} /> 새 업체 추가
                    </button>
                </div>

                {/* Footer */}
                <div style={{ padding: '20px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button
                        onClick={onClose}
                        style={{ padding: '10px 20px', borderRadius: '6px', border: '1px solid #ddd', background: 'white', cursor: 'pointer', fontWeight: '500' }}
                    >
                        취소
                    </button>
                    <button
                        onClick={handleSave}
                        style={{ padding: '10px 24px', borderRadius: '6px', border: 'none', background: '#0073ea', color: 'white', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <Save size={18} /> 저장 및 반영
                    </button>
                </div>
            </div>
        </div>
    );
}
