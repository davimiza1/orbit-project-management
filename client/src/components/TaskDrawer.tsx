import { CalendarDays, ChevronDown, Ellipsis, Send, X } from 'lucide-react';
import type { Task } from '../types';

export function TaskDrawer({task,onClose,onToggle}:{task:Task;onClose:()=>void;onToggle:(i:number)=>void}){
  const complete=task.checklist?.filter(x=>x.done).length??0;
  return <aside className="drawer">
    <div className="drawer-actions"><button aria-label="More"><Ellipsis/></button><button aria-label="Close" onClick={onClose}><X/></button></div>
    <h2>{task.title}</h2>
    <div className="fields"><label>Status <button><i className="status-dot"/>{task.status.replace('-',' ')}<ChevronDown/></button></label><label>Assignee <button><span className="avatar">MC</span>{task.assignee}<ChevronDown/></button></label><label>Due date <button><CalendarDays/>{task.due}<ChevronDown/></button></label><label>Priority <button><i className="priority-dot"/>{task.priority}<ChevronDown/></button></label><label>Labels <span className="tag product">{task.label}</span></label></div>
    <section><div className="section-head"><h3>Description</h3><button>Edit</button></div><p>{task.description}</p></section>
    <section><div className="section-head"><h3>Checklist</h3><span>{complete}/{task.checklist?.length??0}</span></div>{task.checklist?.map((item,i)=><label className="check" key={item.text}><input type="checkbox" checked={item.done} onChange={()=>onToggle(i)}/><span>{item.text}</span></label>)}</section>
    <section><div className="section-head"><h3>Comments <em>{task.comments}</em></h3></div><div className="comment"><span className="avatar">DP</span><p><strong>Daniel Park <small>2 days ago</small></strong>This is looking great! The new flow feels much clearer.</p></div><div className="comment"><span className="avatar maya">PS</span><p><strong>Priya Shah <small>1 day ago</small></strong>Can we also add an option to skip the product tour?</p></div><div className="comment-box"><span className="avatar">MC</span><input placeholder="Add a comment..."/><button aria-label="Send"><Send/></button></div></section>
  </aside>
}
