export type Status = 'backlog' | 'in-progress' | 'in-review' | 'done';
export type Priority = 'Low' | 'Medium' | 'High';
export type Task = { id: string; title: string; description: string; status: Status; priority: Priority; label: string; assignee: string; due: string; comments: number; checklist?: { text: string; done: boolean }[] };
