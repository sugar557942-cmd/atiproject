import React, { useState } from 'react';
import { useAuth, User } from '../store/AuthContext';
import { X, Check, Copy } from 'lucide-react';

interface RegisterModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function RegisterModal({ isOpen, onClose }: RegisterModalProps) {
    const { checkIdAvailability, register } = useAuth();

    const [formData, setFormData] = useState({
        name: '',
        birthDate: '',
        department: '',
        id: '',
        pw: '',
        pwConfirm: '',
        email: ''
    });

    const [idCheckStatus, setIdCheckStatus] = useState<'none' | 'available' | 'taken'>('none');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'id') setIdCheckStatus('none'); // Reset check on type
    };

    const handleIdCheck = () => {
        if (!formData.id.trim()) return;
        const isAvailable = checkIdAvailability(formData.id);
        setIdCheckStatus(isAvailable ? 'available' : 'taken');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.name || !formData.id || !formData.pw || !formData.email) {
            setError('모든 필수 항목을 입력해주세요.');
            return;
        }
        if (idCheckStatus !== 'available') {
            setError('아이디 중복 확인을 해주세요.');
            return;
        }
        if (formData.pw !== formData.pwConfirm) {
            setError('비밀번호가 일치하지 않습니다.');
            return;
        }

        // Register
        const newUser = {
            id: formData.id,
            pw: formData.pw,
            name: formData.name,
            birthDate: formData.birthDate,
            department: formData.department,
            email: formData.email,
            avatar: '#' + Math.floor(Math.random() * 16777215).toString(16), // Random color
            role: 'user' // Default to user
        };

        register(newUser);
        alert('가입 신청이 완료되었습니다.\n관리자 승인 후 로그인이 가능합니다.');
        onClose();
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000,
            display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
            <div style={{
                background: 'white', padding: '30px', borderRadius: '12px', width: '500px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#323338' }}>A.T.I 멤버 가입</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <X size={24} color="#676879" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Name */}
                    <div>
                        <label style={labelStyle}>이름 <span style={{ color: 'red' }}>*</span></label>
                        <input name="name" value={formData.name} onChange={handleChange} style={inputStyle} placeholder="홍길동" />
                    </div>

                    {/* Birth Date */}
                    <div>
                        <label style={labelStyle}>생년월일</label>
                        <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} style={inputStyle} />
                    </div>

                    {/* Department */}
                    <div>
                        <label style={labelStyle}>부서</label>
                        <select name="department" value={formData.department} onChange={handleChange} style={inputStyle}>
                            <option value="">부서 선택</option>
                            <option value="Product">Product</option>
                            <option value="UX">UX / Design</option>
                            <option value="Dev">Development</option>
                            <option value="Marketing">Marketing</option>
                            <option value="HR">HR</option>
                        </select>
                    </div>

                    {/* ID & Confirm */}
                    <div>
                        <label style={labelStyle}>아이디 <span style={{ color: 'red' }}>*</span></label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input name="id" value={formData.id} onChange={handleChange} style={{ ...inputStyle, flex: 1 }} placeholder="영문/숫자" />
                            <button type="button" onClick={handleIdCheck} style={{
                                padding: '0 12px', border: '1px solid #d0d4e4', background: '#f5f6f8',
                                borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 500
                            }}>
                                중복확인
                            </button>
                        </div>
                        {idCheckStatus === 'available' && <div style={{ fontSize: '12px', color: '#00c875', marginTop: '4px' }}>사용 가능한 아이디입니다.</div>}
                        {idCheckStatus === 'taken' && <div style={{ fontSize: '12px', color: '#e2445c', marginTop: '4px' }}>이미 사용 중인 아이디입니다.</div>}
                    </div>

                    {/* PW */}
                    <div>
                        <label style={labelStyle}>비밀번호 <span style={{ color: 'red' }}>*</span></label>
                        <input type="password" name="pw" value={formData.pw} onChange={handleChange} style={inputStyle} placeholder="비밀번호 입력" />
                    </div>

                    {/* PW Confirm */}
                    <div>
                        <label style={labelStyle}>비밀번호 확인 <span style={{ color: 'red' }}>*</span></label>
                        <input type="password" name="pwConfirm" value={formData.pwConfirm} onChange={handleChange} style={inputStyle} placeholder="비밀번호 재입력" />
                    </div>

                    {/* Email */}
                    <div>
                        <label style={labelStyle}>이메일 주소 <span style={{ color: 'red' }}>*</span></label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} style={inputStyle} placeholder="example@ati.com" />
                    </div>

                    {error && <div style={{ color: '#e2445c', fontSize: '13px', textAlign: 'center' }}>{error}</div>}

                    {/* Buttons */}
                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                        <button type="button" onClick={onClose} style={{
                            flex: 1, padding: '12px', border: '1px solid #d0d4e4', background: 'white',
                            borderRadius: '6px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', color: '#323338'
                        }}>
                            취소
                        </button>
                        <button type="submit" style={{
                            flex: 1, padding: '12px', border: 'none', background: '#0073ea',
                            borderRadius: '6px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', color: 'white'
                        }}>
                            제출
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const labelStyle: React.CSSProperties = {
    display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500, color: '#676879'
};

const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #d0d4e4', fontSize: '14px'
};
