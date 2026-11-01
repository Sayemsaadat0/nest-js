export interface Ticket {
    id: number;
    title: string;
    subject: string;
    description: string;
    priority?: 'low' | 'medium' | 'high';
    status?: 'open' | 'in_progress' | 'closed';
    createdAt: string;
}
