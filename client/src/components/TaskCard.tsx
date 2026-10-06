import { CalendarDays, MessageCircle } from 'lucide-react';
import type { Task } from '../types';

const initials = (name:string) => name.split(' ').map(x=>x[0]).join('');
export function TaskCard({ task, selected, onClick }:{task:Task;selected:boolean;onClick:()=>void}) {
  return <button className={`task-card ${selected?'selected':''}`} onClick={onClick}>
    <strong>{task.title}</strong><p>{task.description}</p>
    <div className="tags"><span className={`tag ${task.label.toLowerCase()}`}>{task.label}</span><span className={`tag priority ${task.priority.toLowerCase()}`}>{task.priority}</span></div>
    <div className="card-footer"><span className="avatar">{initials(task.assignee)}</span><span><CalendarDays/> {task.due}</span><span><MessageCircle/> {task.comments}</span></div>
  </button>;
}
