"use client";

import React from 'react';
import styles from './DrillDownModal.module.css';
import { RnRItem } from '../store/ProjectContext';
import { X, ExternalLink } from 'lucide-react';

interface DrillDownModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    items: RnRItem[];
    onNavigate: (itemId: string, projectId?: string) => void;
}

export function DrillDownModal({ isOpen, onClose, title, items, onNavigate }: DrillDownModalProps) {
    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h3 className={styles.title}>{title} <span className={styles.count}>({items.length})</span></h3>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>
                <div className={styles.content}>
                    {items.length === 0 ? (
                        <div className={styles.emptyState}>데이터가 없습니다.</div>
                    ) : (
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>태스크명</th>
                                    <th>상태</th>
                                    <th>담당자</th>
                                    <th>우선순위</th>
                                    <th>이동</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map(item => (
                                    <tr key={item.id}>
                                        <td className={styles.nameCell}>{item.name}</td>
                                        <td>
                                            <span
                                                className={styles.statusBadge}
                                                data-status={item.status}
                                            >
                                                {item.status}
                                            </span>
                                        </td>
                                        <td>{item.assignee || '-'}</td>
                                        <td>{item.priority}</td>
                                        <td>
                                            <button
                                                className={styles.linkBtn}
                                                onClick={() => onNavigate(item.id)}
                                            >
                                                <ExternalLink size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
