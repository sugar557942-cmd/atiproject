
import React, { useState, useEffect } from 'react';
import { useAuth } from '../store/AuthContext';
import { Plus, Trash2, Save } from 'lucide-react';

export function DepartmentManager() {
    const { departments, refreshDepartments } = useAuth();
    const [localDepts, setLocalDepts] = useState<string[]>([]);
    const [newDept, setNewDept] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Sync from global state on mount (or when global updates)
    useEffect(() => {
        setLocalDepts(departments);
    }, [departments]);

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (newDept.trim()) {
            const name = newDept.trim();
            if (!localDepts.includes(name)) {
                setLocalDepts(prev => [...prev, name]);
            }
            setNewDept('');
        }
    };

    const handleDelete = (name: string) => {
        setLocalDepts(prev => prev.filter(d => d !== name));
    };

    const handleSave = async () => {
        if (!confirm('변경사항을 저장하시겠습니까?')) return;

        setIsSaving(true);
        try {
            const res = await fetch('/api/admin/departments', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ departments: localDepts })
            });

            if (res.ok) {
                await refreshDepartments();
                alert('저장되었습니다.');
            } else {
                alert('저장 실패');
            }
        } catch (e) {
            console.error(e);
            alert('오류 발생');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>부서 관리 (Admin)</h2>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    style={{
                        padding: '8px 16px', background: '#00c875', color: 'white', border: 'none',
                        borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                        opacity: isSaving ? 0.7 : 1
                    }}
                >
                    <Save size={16} /> 저장
                </button>
            </div>

            {/* Add Form */}
            <form onSubmit={handleAdd} style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                <input
                    value={newDept}
                    onChange={e => setNewDept(e.target.value)}
                    placeholder="새 부서명 입력"
                    style={{
                        padding: '8px', border: '1px solid #d0d4e4', borderRadius: '4px', flex: 1
                    }}
                />
                <button type="submit" style={{
                    padding: '8px 16px', background: '#0073ea', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                }}>
                    <Plus size={16} /> 추가
                </button>
            </form>

            {/* List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {localDepts.length === 0 && (
                    <div style={{ color: '#676879', fontSize: '14px', textAlign: 'center', padding: '20px' }}>
                        등록된 부서가 없습니다.
                    </div>
                )}
                {localDepts.map(dept => (
                    <div key={dept} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '10px', background: 'white', border: '1px solid #e6e9ef', borderRadius: '4px'
                    }}>
                        <span style={{ fontSize: '14px', fontWeight: 500 }}>{dept}</span>
                        <button onClick={() => handleDelete(dept)} style={{
                            background: 'none', border: 'none', cursor: 'pointer', color: '#e2445c'
                        }}>
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
