import React, { useState, useEffect } from 'react';
import { useAuth } from '../store/AuthContext';
import { X } from 'lucide-react';
import styles from './UserInfoModal.module.css';

interface UserInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function UserInfoModal({ isOpen, onClose }: UserInfoModalProps) {
    const { user, updateProfile } = useAuth();

    const [name, setName] = useState('');
    const [department, setDepartment] = useState('');
    const [email, setEmail] = useState('');

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setDepartment(user.department || '');
            setEmail(user.email || '');
        }
    }, [user, isOpen]);

    if (!isOpen || !user) return null;

    const handleSave = async () => {
        // Here we would call API to update user
        updateProfile({ name, department, email });
        alert('정보가 수정되었습니다. (로컬 반영)');
        onClose();
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2 className={styles.title}>내 정보 수정</h2>
                    <button onClick={onClose} className={styles.closeBtn}>
                        <X size={20} />
                    </button>
                </div>
                <div className={styles.content}>
                    <div className={styles.field}>
                        <label className={styles.label}>아이디</label>
                        <input className={styles.input} value={user.id} disabled />
                    </div>
                    <div className={styles.field}>
                        <label className={styles.label}>이름</label>
                        <input
                            className={styles.input}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className={styles.field}>
                        <label className={styles.label}>부서</label>
                        <input
                            className={styles.input}
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                        />
                    </div>
                    <div className={styles.field}>
                        <label className={styles.label}>이메일</label>
                        <input
                            className={styles.input}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
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
