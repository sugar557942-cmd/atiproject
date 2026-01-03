"use client";

import React, { useState, useRef } from 'react';
import { Award, CheckCircle, Plus, ArrowLeft, Calendar, FileText, Download, X, Clock, Upload, Edit2, Save } from 'lucide-react';
import { useAuth } from '../store/AuthContext';

interface Certification {
    id: string;
    title: string;
    subtitle: string;
    status: 'active' | 'pending';
    validUntil?: string;
    expectedCompletion?: string;
    borderColor: string;
    iconColor: string;
    description?: string;
    imageUrl?: string;
    history: { id: string; date: string; event: string }[];
    files: { id: string; name: string; size: string; date: string }[];
}

const INITIAL_CERTIFICATIONS: Certification[] = [
    {
        id: '1',
        title: 'ISO 27001',
        subtitle: '정보보호 경영시스템',
        status: 'active',
        validUntil: '2025.12.31',
        borderColor: '#00c875',
        iconColor: '#00c875',
        description: '국제표준 정보보호 경영시스템 인증으로, 조직의 정보보호 관리체계가 국제 규격에 적합함을 증명합니다.',
        history: [
            { id: 'h1', date: '2022.12.31', event: '최초 인증 획득' },
            { id: 'h2', date: '2023.12.20', event: '사후 심사 통과' },
            { id: 'h3', date: '2024.12.15', event: '갱신 심사 통과' }
        ],
        files: [
            { id: 'f1', name: 'ISO27001_Certificate_2024.pdf', size: '1.2MB', date: '2024.12.15' },
            { id: 'f2', name: 'Audit_Report_2024.pdf', size: '2.5MB', date: '2024.12.20' }
        ]
    },
    {
        id: '2',
        title: 'GS 인증 1등급',
        subtitle: '소프트웨어 품질 인증',
        status: 'pending',
        expectedCompletion: '2024.06.30',
        borderColor: '#fdab3d',
        iconColor: '#fdab3d',
        description: '국산 소프트웨어의 품질을 증명하는 국가 인증제도입니다. 1등급은 최고 등급의 품질을 의미합니다.',
        history: [
            { id: 'h4', date: '2023.11.10', event: '인증 신청서 접수' },
            { id: 'h5', date: '2023.12.05', event: '1차 기능 검토 완료' },
            { id: 'h6', date: '2024.01.20', event: '현장 심사 진행 중' }
        ],
        files: [
            { id: 'f3', name: 'Application_Form_v2.pdf', size: '540KB', date: '2023.11.10' },
            { id: 'f4', name: 'Product_Description.pdf', size: '3.1MB', date: '2023.11.10' }
        ]
    }
];

