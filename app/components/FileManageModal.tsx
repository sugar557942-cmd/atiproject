"use client";

import React, { useState, useRef } from 'react';
import { X, Upload, File, Trash2, Download } from 'lucide-react';
import { RnRItem } from '../store/ProjectContext';

interface FileManageModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: RnRItem;
    onSave: (id: string, files: string[]) => void;
}

export function FileManageModal({ isOpen, onClose, item, onSave }: FileManageModalProps) {
    const [files, setFiles] = useState<string[]>(item.files || []);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const fileName = e.target.files[0].name;
            // Mock upload: straight to list
            const newFiles = [...files, fileName];
            setFiles(newFiles);
            onSave(item.id, newFiles);
        }
    };

    const handleDelete = (fileName: string) => {
        if (confirm(`${fileName} 파일을 삭제하시겠습니까?`)) {
            const newFiles = files.filter(f => f !== fileName);
            setFiles(newFiles);
            onSave(item.id, newFiles);
        }
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 3000,
            display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
            <div style={{ background: 'white', padding: '24px', borderRadius: '12px', width: '500px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e6e9ef', paddingBottom: '12px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 600 }}>파일 관리 - {item.name}</h3>
                    <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={20} /></button>
                </div>

                <div style={{ minHeight: '150px', background: '#f5f6f8', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {files.length === 0 ? (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#9699a6', fontSize: '14px' }}>
                            <File size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
                            첨부된 파일이 없습니다.
                        </div>
                    ) : (
                        files.map((file, idx) => (
                            <div key={idx} style={{ background: 'white', padding: '12px', borderRadius: '6px', border: '1px solid #d0d4e4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: 32, height: 32, background: '#e1f0ff', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0073ea', fontSize: '10px', fontWeight: 'bold' }}>FILE</div>
                                    <span style={{ fontSize: '14px', fontWeight: 500 }}>{file}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#676879' }} title="Download">
                                        <Download size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(file)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#e2445c' }} title="Delete">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <input type="file" ref={fileInputRef} hidden onChange={handleUpload} />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        style={{ background: '#0073ea', color: 'white', border: 'none', borderRadius: '6px', padding: '8px 16px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                        <Upload size={16} /> 파일 업로드
                    </button>
                </div>
            </div>
        </div>
    );
}
