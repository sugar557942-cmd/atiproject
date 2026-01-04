import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface Department {
    id: string;
    name: string;
    color?: string;
}

export function DepartmentManager() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [newName, setNewName] = useState('');

    useEffect(() => {
        fetchDepts();
    }, []);

    const fetchDepts = () => {
        fetch('/api/admin/departments')
            .then(res => res.json())
            .then(data => {
                if (data.departments) setDepartments(data.departments);
            })
            .catch(err => console.error(err));
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) return;

        const res = await fetch('/api/admin/departments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newName }) // Color can be random or fixed for now
        });

        if (res.ok) {
            setNewName('');
            fetchDepts();
        } else {
            alert('Failed to create department');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('정말 이 부서를 삭제하시겠습니까?')) return;

        const res = await fetch(`/api/admin/departments?id=${id}`, {
            method: 'DELETE'
        });

        if (res.ok) {
            fetchDepts();
        } else {
            alert('Failed to delete department');
        }
    };

    return (
        <div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>부서 관리</h3>
            <form onSubmit={handleCreate} style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                <input
                    placeholder="새 부서명 (예: 디자인팀)"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    style={{
                        padding: '10px', borderRadius: '6px', border: '1px solid #d0d4e4', width: '300px'
                    }}
                />
                <button
                    type="submit"
                    style={{
                        padding: '10px 16px', background: '#0073ea', color: 'white', border: 'none',
                        borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                    }}
                >
                    <Plus size={16} />
                    추가
                </button>
            </form>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
                {departments.map(dept => (
                    <div key={dept.id} style={{
                        padding: '16px', border: '1px solid #e6e9ef', borderRadius: '8px', background: 'white',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: dept.color || '#323338' }} />
                            <span style={{ fontWeight: 600, color: '#323338' }}>{dept.name}</span>
                        </div>
                        <button
                            onClick={() => handleDelete(dept.id)}
                            style={{ padding: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#676879' }}
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