export function CertificationView() {
    const { isAdmin } = useAuth();
    const [certifications, setCertifications] = useState<Certification[]>(INITIAL_CERTIFICATIONS);
    const [selectedCertId, setSelectedCertId] = useState<string | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);

    // Editing State
    const [isEditingDate, setIsEditingDate] = useState(false);
    const [editDateValue, setEditDateValue] = useState('');

    // History Add State
    const [newHistoryDate, setNewHistoryDate] = useState('');
    const [newHistoryEvent, setNewHistoryEvent] = useState('');
    const [isAddingHistory, setIsAddingHistory] = useState(false);

    // Refs for file inputs
    const imageInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form State (New Cert)
    const [newCertTitle, setNewCertTitle] = useState('');
    const [newCertSubtitle, setNewCertSubtitle] = useState('');
    const [newCertStatus, setNewCertStatus] = useState<'active' | 'pending'>('pending');
    const [newCertDate, setNewCertDate] = useState('');

    const selectedCert = certifications.find(c => c.id === selectedCertId);

    const updateCert = (id: string, updates: Partial<Certification>) => {
        setCertifications(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    };

    const handleAddCert = () => {
        const newCert: Certification = {
            id: Date.now().toString(),
            title: newCertTitle,
            subtitle: newCertSubtitle,
            status: newCertStatus,
            [newCertStatus === 'active' ? 'validUntil' : 'expectedCompletion']: newCertDate,
            borderColor: newCertStatus === 'active' ? '#00c875' : '#fdab3d',
            iconColor: newCertStatus === 'active' ? '#00c875' : '#fdab3d',
            description: '새로 추가된 인증입니다.',
            history: [{ id: Date.now().toString(), date: new Date().toLocaleDateString(), event: '인증 항목 등록' }],
            files: []
        };

        setCertifications([...certifications, newCert]);
        setShowAddModal(false);
        resetForm();
    };

    const resetForm = () => {
        setNewCertTitle('');
        setNewCertSubtitle('');
        setNewCertDate('');
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && selectedCertId) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                updateCert(selectedCertId, { imageUrl: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && selectedCert) {
            const file = e.target.files[0];
            const newFile = {
                id: Date.now().toString(),
                name: file.name,
                size: (file.size / 1024).toFixed(1) + 'KB',
                date: new Date().toLocaleDateString()
            };
            updateCert(selectedCert.id, { files: [...selectedCert.files, newFile] });
        }
    };

    const handleSaveDate = () => {
        if (selectedCert) {
            if (selectedCert.status === 'active') {
                updateCert(selectedCert.id, { validUntil: editDateValue });
            } else {
                updateCert(selectedCert.id, { expectedCompletion: editDateValue });
            }
            setIsEditingDate(false);
        }
    };

    const handleAddHistory = () => {
        if (selectedCert && newHistoryDate && newHistoryEvent) {
            const newHistory = {
                id: Date.now().toString(),
                date: newHistoryDate,
                event: newHistoryEvent
            };
            updateCert(selectedCert.id, { history: [...selectedCert.history, newHistory] });
            setNewHistoryDate('');
            setNewHistoryEvent('');
            setIsAddingHistory(false);
        }
    };

    // --- Detail View ---
    if (selectedCert) {
        return (
            <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <button
                    onClick={() => setSelectedCertId(null)}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'transparent', cursor: 'pointer', marginBottom: '24px', fontSize: '16px', fontWeight: 'bold', color: '#323338' }}
                >
                    <ArrowLeft size={20} /> 목록으로 돌아가기
                </button>

                <div style={{ display: 'flex', gap: '32px', flex: 1, minHeight: 0 }}>
                    {/* Left: Image Area */}
                    <div style={{ flex: 1.5, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{
                            flex: 1,
                            background: '#f0f4f8',
                            borderRadius: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: '400px',
                            border: '2px dashed #d0d4d9',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            {selectedCert.imageUrl ? (
                                <img src={selectedCert.imageUrl} alt={selectedCert.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            ) : (
                                <div style={{ textAlign: 'center', color: '#878895' }}>
                                    <Award size={64} style={{ marginBottom: '16px', opacity: 0.5 }} />
                                    <p>인증서 이미지가 없습니다</p>
                                </div>
                            )}
                        </div>

                        {/* Admin Only: Upload Button */}
                        {isAdmin && (
                            <>
                                <input
                                    type="file"
                                    ref={imageInputRef}
                                    style={{ display: 'none' }}
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                                <button
                                    onClick={() => imageInputRef.current?.click()}
                                    style={{
                                        padding: '12px',
                                        background: 'white',
                                        border: '1px solid #d0d4d9',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        color: '#323338',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                    }}
                                >
                                    <Upload size={18} /> 이미지 {selectedCert.imageUrl ? '변경' : '첨부'}하기
                                </button>
                            </>
                        )}
                    </div>

                    {/* Right: Info & History */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto', paddingRight: '8px' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>{selectedCert.title}</h1>
                                {selectedCert.status === 'active' ? (
                                    <CheckCircle color="#00c875" size={24} />
                                ) : (
                                    <div style={{ padding: '4px 8px', background: '#fff0b3', borderRadius: '4px', fontSize: '12px', color: '#b67a0e', fontWeight: 'bold' }}>심사중</div>
                                )}
                            </div>
                            <p style={{ fontSize: '16px', color: '#676879', marginBottom: '16px' }}>{selectedCert.subtitle}</p>

                            {/* Date Box */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '14px', color: '#323338', background: 'white', padding: '16px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
                                    <Calendar size={16} color="#676879" />
                                    {isEditingDate ? (
                                        <input
                                            value={editDateValue}
                                            onChange={(e) => setEditDateValue(e.target.value)}
                                            placeholder="YYYY.MM.DD"
                                            style={{ padding: '4px 8px', border: '1px solid #0073ea', borderRadius: '4px', outline: 'none' }}
                                            autoFocus
                                        />
                                    ) : (
                                        <span>
                                            {selectedCert.status === 'active' ? `유효기간: ${selectedCert.validUntil} 까지` : `예상 완료일: ${selectedCert.expectedCompletion}`}
                                        </span>
                                    )}
                                </div>
                                {/* Admin Only: Date Edit Control */}
                                {isAdmin && (
                                    isEditingDate ? (
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            <button onClick={handleSaveDate} style={{ border: 'none', background: '#00c875', color: 'white', borderRadius: '4px', padding: '4px', cursor: 'pointer' }}><Save size={14} /></button>
                                            <button onClick={() => setIsEditingDate(false)} style={{ border: 'none', background: '#e2445c', color: 'white', borderRadius: '4px', padding: '4px', cursor: 'pointer' }}><X size={14} /></button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                setIsEditingDate(true);
                                                setEditDateValue(selectedCert.status === 'active' ? selectedCert.validUntil || '' : selectedCert.expectedCompletion || '');
                                            }}
                                            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#676879' }}
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                    )
                                )}
                            </div>
                        </div>

                        {/* History Section */}
                        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Clock size={20} /> 인증 이력
                                </h3>
                                {/* Admin Only: Add History Button */}
                                {isAdmin && !isAddingHistory && (
                                    <button
                                        onClick={() => setIsAddingHistory(true)}
                                        style={{ border: 'none', background: '#f0f4f8', color: '#0073ea', borderRadius: '4px', padding: '4px 8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                                    >
                                        + 추가
                                    </button>
                                )}
                            </div>

                            {isAddingHistory && (
                                <div style={{ marginBottom: '16px', padding: '12px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e6e9ef' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '8px', marginBottom: '8px' }}>
                                        <input
                                            value={newHistoryDate}
                                            onChange={(e) => setNewHistoryDate(e.target.value)}
                                            placeholder="YYYY.MM.DD"
                                            style={{ padding: '6px', borderRadius: '4px', border: '1px solid #d0d4d9' }}
                                        />
                                        <input
                                            value={newHistoryEvent}
                                            onChange={(e) => setNewHistoryEvent(e.target.value)}
                                            placeholder="이력 내용"
                                            style={{ padding: '6px', borderRadius: '4px', border: '1px solid #d0d4d9' }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                        <button onClick={() => setIsAddingHistory(false)} style={{ padding: '4px 12px', borderRadius: '4px', border: '1px solid #d0d4d9', background: 'white', cursor: 'pointer' }}>취소</button>
                                        <button onClick={handleAddHistory} style={{ padding: '4px 12px', borderRadius: '4px', border: 'none', background: '#0073ea', color: 'white', cursor: 'pointer' }}>확인</button>
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {selectedCert.history.map((h, i) => (
                                    <div key={h.id} style={{ display: 'flex', gap: '16px', position: 'relative' }}>
                                        {/* Timeline line */}
                                        {i !== selectedCert.history.length - 1 && (
                                            <div style={{ position: 'absolute', left: '6px', top: '24px', bottom: '-16px', width: '2px', background: '#e6e9ef' }} />
                                        )}
                                        <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: i === 0 ? '#0073ea' : '#c5c7d0', marginTop: '4px', flexShrink: 0 }} />
                                        <div>
                                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#323338' }}>{h.event}</div>
                                            <div style={{ fontSize: '12px', color: '#878895' }}>{h.date}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Files Section */}
                        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <FileText size={20} /> 관련 파일
                                </h3>
                                {/* Admin Only: Add File Button */}
                                {isAdmin && (
                                    <>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            style={{ display: 'none' }}
                                            onChange={handleFileUpload}
                                        />
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            style={{ border: 'none', background: '#f0f4f8', color: '#0073ea', borderRadius: '4px', padding: '4px 8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                                        >
                                            + 파일 추가
                                        </button>
                                    </>
                                )}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {selectedCert.files.length > 0 ? selectedCert.files.map((file) => (
                                    <div key={file.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', borderRadius: '8px', border: '1px solid #e6e9ef' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <FileText size={20} color="#676879" />
                                            <div>
                                                <div style={{ fontSize: '14px', fontWeight: '500', color: '#323338' }}>{file.name}</div>
                                                <div style={{ fontSize: '12px', color: '#878895' }}>{file.date} • {file.size}</div>
                                            </div>
                                        </div>
                                        <button style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#0073ea' }}>
                                            <Download size={20} />
                                        </button>
                                    </div>
                                )) : (
                                    <div style={{ fontSize: '14px', color: '#878895', textAlign: 'center', padding: '12px' }}>첨부된 파일이 없습니다.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- List View ---
    return (
        <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award color="#0073ea" /> 인증 현황
            </h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                {certifications.map(cert => (
                    <div
                        key={cert.id}
                        onClick={() => setSelectedCertId(cert.id)}
                        style={{
                            background: 'white',
                            padding: '24px',
                            borderRadius: '12px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                            borderLeft: `4px solid ${cert.borderColor}`,
                            cursor: 'pointer',
                            transition: 'transform 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>{cert.title}</h3>
                            {cert.status === 'active' ? (
                                <CheckCircle color={cert.iconColor} />
                            ) : (
                                <div style={{ padding: '4px 8px', background: '#fff0b3', borderRadius: '4px', fontSize: '12px', color: '#b67a0e', fontWeight: 'bold' }}>심사중</div>
                            )}
                        </div>
                        <p style={{ color: '#676879', fontSize: '14px', marginBottom: '16px' }}>{cert.subtitle}</p>
                        <div style={{ fontSize: '13px', color: '#323338' }}>
                            {cert.status === 'active' ? `유효기간: ${cert.validUntil} 까지` : `예상 완료일: ${cert.expectedCompletion}`}
                        </div>
                    </div>
                ))}

                {/* Admin Only: Add New Button Card */}
                {isAdmin && (
                    <button
                        onClick={() => setShowAddModal(true)}
                        style={{
                            background: 'transparent',
                            border: '2px dashed #d0d4d9',
                            borderRadius: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#676879',
                            minHeight: '200px',
                            cursor: 'pointer'
                        }}
                    >
                        <Plus size={32} style={{ marginBottom: '8px' }} />
                        <span style={{ fontSize: '16px', fontWeight: '600' }}>새로운 인증 추가</span>
                    </button>
                )}
            </div>

            {/* Add Modal Overlay */}
            {showAddModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', padding: '32px', borderRadius: '16px', width: '400px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>인증 추가하기</h2>
                            <button onClick={() => setShowAddModal(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                                <X size={24} color="#676879" />
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>인증명</label>
                                <input
                                    value={newCertTitle}
                                    onChange={(e) => setNewCertTitle(e.target.value)}
                                    placeholder="예: ISO 9001"
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e6e9ef' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>부제 (설명)</label>
                                <input
                                    value={newCertSubtitle}
                                    onChange={(e) => setNewCertSubtitle(e.target.value)}
                                    placeholder="예: 품질경영시스템"
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e6e9ef' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>상태</label>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button
                                        onClick={() => setNewCertStatus('active')}
                                        style={{ flex: 1, padding: '10px', borderRadius: '8px', border: newCertStatus === 'active' ? '2px solid #00c875' : '1px solid #e6e9ef', background: newCertStatus === 'active' ? '#e6fced' : 'white', color: newCertStatus === 'active' ? '#00c875' : '#323338', fontWeight: '600' }}
                                    >
                                        인증 완료
                                    </button>
                                    <button
                                        onClick={() => setNewCertStatus('pending')}
                                        style={{ flex: 1, padding: '10px', borderRadius: '8px', border: newCertStatus === 'pending' ? '2px solid #fdab3d' : '1px solid #e6e9ef', background: newCertStatus === 'pending' ? '#fff8eb' : 'white', color: newCertStatus === 'pending' ? '#b67a0e' : '#323338', fontWeight: '600' }}
                                    >
                                        심사중
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>{newCertStatus === 'active' ? '유효기간' : '예상 완료일'}</label>
                                <input
                                    type="text"
                                    value={newCertDate}
                                    onChange={(e) => setNewCertDate(e.target.value)}
                                    placeholder="YYYY.MM.DD"
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e6e9ef' }}
                                />
                            </div>

                            <button
                                onClick={handleAddCert}
                                style={{ marginTop: '16px', width: '100%', padding: '12px', background: '#0073ea', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
                            >
                                추가하기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Add keyframe animation for styles
const styles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
