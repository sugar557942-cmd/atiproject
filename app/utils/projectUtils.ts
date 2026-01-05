export type ProjectStatus = 'Scheduled' | 'In Progress' | 'Completed';

export function getProjectStatus(startDate: string, endDate: string): ProjectStatus {
    const today = new Date().toISOString().split('T')[0];

    if (today < startDate) {
        return 'Scheduled';
    } else if (today > endDate) {
        return 'Completed';
    } else {
        return 'In Progress';
    }
}

export function getStatusStyle(status: ProjectStatus) {
    if (status === 'Scheduled') {
        return {
            background: '#f0f0f0',
            color: '#323338',
            border: '1px solid #d0d4e4'
        };
    } else if (status === 'In Progress') {
        return {
            background: '#00c875',
            color: 'white',
            border: 'none'
        };
    } else { // Completed
        return {
            background: '#323338',
            color: 'white',
            border: 'none'
        };
    }
}

export function getStatusLabel(status: ProjectStatus): string {
    switch (status) {
        case 'Scheduled': return '예정';
        case 'In Progress': return '진행 중';
        case 'Completed': return '완료';
        default: return status;
    }
}
