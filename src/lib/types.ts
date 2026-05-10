export type Role = 'Admin' | 'Member';

export type TaskStatus = 'To Do' | 'In Progress' | 'Done';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  ownerId: string;
  createdAt: string;
  members: ProjectMember[];
}

export interface ProjectMember {
  userId: string;
  role: Role;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  /** Assignee user id, or empty string if unassigned */
  assignedTo: string;
  dueDate: string;
  createdAt: string;
}