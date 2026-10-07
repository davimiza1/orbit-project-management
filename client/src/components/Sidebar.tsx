import { Bell, CheckSquare2, ChevronDown, Home, LogOut, Plus } from 'lucide-react';
import type { Project, User } from '../types';
const initials=(name:string)=>name.split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase();
export function Sidebar({projects,active,onSelect,onAdd,user,onLogout,view,onView}:{projects:Project[];active?:string;onSelect:(id:string)=>void;onAdd:()=>void;user:User;onLogout:()=>void;view:string;onView:(v:string)=>void}) {
  return <aside className="sidebar"><a className="brand" href="#" onClick={e=>{e.preventDefault();onView('board')}}>orbit</a>
    <button className="workspace" onClick={()=>alert('You are using your personal Orbit workspace.')}><span className="workspace-mark">O</span><strong>My workspace</strong><ChevronDown size={15}/></button>
    <nav className="main-nav"><a className={view==='home'?'active-nav':''} href="#" onClick={e=>{e.preventDefault();onView('home')}}><Home/><span>Home</span></a><a className={view==='mine'?'active-nav':''} href="#" onClick={e=>{e.preventDefault();onView('mine')}}><CheckSquare2/><span>My tasks</span></a><a href="#" onClick={e=>{e.preventDefault();alert('You have no unread notifications.')}}><Bell/><span>Inbox</span><b>0</b></a></nav>
    <div className="nav-section"><div className="nav-title"><span>Projects</span><button className="bare" aria-label="Add project" onClick={onAdd}><Plus size={16}/></button></div>{projects.map(p=><a href="#" key={p._id} className={`project ${active===p._id?'active':''}`} onClick={e=>{e.preventDefault();onSelect(p._id)}}><i style={{background:p.color}}/>{p.name}</a>)}</div>
    <button className="profile" onClick={onLogout}><span className="avatar maya">{initials(user.name)}</span><span><strong>{user.name}</strong><small>{user.email}</small></span><LogOut size={14}/></button>
  </aside>;
}
