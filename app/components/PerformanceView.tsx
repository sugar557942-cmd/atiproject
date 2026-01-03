"use client";


import React from 'react';
import {
    BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { Activity, Plus, FileSpreadsheet } from 'lucide-react';

import { PerformanceDetailModal, PerformanceData, ProjectItem } from './PerformanceDetailModal';

export function PerformanceView() {
    // Dynamic Year Generation
    const currentYear = new Date().getFullYear();
    const startYear = 2018;
    const years = Array.from({ length: currentYear - startYear + 1 }, (_, i) => startYear + i);

    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [selectedDetailYear, setSelectedDetailYear] = React.useState<number>(currentYear);

    // Mock Data Store - in a real app this would come from an API or Context
    const [performanceStore, setPerformanceStore] = React.useState<Record<number, PerformanceData>>({
        2018: {
            us: [],
            jp: [
                {
                    id: 'c1', companyName: 'KANSI FUJI SASH', projects: [
                        { id: 'p1', projectName: '신니혼바시', startDate: '2018.08', endDate: '2018.12', weight: '77,520.39' }
                    ]
                },
                {
                    id: 'c2', companyName: 'KEEPRO', projects: [
                        { id: 'p2-1', projectName: '니시신쥬쿠', startDate: '2018.01', endDate: '2018.06', weight: '46,035.91' },
                        { id: 'p2-2', projectName: '타케시바', startDate: '2018.07', endDate: '2018.12', weight: '12,467.97' }
                    ]
                },
                {
                    id: 'c3', companyName: 'KINKI TEC', projects: [
                        { id: 'p3-1', projectName: '난페이다이', startDate: '2018.01', endDate: '2018.11', weight: '32,500.51' },
                        { id: 'p3-2', projectName: '토라노몬', startDate: '2018.04', endDate: '2018.07', weight: '52,095.85' }
                    ]
                },
                {
                    id: 'c4', companyName: 'LIXIL', projects: [
                        { id: 'p4-1', projectName: 'OH-1', startDate: '2018.01', endDate: '2018.11', weight: '29,864.41' },
                        { id: 'p4-2', projectName: '소토칸다', startDate: '2018.01', endDate: '2018.12', weight: '32,500.51' },
                        { id: 'p4-3', projectName: '니시신쥬쿠', startDate: '2018.02', endDate: '2018.12', weight: '23,555.88' },
                        { id: 'p4-4', projectName: '시세이도', startDate: '2018.01', endDate: '2018.06', weight: '107,379.90' }
                    ]
                },
                {
                    id: 'c5', companyName: 'OKUJU', projects: [
                        { id: 'p5-1', projectName: '무로마치 3쵸메', startDate: '2018.11', endDate: '2018.12', weight: '6,276.11' }
                    ]
                },
                {
                    id: 'c6', companyName: 'SASSIN', projects: [
                        { id: 'p6-1', projectName: '니시신쥬쿠', startDate: '2018.12', endDate: '2018.12', weight: '12,048.72' }
                    ]
                },
                {
                    id: 'c7', companyName: 'TOKYO KIKO', projects: [
                        { id: 'p7-1', projectName: '니시신쥬쿠', startDate: '2018.02', endDate: '2018.12', weight: '90,422.31' }
                    ]
                },
                {
                    id: 'c8', companyName: 'YAMANAKA', projects: [
                        { id: 'p8-1', projectName: '칸다니시키', startDate: '2018.05', endDate: '2018.12', weight: '43,149.25' }
                    ]
                }
            ]
        },
        2019: {
            us: [
                {
                    id: 'us1', companyName: 'US Corp A', projects: [
                        { id: 'usp1', projectName: 'Project Alpha', startDate: '2019.03', endDate: '2019.09', weight: '50,000.00' },
                        { id: 'usp2', projectName: 'Project Beta', startDate: '2019.01', endDate: '2019.06', weight: '30,000.00' }
                    ]
                }
            ],
            jp: [
                {
                    id: 'jp5', companyName: 'JP Corp E', projects: [
                        { id: 'jpp5', projectName: 'Project Epsilon', startDate: '2019.07', endDate: '2019.12', weight: '60,000.00' }
                    ]
                }
            ]
        },
        // Fill up to current year if needed, or rely on fallback empty objects
        ...Array.from({ length: currentYear - 2019 }, (_, i) => 2020 + i).reduce((acc, year) => ({ ...acc, [year]: { us: [], jp: [] } }), {})
    });

    const handleYearClick = (year: number) => {
        setSelectedDetailYear(year);
        setIsModalOpen(true);
    };

    const handleSaveData = (data: PerformanceData) => {
        setPerformanceStore(prev => ({
            ...prev,
            [selectedDetailYear]: data
        }));
        console.log('Saved data for', selectedDetailYear, data);
    };

    const [analysisTab, setAnalysisTab] = React.useState<'us' | 'jp'>('jp');

    // Helper: Calculate Yearly Trends (Global)
    const yearlyTrendData = React.useMemo(() => {
        return years.map(y => {
            const data = performanceStore[y] || { us: [], jp: [] };

            // Sum US
            const usTotal = data.us.reduce((acc, company) => {
                return acc + company.projects.reduce((cAcc, p) => {
                    const w = parseFloat((p.weight || '0').replace(/,/g, ''));
                    return cAcc + (isNaN(w) ? 0 : w);
                }, 0);
            }, 0);

            // Sum JP
            const jpTotal = data.jp.reduce((acc, company) => {
                return acc + company.projects.reduce((cAcc, p) => {
                    const w = parseFloat((p.weight || '0').replace(/,/g, ''));
                    return cAcc + (isNaN(w) ? 0 : w);
                }, 0);
            }, 0);

            return {
                name: `${y}년`,
                us: Math.round(usTotal),
                jp: Math.round(jpTotal)
            };
        });
    }, [performanceStore, years]);

    // Helper: Calculate Company Breakdown (Cumulative across ALL years)
    const companyChartData = React.useMemo(() => {
        const companyMap = new Map<string, number>();

        years.forEach(year => {
            const yearData = performanceStore[year];
            if (!yearData) return;

            const targetList = analysisTab === 'us' ? yearData.us : yearData.jp;

            targetList.forEach(company => {
                const totalWeight = company.projects.reduce((acc, p) => {
                    const w = parseFloat((p.weight || '0').replace(/,/g, ''));
                    return acc + (isNaN(w) ? 0 : w);
                }, 0);

                if (totalWeight > 0) {
                    const current = companyMap.get(company.companyName) || 0;
                    companyMap.set(company.companyName, current + totalWeight);
                }
            });
        });

        // Convert to array and sort by value descending
        return Array.from(companyMap.entries())
            .map(([name, value]) => ({
                name,
                value: Math.round(value)
            }))
            .sort((a, b) => b.value - a.value);
    }, [performanceStore, years, analysisTab]);

    // Chart Interaction Handlers
    const handleChartClick = (data: any) => {
        if (data && data.activeLabel) {
            const yearStr = data.activeLabel; // "2018년"
            const year = parseInt(yearStr.replace('년', ''));
            if (!isNaN(year)) {
                setSelectedDetailYear(year);
                setIsModalOpen(true);
            }
        }
    };

    const handleBarClick = (data: any) => {
        if (data && data.name) {
            const companyName = data.name;

            // Find the most recent year this company has data
            // We search backwards from the latest year
            const reversedYears = [...years].reverse();
            const targetYear = reversedYears.find(year => {
                const yearData = performanceStore[year];
                if (!yearData) return false;
                const list = analysisTab === 'us' ? yearData.us : yearData.jp;
                return list.some(c => c.companyName === companyName);
            });

            if (targetYear) {
                setSelectedDetailYear(targetYear);
            }
            // Open modal (defaults to current selected or the found one)
            setIsModalOpen(true);
        }
    };

    return (
        <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity color="#0073ea" /> 실적 현황
            </h1>

            {/* Input Selection Section */}
            <div style={{ background: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>실적 데이터 입력</h3>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {years.map(y => (
                        <button
                            key={y}
                            onClick={() => handleYearClick(y)}
                            style={{
                                padding: '6px 12px',
                                background: y === selectedDetailYear ? '#e5f4ff' : 'white',
                                border: y === selectedDetailYear ? '1px solid #0073ea' : '1px solid #e6e9ef',
                                borderRadius: '6px',
                                fontSize: '13px',
                                fontWeight: '600',
                                color: y === selectedDetailYear ? '#0073ea' : '#323338',
                                cursor: 'pointer',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                                transition: 'all 0.2s',
                                flex: '0 0 auto'
                            }}
                        >
                            {y}년
                        </button>
                    ))}
                    <button style={{
                        padding: '6px 12px',
                        background: '#f5f6f8',
                        border: '1px dashed #ccc',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        color: '#666',
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        <Plus size={16} />
                    </button>
                </div>
            </div>

            {/* Top Section: Yearly Trends (Small Charts) */}
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>연도별 실적 추이</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                {/* JP Trend */}
                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#676879', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ width: '8px', height: '8px', background: '#4e84b8', borderRadius: '50%' }}></span>
                            일본팀 연간 총 실적
                        </h3>
                    </div>
                    <div style={{ height: '180px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={yearlyTrendData}
                                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                                onClick={handleChartClick}
                                style={{ cursor: 'pointer' }}
                            >
                                <defs>
                                    <linearGradient id="colorJp" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4e84b8" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#4e84b8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: 11 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: 11 }} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <Area type="monotone" dataKey="jp" stroke="#4e84b8" fillOpacity={1} fill="url(#colorJp)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* US Trend */}
                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#676879', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ width: '8px', height: '8px', background: '#2ecc71', borderRadius: '50%' }}></span>
                            미국팀 연간 총 실적
                        </h3>
                    </div>
                    <div style={{ height: '180px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={yearlyTrendData}
                                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                                onClick={handleChartClick}
                                style={{ cursor: 'pointer' }}
                            >
                                <defs>
                                    <linearGradient id="colorUs" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2ecc71" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#2ecc71" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: 11 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: 11 }} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <Area type="monotone" dataKey="us" stroke="#2ecc71" fillOpacity={1} fill="url(#colorUs)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Company Detailed Chart */}
            <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>업체별 누적 실적 분석 (전체기간)</h3>

                    {/* Tabs */}
                    <div style={{ background: '#f5f6f8', padding: '4px', borderRadius: '8px', display: 'flex' }}>
                        <button
                            onClick={() => setAnalysisTab('jp')}
                            style={{
                                padding: '6px 16px',
                                borderRadius: '6px',
                                border: 'none',
                                background: analysisTab === 'jp' ? 'white' : 'transparent',
                                color: analysisTab === 'jp' ? '#0073ea' : '#666',
                                fontWeight: '600',
                                boxShadow: analysisTab === 'jp' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                                cursor: 'pointer',
                                fontSize: '13px'
                            }}
                        >
                            일본팀
                        </button>
                        <button
                            onClick={() => setAnalysisTab('us')}
                            style={{
                                padding: '6px 16px',
                                borderRadius: '6px',
                                border: 'none',
                                background: analysisTab === 'us' ? 'white' : 'transparent',
                                color: analysisTab === 'us' ? '#0073ea' : '#666',
                                fontWeight: '600',
                                boxShadow: analysisTab === 'us' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                                cursor: 'pointer',
                                fontSize: '13px'
                            }}
                        >
                            미국팀
                        </button>
                    </div>
                </div>

                <div style={{ height: '300px', width: '100%' }}>
                    {companyChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={companyChartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: 12 }} interval={0} angle={-15} dy={10} textAnchor="end" />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: 12 }} />
                                <Tooltip
                                    cursor={{ fill: '#f5f6f8' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Bar
                                    dataKey="value"
                                    fill={analysisTab === 'jp' ? '#4e84b8' : '#2ecc71'}
                                    radius={[4, 4, 0, 0]}
                                    barSize={50}
                                    onClick={handleBarClick}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {companyChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={analysisTab === 'jp' ? '#4e84b8' : '#2ecc71'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#ccc' }}>
                            <FileSpreadsheet size={48} strokeWidth={1} style={{ marginBottom: '12px' }} />
                            <p>데이터가 없습니다.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            <PerformanceDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                year={selectedDetailYear}
                initialData={performanceStore[selectedDetailYear]}
                onSave={handleSaveData}
            />

            <div style={{ marginTop: '24px', background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#676879' }}>상세 실적 데이터</h3>
                <div style={{ height: '150px', background: '#f5f6f8', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9699a6' }}>
                    테이블 데이터 영역
                </div>
            </div>
        </div>
    );
}
