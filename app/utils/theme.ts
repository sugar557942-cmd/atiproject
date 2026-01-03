export type ThemeType = 'marketing' | 'project' | 'sales' | 'it' | 'ops' | 'creative' | 'default';

export const getDepartmentTheme = (department: string): ThemeType => {
    const dept = department.toLowerCase().trim();

    if (dept.includes('마케팅') || dept.includes('marketing')) return 'marketing';
    if (dept.includes('프로젝트') || dept.includes('project')) return 'project';
    if (dept.includes('영업') || dept.includes('crm') || dept.includes('sales')) return 'sales';
    if (dept.includes('it') || dept.includes('지원') || dept.includes('support')) return 'it';
    if (dept.includes('운영') || dept.includes('operations')) return 'ops';
    if (dept.includes('크리에이티브') || dept.includes('디자인') || dept.includes('creative') || dept.includes('design')) return 'creative';

    return 'default';
};

export const getThemeStyles = (theme: ThemeType) => {
    switch (theme) {
        case 'marketing':
            return { background: 'var(--theme-marketing-bg)', color: 'var(--theme-marketing-text)', accent: 'var(--theme-marketing-accent)' };
        case 'project':
            return { background: 'var(--theme-project-bg)', color: 'var(--theme-project-text)', accent: 'var(--theme-project-accent)' };
        case 'sales':
            return { background: 'var(--theme-sales-bg)', color: 'var(--theme-sales-text)', accent: 'var(--theme-sales-accent)' };
        case 'it':
            return { background: 'var(--theme-it-bg)', color: 'var(--theme-it-text)', accent: 'var(--theme-it-accent)' };
        case 'ops':
            return { background: 'var(--theme-ops-bg)', color: 'var(--theme-ops-text)', accent: 'var(--theme-ops-accent)' };
        case 'creative':
            return { background: 'var(--theme-creative-bg)', color: 'var(--theme-creative-text)', accent: 'var(--theme-creative-accent)' };
        default:
            return { background: 'var(--bg-main)', color: 'var(--text-primary)', accent: 'var(--primary-color)' };
    }
};
