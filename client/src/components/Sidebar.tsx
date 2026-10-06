import { Bell, CheckSquare2, ChevronDown, Home, Plus } from 'lucide-react';

export function Sidebar() {
  return <aside className="sidebar">
    <a className="brand" href="#">orbit</a>
    <button className="workspace"><span className="workspace-mark">N</span><strong>Northstar</strong><ChevronDown size={15}/></button>
    <nav className="main-nav">
      <a href="#"><Home/><span>Home</span></a><a href="#"><CheckSquare2/><span>My tasks</span></a><a href="#"><Bell/><span>Inbox</span><b>3</b></a>
    </nav>
    <div className="nav-section"><div className="nav-title"><span>Projects</span><Plus size={16}/></div>
      <a className="project active"><i className="blue"/>Website redesign</a><a className="project"><i className="violet"/>Mobile app</a><a className="project"><i className="green"/>Growth experiments</a>
    </div>
    <button className="profile"><span className="avatar maya">MC</span><span><strong>Maya Chen</strong><small>maya@northstar.co</small></span><ChevronDown size={14}/></button>
  </aside>;
}
