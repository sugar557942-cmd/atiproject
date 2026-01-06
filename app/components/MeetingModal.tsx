"use client";

import React, { useState, useRef, useEffect } from 'react';
import styles from './MeetingModal.module.css';
import { Meeting } from '../store/ProjectContext';
import { X, Mic, FileText, CheckSquare, Download } from 'lucide-react';

interface MeetingModalProps {
    meeting: Meeting;
    onClose: () => void;
    onSave: (id: string, updates: Partial<Meeting>) => void;
}

export function MeetingModal({ meeting, onClose, onSave }: MeetingModalProps) {
    const [formData, setFormData] = useState<Meeting>({ ...meeting });
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const editorRef = useRef<HTMLDivElement>(null);

    // Initialize editor content when meeting changes
    useEffect(() => {
        if (editorRef.current) {
            editorRef.current.innerHTML = meeting.decisions || '';
        }
    }, [meeting.id]);

    const handleChange = (field: keyof Meeting, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        onSave(meeting.id, formData);
        onClose();
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsAnalyzing(true);

        try {
            // 1. Get Signed URL
            const signedUrlRes = await fetch('/api/uploads/signed-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fileName: file.name,
                    contentType: file.type
                })
            });

            if (!signedUrlRes.ok) throw new Error('Failed to get upload URL');
            const { signedUrl, objectKey, fileUrl } = await signedUrlRes.json();

            // 2. Upload to GCS
            const uploadRes = await fetch(signedUrl, {
                method: 'PUT',
                body: file,
                headers: {
                    'Content-Type': file.type
                }
            });

            if (!uploadRes.ok) throw new Error('Failed to upload to storage');

            // 3. Update Meeting with Audio URL (and ID if not expecting separate return)
            // But wait, the meeting might already exist or not. 
            // In this modal, 'meeting' exists. We should save the audioUrl to it first.

            // Note: onSave usually handles local + API save. We need to persist audioUrl.
            // Let's assume onSave propagates to API. But to trigger process, we probably need to ensure it's saved.
            // Let's do a direct update or rely on onSave.
            // Better: Update directly to API then trigger process to ensure consistency.

            // Save audioUrl to DB
            await fetch(`/api/meetings/${meeting.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ audioUrl: objectKey }) // Storing objectKey as audioUrl or fileUrl
            });

            // 4. Trigger Async Processing
            const processRes = await fetch(`/api/meetings/${meeting.id}/process`, {
                method: 'POST'
            });

            if (!processRes.ok) throw new Error('Failed to start processing');

            alert('음성 파일이 업로드되었습니다. 분석이 백그라운드에서 진행됩니다. 잠시 후 새로고침해주세요.');
            onClose(); // Close modal or stay open? User asked for async.
            // Maybe just update status locally
            // setFormData ...

        } catch (error: any) {
            console.error(error);
            alert(`Error uploading file: ${error.message}`);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className={styles.overlay}>
            {/* Standard Modal Content - Hidden on Print */}
            <div className={`${styles.modal} print-hide`}>
                <div className={styles.header}>
                    <h2 className={`${styles.title} print-hide`}>회의록 상세</h2>
                    <div className={`${styles.headerActions} print-hide`}>
                        <button
                            className={styles.headerBtn}
                            onClick={() => window.print()}
                            title="Print / Save PDF"
                        >
                            <Download size={16} /> Print / PDF
                        </button>
                        <button
                            className={styles.aiButton}
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isAnalyzing}
                        >
                            {isAnalyzing ? '분석 중...' : (
                                <>
                                    <Mic size={16} /> 회의 녹음 분석 (Gemini)
                                </>
                            )}
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            hidden
                            accept="audio/*,video/*"
                            onChange={handleFileUpload}
                        />
                        <button className={styles.closeBtn} onClick={onClose}>
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className={styles.content}>
                    {/* Meta Info */}
                    <div className={styles.row}>
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>날짜 & 시간</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={e => handleChange('date', e.target.value)}
                                    className={styles.input}
                                />
                                <input
                                    type="time"
                                    value={formData.time || ''}
                                    onChange={e => handleChange('time', e.target.value)}
                                    className={styles.input}
                                />
                            </div>
                        </div>
                        <div className={styles.fieldGroup} style={{ flex: 2 }}>
                            <label className={styles.label}>참석자</label>
                            {/* Tag Input Logic */}
                            <div className={styles.input} style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
                                {formData.attendees.split(',').map(name => name.trim()).filter(Boolean).map((name, idx) => (
                                    <span key={idx} style={{
                                        background: '#e5f4ff', color: '#0073ea', fontSize: '13px',
                                        padding: '2px 8px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px'
                                    }}>
                                        {name}
                                        <X size={12} style={{ cursor: 'pointer' }} onClick={() => {
                                            const newAttendees = formData.attendees.split(',').map(n => n.trim()).filter(Boolean).filter((_, i) => i !== idx).join(', ');
                                            handleChange('attendees', newAttendees);
                                        }} className="print-hide" />
                                    </span>
                                ))}
                                <input
                                    style={{ border: 'none', outline: 'none', fontSize: '14px', flex: 1, minWidth: '80px' }}
                                    placeholder="이름 입력 후 콤마(,)"
                                    onKeyUp={(e) => {
                                        if (e.key === ',') {
                                            const val = e.currentTarget.value.replace(',', '').trim();
                                            if (val) {
                                                const current = formData.attendees ? formData.attendees.split(',').map(n => n.trim()).filter(Boolean) : [];
                                                handleChange('attendees', [...current, val].join(', '));
                                                e.currentTarget.value = '';
                                            }
                                        }
                                    }}
                                    className="print-hide"
                                />
                            </div>
                        </div>
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>주제 (Agenda)</label>
                        <input
                            value={formData.agenda}
                            onChange={e => handleChange('agenda', e.target.value)}
                            className={styles.input}
                            style={{ fontWeight: 'bold' }}
                        />
                    </div>

                    <div className={styles.sectionTitle}>
                        <FileText size={16} /> 회의 내용 및 결정 사항
                    </div>

                    {/* Rich Text Toolbar */}
                    <div className={`${styles.toolbar} print-hide`}>
                        <button
                            className={styles.toolBtn}
                            onClick={() => document.execCommand('bold', false)}
                            title="Bold"
                            onMouseDown={(e) => e.preventDefault()} // Prevent losing focus
                        >
                            <b>B</b>
                        </button>
                        <button
                            className={styles.toolBtn}
                            onClick={() => document.execCommand('italic', false)}
                            title="Italic"
                            onMouseDown={(e) => e.preventDefault()}
                        >
                            <i>I</i>
                        </button>
                        <button
                            className={styles.toolBtn}
                            onClick={() => document.execCommand('underline', false)}
                            title="Underline"
                            onMouseDown={(e) => e.preventDefault()}
                        >
                            <u>U</u>
                        </button>
                        <div className={styles.separator}></div>
                        <button
                            className={styles.toolBtn}
                            onClick={() => document.execCommand('foreColor', false, '#e2445c')} // Red
                            title="Red Text"
                            onMouseDown={(e) => e.preventDefault()}
                        >
                            <div style={{ width: 12, height: 12, background: '#e2445c', borderRadius: 2 }}></div>
                        </button>
                        <button
                            className={styles.toolBtn}
                            onClick={() => document.execCommand('foreColor', false, '#00c875')} // Green
                            title="Green Text"
                            onMouseDown={(e) => e.preventDefault()}
                        >
                            <div style={{ width: 12, height: 12, background: '#00c875', borderRadius: 2 }}></div>
                        </button>
                        <button
                            className={styles.toolBtn}
                            onClick={() => document.execCommand('foreColor', false, '#000000')} // Black
                            title="Black Text"
                            onMouseDown={(e) => e.preventDefault()}
                        >
                            <div style={{ width: 12, height: 12, background: '#000', borderRadius: 2 }}></div>
                        </button>
                    </div>

                    {/* Content Editable Area */}
                    <div
                        ref={editorRef}
                        className={styles.editor}
                        contentEditable
                        onInput={(e) => {
                            const html = (e.currentTarget as HTMLElement).innerHTML;
                            handleChange('decisions', html);
                        }}
                        suppressContentEditableWarning={true}
                        style={{ border: '1px solid #e6e9ef', borderRadius: '0 0 4px 4px', padding: '12px', outline: 'none', minHeight: '300px' }}
                    />

                    <div className={styles.sectionTitle}>
                        <CheckSquare size={16} /> To-Do List & Action Items
                    </div>
                    <textarea
                        className={styles.textarea}
                        value={formData.actionItems}
                        onChange={e => handleChange('actionItems', e.target.value)}
                        placeholder="- [ ] 할 일 입력..."
                        rows={15}
                    />

                    {formData.transcript && (
                        <>
                            <div className={styles.sectionTitle}>
                                <Mic size={16} /> AI 녹취 분석 결과
                            </div>
                            <div className={styles.transcriptBox}>
                                {formData.transcript}
                            </div>
                        </>
                    )}
                </div>

                <div className={`${styles.footer} print-hide`}>
                    <button className={styles.saveBtn} onClick={handleSave}>저장</button>
                </div>
            </div>

            {/* Print Only Template */}
            <div className={styles.printContainer}>
                <div style={{ borderBottom: '2px solid #333', paddingBottom: '10px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#000' }}>Meeting Minutes</h1>
                    <div style={{ textAlign: 'right', fontSize: '12px', color: '#555' }}>
                        <div>ATI Project</div>
                        <div>Confidential Document</div>
                    </div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px', fontSize: '14px' }}>
                    <tbody>
                        <tr>
                            <td style={{ width: '120px', padding: '8px', border: '1px solid #ccc', background: '#f5f5f5', fontWeight: 'bold' }}>Date & Time</td>
                            <td style={{ padding: '8px', border: '1px solid #ccc' }}>{formData.date} {formData.time}</td>
                        </tr>
                        <tr>
                            <td style={{ padding: '8px', border: '1px solid #ccc', background: '#f5f5f5', fontWeight: 'bold' }}>Attendees</td>
                            <td style={{ padding: '8px', border: '1px solid #ccc' }}>
                                {formData.attendees.split(',').map(n => n.trim()).filter(Boolean).join(', ')}
                            </td>
                        </tr>
                        <tr>
                            <td style={{ padding: '8px', border: '1px solid #ccc', background: '#f5f5f5', fontWeight: 'bold' }}>Agenda</td>
                            <td style={{ padding: '8px', border: '1px solid #ccc', fontWeight: 'bold' }}>{formData.agenda}</td>
                        </tr>
                    </tbody>
                </table>

                {/* Meeting Decisions / Content */}
                <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '18px', borderBottom: '1px solid #ccc', paddingBottom: '6px', marginBottom: '12px', color: '#0073ea', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileText size={18} /> Meeting Notes & Decisions
                    </h3>
                    <div
                        dangerouslySetInnerHTML={{ __html: formData.decisions || '<p style="color:#999">No content recorded.</p>' }}
                        style={{ fontSize: '14px', lineHeight: '1.6', minHeight: '100px' }}
                    />
                </div>

                {/* Action Items */}
                <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '18px', borderBottom: '1px solid #ccc', paddingBottom: '6px', marginBottom: '12px', color: '#0073ea', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckSquare size={18} /> Action Items
                    </h3>
                    <div style={{ fontSize: '14px', lineHeight: '1.8', whiteSpace: 'pre-wrap', background: '#f9f9f9', padding: '16px', borderRadius: '4px', border: '1px solid #eee' }}>
                        {formData.actionItems || 'No action items recorded.'}
                    </div>
                </div>

                {/* Transcript (Optional) */}
                {formData.transcript && (
                    <div style={{ marginTop: '32px', pageBreakBefore: 'always' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#666', marginBottom: '12px' }}>Reference: AI Transcript Analysis</h3>
                        <div style={{ fontSize: '12px', color: '#555', lineHeight: '1.5', borderTop: '1px dashed #ccc', paddingTop: '12px' }}>
                            {formData.transcript}
                        </div>
                    </div>
                )}

                <div style={{ position: 'fixed', bottom: '20px', left: 0, right: 0, textAlign: 'center', fontSize: '10px', color: '#aaa', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                    Generated by ATI Project Management System • {new Date().toLocaleDateString()}
                </div>
            </div>
        </div>
    );
}
