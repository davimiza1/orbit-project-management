export type Status = 'backlog' | 'in-progress' | 'in-review' | 'done';
export type Priority = 'Low' | 'Medium' | 'High';
export type User = { id: string; name: string; email: string };
export type Project = { _id: string; name: string; key: string; color: string };
export type Comment = { _id: string; text: string; author: { _id: string; name: string }; createdAt: string };
export type Task = { _id: string; title: string; description: string; status: Status; priority: Priority; label: string; project: string; assignee?: { _id: string; name: string }; dueDate?: string; comments: Comment[]; checklist: { _id?: string; text: string; done: boolean }[]; createdAt: string };
