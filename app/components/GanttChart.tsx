"use client";

import React, { useState, useRef, useEffect } from 'react';
import styles from './GanttChart.module.css';
import { useProject, RnRItem } from '../store/ProjectContext';
import {
    differenceInDays, addDays, format, parseISO,
    startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear,
    addWeeks, addMonths, addYears, subWeeks, subMonths, subYears,
    eachDayOfInterval, eachMonthOfInterval,
    isSameMonth, set, isValid
} from 'date-fns';
import { ChevronRight, ChevronDown, ChevronLeft, Calendar as CalIcon } from 'lucide-react';

export function GanttChart() {
    const { project, updateRnRItem, toggleCollapse } = useProject();
    const [viewMode, setViewMode] = useState<'Year' | 'Month' | 'Week'>('Month');
    const [currentDate, setCurrentDate] = useState(new Date());

    // --- Date Logic ---
    const handlePrev = () => {
        if (viewMode === 'Week') setCurrentDate(d => subWeeks(d, 1));
        if (viewMode === 'Month') setCurrentDate(d => subMonths(d, 1));
        if (viewMode === 'Year') setCurrentDate(d => subYears(d, 1));
    };

    const handleNext = () => {
        if (viewMode === 'Week') setCurrentDate(d => addWeeks(d, 1));
        if (viewMode === 'Month') setCurrentDate(d => addMonths(d, 1));
        if (viewMode === 'Year') setCurrentDate(d => addYears(d, 1));
    };

    let columns: { label: string, subLabel?: string, date: Date }[] = [];
    let rangeStart: Date;
    let rangeEnd: Date;
    let cellWidth = 40;

    try {
        if (viewMode === 'Week') {
            rangeStart = startOfWeek(currentDate);
            rangeEnd = endOfWeek(currentDate);
            const days = eachDayOfInterval({ start: rangeStart, end: rangeEnd });
            columns = days.map(d => ({ label: format(d, 'd'), subLabel: format(d, 'EEE'), date: d }));
            cellWidth = 100;
        } else if (viewMode === 'Month') {
            rangeStart = startOfMonth(currentDate);
            rangeEnd = endOfMonth(currentDate);
            const days = eachDayOfInterval({ start: rangeStart, end: rangeEnd });
            columns = days.map(d => ({ label: format(d, 'd'), subLabel: format(d, 'EEE'), date: d }));
            cellWidth = 40;
        } else {
            // Year
            rangeStart = startOfYear(currentDate);
            rangeEnd = endOfYear(currentDate);
            // eachMonthOfInterval throws if start > end ? Should be fine for 1 year
            const months = eachMonthOfInterval({ start: rangeStart, end: rangeEnd });
            columns = months.map(d => ({ label: format(d, 'MMM'), date: d }));
            cellWidth = 80;
        }
    } catch (e) {
        console.error("Date Error:", e);
        // Fallback
        rangeStart = new Date();
        rangeEnd = new Date();
        columns = [];
    }

    // Helper to get bar position
    const getBarPosition = (itemStart: string, itemEnd: string) => {
        try {
            const s = parseISO(itemStart);
            const e = parseISO(itemEnd);

            if (!isValid(s) || !isValid(e)) return { left: 0, width: 0 };

            if (viewMode === 'Year') {
                const diffDaysStart = differenceInDays(s, rangeStart);
                const durationDays = differenceInDays(e, s) + 1;
                const pxPerDay = cellWidth / 30.44;
                return {
                    left: diffDaysStart * pxPerDay,
                    width: durationDays * pxPerDay
                };
            } else {
                const offset = differenceInDays(s, rangeStart);
                const duration = differenceInDays(e, s) + 1;
                return {
                    left: offset * cellWidth,
                    width: duration * cellWidth
                };
            }
        } catch (error) {
            return { left: 0, width: 0 };
        }
    };

    const headerLabel = viewMode === 'Year' ? format(currentDate, 'yyyy') : format(currentDate, 'yyyy. MM');

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '12px' }}>
            {/* Control Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: 'bold' }}>
                        {headerLabel}
                        <div style={{ display: 'flex', gap: '4px' }}>
                            <button onClick={handlePrev} className={styles.navBtn}><ChevronLeft size={20} /></button>
                            <button onClick={handleNext} className={styles.navBtn}><ChevronRight size={20} /></button>
                        </div>
                    </div>
                    <button onClick={() => setCurrentDate(new Date())} className={styles.todayBtn}>Today</button>
                </div>

                <div className={styles.viewToggle}>
                    {(['Year', 'Month', 'Week'] as const).map(mode => (
                        <button
                            key={mode}
                            className={`${styles.toggleBtn} ${viewMode === mode ? styles.active : ''}`}
                            onClick={() => setViewMode(mode)}
                        >
                            {mode}
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.ganttContainer}>
                {/* Sidebar for Task Names */}
                <div className={styles.taskList}>
                    <div className={styles.headerCell} style={{ background: '#f5f6f8' }}>업무명</div>
                    {project.rnrItems.map(item => (
                        <div key={item.id} className={styles.taskNameRow} style={{ paddingLeft: item.level * 16 }}>
                            {item.level < 3 && (
                                <button className={styles.collapseBtn} onClick={() => toggleCollapse(item.id)}>
                                    {item.collapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                                </button>
                            )}
                            {item.level === 3 && <span style={{ width: 12 }}></span>}
                            <span className={styles.nameText}>{item.name}</span>
                        </div>
                    ))}
                </div>

                {/* Timeline Area */}
                <div className={styles.timelineScroller}>
                    <div className={styles.timelineHeader} style={{ width: columns.length * cellWidth }}>
                        {columns.map((col, i) => (
                            <div key={i} className={styles.headerTimeCell} style={{ width: cellWidth, background: '#f5f6f8' }}>
                                <div className={styles.dayNum} style={{ fontSize: viewMode === 'Year' ? '13px' : '14px' }}>{col.label}</div>
                                {col.subLabel && <div className={styles.dayStr}>{col.subLabel}</div>}
                            </div>
                        ))}
                    </div>

                    <div className={styles.gridBody} style={{ width: columns.length * cellWidth }}>
                        {/* Grid Lines */}
                        <div className={styles.gridLines}>
                            {columns.map((_, i) => (
                                <div key={i} className={styles.gridLine} style={{ width: cellWidth }}></div>
                            ))}
                        </div>

                        {/* Bars */}
                        {project.rnrItems.map(item => {
                            const { left, width } = getBarPosition(item.startDate, item.endDate);
                            // Different color per level
                            const color = item.level === 1 ? 'var(--primary-color)' : item.level === 2 ? '#a25ddc' : '#00c875';

                            // Hide bars out of range?
                            // Simple optimization: only render if overlapping range
                            // Safe validation
                            const itemStart = parseISO(item.startDate);
                            const itemEnd = parseISO(item.endDate);
                            if (!isValid(itemStart) || !isValid(itemEnd)) return null;

                            if (itemEnd < rangeStart || itemStart > rangeEnd) return <div key={item.id} className={styles.barRow}></div>;

                            return (
                                <div key={item.id} className={styles.barRow}>
                                    <div
                                        className={styles.bar}
                                        style={{
                                            left: Math.max(0, left), // Clip left
                                            width: width,
                                            backgroundColor: color,
                                            // Handle clipping right side if needed, but overflow hidden container handles it
                                        }}
                                        title={`${item.startDate} ~ ${item.endDate}`}
                                    >
                                        <span className={styles.barLabel}>{item.assignee}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
