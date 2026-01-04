"use client";

import { useState } from 'react';
import { ProjectView } from './components/ProjectView';
import { ProjectList } from './components/ProjectList';
import { ProjectProvider, useProject } from './store/ProjectContext';
import { AuthProvider, useAuth } from './store/AuthContext';
import { LoginView } from './components/LoginView';
import { HomeDashboard } from './components/HomeDashboard';
import { MyWorkView } from './components/MyWorkView';
import { Menu } from 'lucide-react';
import { PerformanceView } from './components/PerformanceView';
import { CertificationView } from './components/CertificationView';
import { AdminSettingsView } from './components/AdminSettingsView';

function AppContent() {
    const { user } = useAuth();
    const { viewMode } = useProject();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    if (!user) {
        return <LoginView />;
    }

    return (
        <main style={{ padding: '0', height: '100vh', display: 'flex', background: '#f5f6f8', position: 'relative' }}>
            {/* Sidebar Overlay for Mobile */}
            {isSidebarOpen && (
                <div
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000 }}
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <ProjectList isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <div style={{ flex: 1, padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {/* Mobile Header (Hamburger) */}
                <div style={{
                    display: 'none', // scalable via Media query but doing inline for quick win 
                    alignItems: 'center',
                    padding: '12px 16px',
                    background: 'white',
                    borderBottom: '1px solid #e6e9ef'
                }} className="mobile-header">
                    <button onClick={() => setIsSidebarOpen(true)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                        <Menu size={24} color="#323338" />
                    </button>
                    <span style={{ marginLeft: '12px', fontWeight: 'bold' }}>ATI Project</span>
                </div>
                {/* Add simple style block for generic mobile header visibility */}
                <style jsx>{`
                    @media (max-width: 768px) {
                        .mobile-header { display: flex !important; }
                    }
                `}</style>

                <div style={{ flex: 1, overflow: 'hidden' }}>
                    {viewMode === 'home' && <HomeDashboard />}
                    {viewMode === 'performance' && <div style={{ overflowY: 'auto', height: '100%' }}><PerformanceView /></div>}
                    {viewMode === 'certification' && <div style={{ overflowY: 'auto', height: '100%' }}><CertificationView /></div>}
                    {viewMode === 'my-work' && <div style={{ padding: '16px', height: '100%' }}><MyWorkView /></div>}
                    {viewMode === 'project' && <div style={{ padding: '16px', height: '100%' }}><ProjectView /></div>}
                    {viewMode === 'admin-settings' && <div style={{ padding: '16px', height: '100%' }}><AdminSettingsView /></div>}
                </div>
            </div>
        </main>
    );
}

export default function Home() {
    return (
        <AuthProvider>
            <ProjectProvider>
                <AppContent />
            </ProjectProvider>
        </AuthProvider>
    );
}
