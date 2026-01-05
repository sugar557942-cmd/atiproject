import React, { useState, useEffect } from 'react';
import { useProject } from '../store/ProjectContext';
import { X } from 'lucide-react';
import styles from './ProjectEditModal.module.css';

interface ProjectEditModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ProjectEditModal({ isOpen, onClose }: ProjectEditModalProps) {
    const { project, updateProjectInfo } = useProject();

    const [name, setName] = useState('');
    const [department, setDepartment] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        if (project) {
            setName(project.name);
            setDepartment(project.department);
            setStartDate(project.startDate);
            setEndDate(project.endDate);
        }
    }, [project, isOpen]);

    if (!isOpen || !project) return null;

    const handleSave = () => {
        updateProjectInfo({
            name,
            department,
            startDate,
            endDate
        });
        onClose();
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2 className={styles.title}>프로젝트 정보 수정</h2>
                    <button onClick={onClose} className={styles.closeBtn}>
                        <X size={20} />
                    </button>
                </div>
                <div className={styles.content}>
                    <div className={styles.field}>
                        <label className={styles.label}>프로젝트명</label>
                        <input
                            className={styles.input}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className={styles.field}>
                        <label className={styles.label}>담당 부서</label>
                        <input
                            className={styles.input}
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                        />
                    </div>
                    <div className={styles.row}>
                        <div className={styles.field} style={{ flex: 1 }}>
                            <label className={styles.label}>시작일</label>
                            <input
                                type="date"
                                className={styles.input}
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className={styles.field} style={{ flex: 1 }}>
                            <label className={styles.label}>종료일</label>
                            <input
                                type="date"
                                className={styles.input}
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
                <div className={styles.footer}>
                    <button onClick={onClose} className={styles.cancelBtn}>취소</button>
                    <button onClick={handleSave} className={styles.saveBtn}>저장</button>
                </div>
            </div>
        </div>
    );
}
