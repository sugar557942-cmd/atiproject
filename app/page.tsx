"use client";

import { useState } from 'react';
import { ProjectView } from './components/ProjectView';
import { ProjectList } from './components/ProjectList';
import { ProjectProvider, useProject } from './store/ProjectContext';
import { AuthProvider, useAuth } from './store/AuthContext';
import { LoginView } from './components/LoginView';
import { HomeDashboard } from './components/HomeDashboard';
import { MyWorkView } from './components/MyWorkView';
import { PerformanceView } from './components/PerformanceView';
import { CertificationView } from './components/CertificationView';
import { AdminSettingsView } from './components/AdminSettingsView';
import { MobileTabBar } from './components/MobileTabBar';
import { UserProfileMenu } from './components/UserProfileMenu';

function AppContent() {
    const { user } = useAuth();
    const { viewMode } = useProject();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isEntered, setIsEntered] = useState(false);

    if (!user) {
        return <LoginView />;
    }

    if (!isEntered) {
        return <LoginView onContinue={() => setIsEntered(true)} />;
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
                {/* Global Header */}
                <header style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 24px',
                    background: 'white',
                    borderBottom: '1px solid #e6e9ef',
                    height: '60px',
                    flexShrink: 0
                }}>
                    <div style={{ fontWeight: 700, fontSize: '18px', color: '#0073ea', letterSpacing: '-0.5px' }}>
                        ATI Project
                    </div>
                    <div>
                        <UserProfileMenu />
                    </div>
                </header>

                <style jsx>{`
                    @media (max-width: 768px) {
                        /* Add padding bottom to content for TabBar */
                        .content-area { padding-bottom: 60px !important; }
                    }
                `}</style>
                <div className="content-area" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    {viewMode === 'home' && <HomeDashboard />}
                    {viewMode === 'performance' && <div style={{ overflowY: 'auto', height: '100%' }}><PerformanceView /></div>}
                    {viewMode === 'certification' && <div style={{ overflowY: 'auto', height: '100%' }}><CertificationView /></div>}
                    {viewMode === 'my-work' && <div style={{ padding: '16px', height: '100%' }}><MyWorkView /></div>}
                    {viewMode === 'project' && <div style={{ padding: '16px', height: '100%' }}><ProjectView /></div>}
                    {viewMode === 'admin-settings' && <div style={{ padding: '16px', height: '100%' }}><AdminSettingsView /></div>}
                </div>
            </div>
            <MobileTabBar onOpenMenu={() => setIsSidebarOpen(true)} />
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
