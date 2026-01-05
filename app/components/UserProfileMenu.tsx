import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../store/AuthContext';
import { useProject } from '../store/ProjectContext';
import { User, LogOut, Briefcase, Settings, ChevronDown } from 'lucide-react';
import styles from './UserProfileMenu.module.css';
import { UserInfoModal } from './UserInfoModal';

export function UserProfileMenu() {
    const { user, logout } = useAuth();
    const { setViewMode } = useProject();
    const [isOpen, setIsOpen] = useState(false);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!user) return null;

    return (
        <div className={styles.container} ref={menuRef}>
            <button className={styles.menuBtn} onClick={() => setIsOpen(!isOpen)}>
                <div className={styles.avatar} style={{ background: user.avatar || '#ccc' }}>
                    {user.name?.[0]}
                </div>
                <span className={styles.name}>{user.name}</span>
                <ChevronDown size={14} color="#a0a1a8" />
            </button>

            {isOpen && (
                <div className={styles.dropdown}>
                    <button
                        className={styles.menuItem}
                        onClick={() => {
                            setIsOpen(false);
                            setIsInfoModalOpen(true);
                        }}
                    >
                        <User size={14} /> 기본 정보 수정
                    </button>
                    <button
                        className={styles.menuItem}
                        onClick={() => {
                            setIsOpen(false);
                            setViewMode('my-work');
                        }}
                    >
                        <Briefcase size={14} /> 내 프로젝트
                    </button>
                    <div className={styles.divider} />
                    <button
                        className={`${styles.menuItem} ${styles.logout}`}
                        onClick={() => {
                            setIsOpen(false);
                            logout();
                        }}
                    >
                        <LogOut size={14} /> 로그아웃
                    </button>
                </div>
            )}

            <UserInfoModal
                isOpen={isInfoModalOpen}
                onClose={() => setIsInfoModalOpen(false)}
            />
        </div>
    );
}
