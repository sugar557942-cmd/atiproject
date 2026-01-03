"use client";

import React, { useState } from 'react';
import styles from './MeetingList.module.css';
import { useProject, Meeting } from '../store/ProjectContext';
import { FileText, Mic, Plus, Trash2 } from 'lucide-react';
import { MeetingModal } from './MeetingModal';

export function MeetingList() {
    const { project, addMeeting, deleteMeeting, updateMeeting } = useProject();
    const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);

    const handleAddClick = () => {
        const newMeeting: Meeting = {
            id: crypto.randomUUID(), // Temp ID
            date: new Date().toISOString().split('T')[0],
            attendees: '',
            agenda: '',
            decisions: '',
            actionItems: '',
            transcript: ''
        };
        setSelectedMeeting(newMeeting);
    };

    const handleSaveMeeting = (id: string, updates: Partial<Meeting>) => {
        // Check if existing
        const existing = project.meetings.find(m => m.id === id);
        if (existing) {
            updateMeeting(id, updates);
        } else {
            // New meeting
            // We need to pass the full meeting object.
            // Since updates is Partial, we merge it with selectedMeeting (which contains defaults)
            if (selectedMeeting) {
                addMeeting({ ...selectedMeeting, ...updates } as Meeting);
            }
        }
        setSelectedMeeting(null);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>회의록 목록</h3>
                <button className={styles.addBtn} onClick={handleAddClick}>
                    <Plus size={16} /> 새 회의록
                </button>
            </div>

            <div className={styles.list}>
                {project.meetings.length === 0 ? (
                    <div className={styles.empty}>
                        <p>등록된 회의록이 없습니다.</p>
                    </div>
                ) : (
                    project.meetings.map(meeting => (
                        <div
                            key={meeting.id}
                            className={styles.card}
                            onClick={() => setSelectedMeeting(meeting)}
                        >
                            <div className={styles.cardHeader}>
                                <span className={styles.date}>{meeting.date}</span>
                                <div className={styles.actions}>
                                    <button
                                        className={styles.deleteBtn}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm('삭제하시겠습니까?')) deleteMeeting(meeting.id);
                                        }}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                            <h4 className={styles.agenda}>{meeting.agenda || '(주제 없음)'}</h4>
                            <p className={styles.attendees}>
                                {meeting.attendees ? `참석자: ${meeting.attendees}` : '참석자 미입력'}
                            </p>
                            {meeting.transcript && (
                                <div className={styles.badge}>
                                    <Mic size={10} /> AI 분석됨
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {selectedMeeting && (
                <MeetingModal
                    meeting={selectedMeeting}
                    onClose={() => setSelectedMeeting(null)}
                    onSave={handleSaveMeeting}
                />
            )}
        </div>
    );
}
