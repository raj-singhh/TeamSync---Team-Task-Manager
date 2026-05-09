import { User, Project, Task } from './types';

export const mockUsers: User[] = [
  { id: 'u1', name: 'Alex Rivera', email: 'alex@teamsync.com', avatarUrl: 'https://picsum.photos/seed/alex/100/100' },
  { id: 'u2', name: 'Jordan Lee', email: 'jordan@teamsync.com', avatarUrl: 'https://picsum.photos/seed/jordan/100/100' },
  { id: 'u3', name: 'Sam Smith', email: 'sam@teamsync.com', avatarUrl: 'https://picsum.photos/seed/sam/100/100' },
];

export const mockProjects: Project[] = [
  {
    id: 'p1',
    title: 'Website Redesign',
    description: 'Modernizing our main landing page and dashboard.',
    ownerId: 'u1',
    createdAt: new Date().toISOString(),
    members: [
      { userId: 'u1', role: 'Admin' },
      { userId: 'u2', role: 'Member' },
    ],
  },
  {
    id: 'p2',
    title: 'Mobile App Launch',
    description: 'Coordinating the release of our iOS and Android applications.',
    ownerId: 'u2',
    createdAt: new Date().toISOString(),
    members: [
      { userId: 'u2', role: 'Admin' },
      { userId: 'u1', role: 'Member' },
      { userId: 'u3', role: 'Member' },
    ],
  },
];

export const mockTasks: Task[] = [
  {
    id: 't1',
    projectId: 'p1',
    title: 'Design high-fidelity mockups',
    description: 'Create final UI designs in Figma for all breakpoints.',
    status: 'In Progress',
    assignedTo: 'u1',
    dueDate: '2024-12-01',
    createdAt: new Date().toISOString(),
  },
  {
    id: 't2',
    projectId: 'p1',
    title: 'Setup production database',
    description: 'Configure the cloud database and migration scripts.',
    status: 'To Do',
    assignedTo: 'u2',
    dueDate: '2024-11-20',
    createdAt: new Date().toISOString(),
  },
  {
    id: 't3',
    projectId: 'p2',
    title: 'App Store Submission',
    description: 'Prepare metadata and assets for submission.',
    status: 'Done',
    assignedTo: 'u2',
    dueDate: '2024-11-15',
    createdAt: new Date().toISOString(),
  },
];
