
import React, { useState } from 'react';
import { useAuth } from '../store/AuthContext';
import { Plus, Trash2 } from 'lucide-react';

export function DepartmentManager() {
    const { departments, addDepartment, deleteDepartment } = useAuth();
    const [newDept, setNewDept] = useState('');

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (newDept.trim()) {
            addDepartment(newDept.trim());
            setNewDept('');
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>부서 관리 (Admin)</h2>

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
                {departments.length === 0 && (
                    <div style={{ color: '#676879', fontSize: '14px', textAlign: 'center', padding: '20px' }}>
                        등록된 부서가 없습니다.
                    </div>
                )}
                {departments.map(dept => (
                    <div key={dept} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '10px', background: 'white', border: '1px solid #e6e9ef', borderRadius: '4px'
                    }}>
                        <span style={{ fontSize: '14px', fontWeight: 500 }}>{dept}</span>
                        <button onClick={() => deleteDepartment(dept)} style={{
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
