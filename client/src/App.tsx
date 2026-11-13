import { useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  Bell,
  ChevronDown,
  Filter,
  ListFilter,
  Plus,
  Search,
  Share2,
  SlidersHorizontal,
} from "lucide-react";
import { api, session } from "./api";
import { Sidebar } from "./components/Sidebar";
import { TaskCard } from "./components/TaskCard";
import { TaskDrawer } from "./components/TaskDrawer";
import type { Priority, Project, Status, Task, User } from "./types";

const columns: { id: Status; label: string }[] = [
  { id: "backlog", label: "Backlog" },
  { id: "in-progress", label: "In progress" },
  { id: "in-review", label: "In review" },
  { id: "done", label: "Done" },
];
const demoUser: User = { id: "demo-user", name: "Portfolio Guest", email: "demo@orbit.test" };
const demoProjects: Project[] = [
  { _id: "demo-atlas", name: "Atlas Website", key: "ATL", color: "#7f56d9" },
  { _id: "demo-mobile", name: "Mobile App", key: "MOB", color: "#1463e9" },
  { _id: "demo-growth", name: "Growth Experiments", key: "GRW", color: "#e8874f" },
];
const demoTasks: Task[] = [
  { _id:"task-1",title:"Finalize homepage direction",description:"Review the latest visual direction and prepare the approved handoff.",status:"in-progress",priority:"High",label:"Design",project:"demo-atlas",assignee:{_id:"demo-user",name:"Portfolio Guest"},dueDate:"2026-11-18",comments:[],checklist:[{text:"Review responsive states",done:true},{text:"Approve final copy",done:false}],createdAt:"2026-11-13T09:00:00.000Z" },
  { _id:"task-2",title:"Build analytics overview",description:"Create the core KPI view with loading and empty states.",status:"backlog",priority:"Medium",label:"Feature",project:"demo-atlas",assignee:{_id:"u-2",name:"Maya Chen"},dueDate:"2026-11-22",comments:[],checklist:[],createdAt:"2026-11-12T09:00:00.000Z" },
  { _id:"task-3",title:"QA authentication flow",description:"Test sign in, password reset, and session expiry behavior.",status:"in-review",priority:"High",label:"Bug",project:"demo-atlas",assignee:{_id:"u-3",name:"Jon Bell"},dueDate:"2026-11-16",comments:[{_id:"c-1",text:"All desktop cases are passing.",author:{_id:"u-3",name:"Jon Bell"},createdAt:"2026-11-13T08:00:00.000Z"}],checklist:[],createdAt:"2026-11-11T09:00:00.000Z" },
  { _id:"task-4",title:"Publish release notes",description:"Summarize the improvements included in this milestone.",status:"done",priority:"Low",label:"Content",project:"demo-atlas",assignee:{_id:"demo-user",name:"Portfolio Guest"},dueDate:"2026-11-13",comments:[],checklist:[],createdAt:"2026-11-10T09:00:00.000Z" },
  { _id:"task-5",title:"Navigation prototype",description:"Validate the new mobile navigation with five users.",status:"in-progress",priority:"Medium",label:"Research",project:"demo-mobile",assignee:{_id:"u-2",name:"Maya Chen"},dueDate:"2026-11-25",comments:[],checklist:[],createdAt:"2026-11-09T09:00:00.000Z" },
];
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [demo, setDemo] = useState(false);
  useEffect(() => {
    if (!session.get()) {
      setLoading(false);
      return;
    }
    api<{ user: User }>("/auth/me")
      .then((x) => setUser(x.user))
      .catch(() => session.clear())
      .finally(() => setLoading(false));
  }, []);
  if (loading) return <div className="splash">Loading Orbit…</div>;
  if (!user)
    return (
      <Auth
        onDemo={() => { setDemo(true); setUser(demoUser); }}
        onSuccess={(u, t) => {
          session.set(t);
          setUser(u);
        }}
      />
    );
  return (
    <Workspace
      user={user}
      demo={demo}
      onLogout={() => {
        session.clear();
        setDemo(false);
        setUser(null);
      }}
      error={error}
      setError={setError}
    />
  );
}

function Auth({ onSuccess, onDemo }: { onSuccess: (u: User, t: string) => void; onDemo: () => void }) {
  const [register, setRegister] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    try {
      const result = await api<{ token: string; user: User }>(
        `/auth/${register ? "register" : "login"}`,
        { method: "POST", body: JSON.stringify(Object.fromEntries(fd)) },
      );
      onSuccess(result.user, result.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to continue");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="auth-page">
      <section className="auth-brand">
        <div className="brand">orbit</div>
        <h1>
          Plan clearly.
          <br />
          Ship confidently.
        </h1>
        <p>
          A focused project workspace for teams who want less ceremony and more
          momentum.
        </p>
      </section>
      <form className="auth-card" onSubmit={submit}>
        <h2>{register ? "Create your workspace" : "Welcome back"}</h2>
        <p>
          {register
            ? "Start managing real projects in under a minute."
            : "Sign in to continue to your projects."}
        </p>
        <button type="button" className="demo-entry" onClick={onDemo}>
          <span><strong>Explore the live demo</strong><small>No account needed · changes reset on refresh</small></span>
          <span aria-hidden="true">→</span>
        </button>
        <div className="auth-divider"><span>or continue with an account</span></div>
        {register ? (
          <label>
            Name
            <input name="name" required minLength={2} placeholder="Your name" />
          </label>
        ) : null}
        <label>
          Email
          <input
            name="email"
            type="email"
            required
            placeholder="you@example.com"
          />
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            required
            minLength={8}
            placeholder="At least 8 characters"
          />
        </label>
        {error ? <div className="form-error">{error}</div> : null}
        <button className="primary auth-submit" disabled={busy}>
          {busy ? "Please wait…" : register ? "Create account" : "Sign in"}
        </button>
        <button
          type="button"
          className="auth-switch"
          onClick={() => {
            setRegister((x) => !x);
            setError("");
          }}
        >
          {register
            ? "Already have an account? Sign in"
            : "New to Orbit? Create an account"}
        </button>
      </form>
    </main>
  );
}

function Workspace({
  user,
  demo,
  onLogout,
  error,
  setError,
}: {
  user: User;
  demo: boolean;
  onLogout: () => void;
  error: string;
  setError: (v: string) => void;
}) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [active, setActive] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selected, setSelected] = useState<Task | null>(null);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [priority, setPriority] = useState<Priority | null>(null);
  const [sort, setSort] = useState<"newest" | "priority">("newest");
  const [view, setView] = useState<
    "board" | "list" | "settings" | "home" | "mine"
  >("board");
  const [modal, setModal] = useState<"task" | "project" | null>(null);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    if (demo) { setProjects(demoProjects); setActive(demoProjects[0]._id); return; }
    api<Project[]>("/projects")
      .then((items) => {
        setProjects(items);
        if (items[0]) setActive(items[0]._id);
      })
      .catch((e) => setError(e.message));
  }, [setError, demo]);
  useEffect(() => {
    if (!active) return;
    if (demo) { setTasks(demoTasks.filter((task) => task.project === active)); setSelected(null); return; }
    api<Task[]>(`/tasks?projectId=${active}`)
      .then((items) => {
        setTasks(items);
        setSelected(null);
      })
      .catch((e) => setError(e.message));
  }, [active, setError, demo]);
  const updateTask = async (task: Task, patch: Partial<Task>) => {
    if (demo) { const saved={...task,...patch}; setTasks((all)=>all.map((x)=>x._id===task._id?saved:x)); setSelected(saved); setNotice("Demo task updated"); setTimeout(()=>setNotice(""),1800); return; }
    try {
      const saved = await api<Task>(`/tasks/${task._id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
      setTasks((all) => all.map((x) => (x._id === saved._id ? saved : x)));
      setSelected(saved);
    } catch (e) {
      setError((e as Error).message);
    }
  };
  const visible = useMemo(() => {
    const rank: Record<Priority, number> = { High: 0, Medium: 1, Low: 2 };
    return [
      ...tasks.filter(
        (t) =>
          (!deferredQuery ||
            `${t.title} ${t.description}`
              .toLowerCase()
              .includes(deferredQuery.toLowerCase())) &&
          (!priority || t.priority === priority),
      ),
    ].sort((a, b) =>
      sort === "priority"
        ? rank[a.priority] - rank[b.priority]
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [tasks, deferredQuery, priority, sort]);
  const activeProject = projects.find((p) => p._id === active);
  const copyShare = async () => {
    await navigator.clipboard.writeText(location.href);
    setNotice("Project link copied");
    setTimeout(() => setNotice(""), 2200);
  };
  return (
    <div className={`app-shell ${selected ? "" : "no-drawer"}`}>
      <Sidebar
        projects={projects}
        active={active}
        onSelect={(id) => {
          setActive(id);
          setView("board");
        }}
        onAdd={() => setModal("project")}
        user={user}
        onLogout={onLogout}
        view={view}
        onView={(v) => setView(v as typeof view)}
      />
      <main className="content">
        <header>
          <div>
            <h1>
              {view === "home"
                ? "Project overview"
                : view === "mine"
                  ? "My tasks"
                  : activeProject?.name || "Your project"}
            </h1>
            <nav className="tabs">
              <button
                className={view === "board" ? "active" : ""}
                onClick={() => setView("board")}
              >
                Board
              </button>
              <button
                className={view === "list" ? "active" : ""}
                onClick={() => setView("list")}
              >
                List
              </button>
              <button
                className={view === "settings" ? "active" : ""}
                onClick={() => setView("settings")}
              >
                Settings
              </button>
            </nav>
          </div>
          <div className="header-actions">
            <button className="outline" onClick={copyShare}>
              <Share2 />
              Share
            </button>
            <button
              className="icon"
              aria-label="Focus search"
              onClick={() => document.getElementById("task-search")?.focus()}
            >
              <Search />
            </button>
            <button
              className="icon"
              aria-label="Notifications"
              onClick={() => setNotice("You are all caught up")}
            >
              <Bell />
            </button>
            <button
              className="primary"
              onClick={() => setModal("task")}
              disabled={!active}
            >
              <Plus />
              New task
            </button>
          </div>
        </header>
        {demo ? <div className="demo-banner"><strong>Interactive demo</strong><span>Everything works, but your changes stay in this tab and reset on refresh.</span></div> : null}
        {view === "settings" ? (
          <Settings
            project={activeProject}
            demo={demo}
            onSaved={(saved) =>
              setProjects((all) =>
                all.map((project) =>
                  project._id === saved._id ? saved : project,
                ),
              )
            }
          />
        ) : view === "home" ? (
          <Overview tasks={tasks} projects={projects} />
        ) : (
          <>
            <div className="toolbar">
              <label>
                <Search />
                <input
                  id="task-search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search tasks..."
                />
              </label>
              <button
                onClick={() =>
                  setPriority((p) =>
                    p === "High"
                      ? "Medium"
                      : p === "Medium"
                        ? "Low"
                        : p === "Low"
                          ? null
                          : "High",
                  )
                }
                className={priority ? "pressed" : ""}
              >
                <Filter />
                Filter{priority ? <span>{priority}</span> : null}
                <ChevronDown />
              </button>
              <button
                onClick={() =>
                  setSort((x) => (x === "newest" ? "priority" : "newest"))
                }
              >
                <SlidersHorizontal />
                Sort: {sort}
                <ChevronDown />
              </button>
            </div>
            {view === "list" || view === "mine" ? (
              <TaskList tasks={visible} onSelect={setSelected} />
            ) : (
              <div className="board">
                {columns.map((col) => (
                  <section className="column" key={col.id}>
                    <div className="column-head">
                      <strong>{col.label}</strong>
                      <span>
                        {visible.filter((t) => t.status === col.id).length}
                      </span>
                      <ListFilter />
                    </div>
                    {visible
                      .filter((t) => t.status === col.id)
                      .map((t) => (
                        <TaskCard
                          key={t._id}
                          task={t}
                          selected={selected?._id === t._id}
                          onClick={() => setSelected(t)}
                        />
                      ))}
                    <button
                      className="add-task"
                      onClick={() => setModal("task")}
                    >
                      <Plus />
                      Add a task
                    </button>
                  </section>
                ))}
              </div>
            )}
          </>
        )}
        {error ? (
          <div className="toast error" onClick={() => setError("")}>
            {error}
          </div>
        ) : null}
        {notice ? <div className="toast">{notice}</div> : null}
      </main>
      {selected ? (
        <TaskDrawer
          task={selected}
          onClose={() => setSelected(null)}
          onUpdate={(p) => updateTask(selected, p)}
          onComment={async (text) => {
            if (demo) { const comment={_id:`demo-comment-${Date.now()}`,text,author:{_id:user.id,name:user.name},createdAt:new Date().toISOString()}; updateTask(selected,{comments:[...selected.comments,comment]}); return; }
            const saved = await api<Task>(`/tasks/${selected._id}/comments`, {
              method: "POST",
              body: JSON.stringify({ text }),
            });
            setTasks((a) => a.map((x) => (x._id === saved._id ? saved : x)));
            setSelected(saved);
          }}
          onDelete={async () => {
            if (confirm("Delete this task?")) {
              if (demo) { setTasks((a)=>a.filter((x)=>x._id!==selected._id)); setSelected(null); setNotice("Demo task deleted"); setTimeout(()=>setNotice(""),1800); return; }
              await api(`/tasks/${selected._id}`, { method: "DELETE" });
              setTasks((a) => a.filter((x) => x._id !== selected._id));
              setSelected(null);
            }
          }}
        />
      ) : null}
      {modal === "task" ? (
        <TaskModal
          projectId={active}
          demo={demo}
          onClose={() => setModal(null)}
          onCreated={(t) => {
            setTasks((a) => [t, ...a]);
            setSelected(t);
            setModal(null);
          }}
        />
      ) : null}
      {modal === "project" ? (
        <ProjectModal
          demo={demo}
          onClose={() => setModal(null)}
          onCreated={(p) => {
            setProjects((a) => [...a, p]);
            setActive(p._id);
            setModal(null);
          }}
        />
      ) : null}
    </div>
  );
}

function TaskList({
  tasks,
  onSelect,
}: {
  tasks: Task[];
  onSelect: (t: Task) => void;
}) {
  return (
    <div className="task-list">
      <div className="task-row head">
        <span>Task</span>
        <span>Status</span>
        <span>Priority</span>
        <span>Due date</span>
      </div>
      {tasks.map((t) => (
        <button className="task-row" key={t._id} onClick={() => onSelect(t)}>
          <strong>{t.title}</strong>
          <span>{t.status.replace("-", " ")}</span>
          <span>{t.priority}</span>
          <span>
            {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "—"}
          </span>
        </button>
      ))}
      {!tasks.length ? (
        <div className="empty">No tasks match this view.</div>
      ) : null}
    </div>
  );
}
function Overview({ tasks, projects }: { tasks: Task[]; projects: Project[] }) {
  return (
    <div className="overview">
      <h2>Welcome back</h2>
      <p>
        Your workspace has {projects.length} project
        {projects.length === 1 ? "" : "s"} and {tasks.length} task
        {tasks.length === 1 ? "" : "s"}.
      </p>
      <div className="overview-grid">
        {columns.map((c) => (
          <div key={c.id}>
            <strong>{tasks.filter((t) => t.status === c.id).length}</strong>
            <span>{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
function Settings({
  project,
  demo,
  onSaved,
}: {
  project?: Project;
  demo: boolean;
  onSaved: (project: Project) => void;
}) {
  const [name, setName] = useState(project?.name || "");
  const [color, setColor] = useState(project?.color || "#1463e9");
  useEffect(() => {
    setName(project?.name || "");
    setColor(project?.color || "#1463e9");
  }, [project?._id, project?.name, project?.color]);
  if (!project)
    return <div className="settings-view">Select a project first.</div>;
  return (
    <form
      className="settings-view"
      onSubmit={async (event) => {
        event.preventDefault();
        onSaved(demo ? {...project,name,color} :
          await api<Project>(`/projects/${project._id}`, {
            method: "PATCH",
            body: JSON.stringify({ name, color }),
          }),
        );
      }}
    >
      <h2>Project settings</h2>
      <label>
        Project name
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          minLength={2}
        />
      </label>
      <label>
        Project key
        <input value={project.key} readOnly />
      </label>
      <label>
        Project color
        <input
          type="color"
          value={color}
          onChange={(event) => setColor(event.target.value)}
        />
      </label>
      <button className="primary settings-save">Save changes</button>
    </form>
  );
}
function TaskModal({
  projectId,
  demo,
  onClose,
  onCreated,
}: {
  projectId: string;
  demo: boolean;
  onClose: () => void;
  onCreated: (t: Task) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    try {
      if (demo) {
        const values=Object.fromEntries(fd);
        onCreated({_id:`demo-task-${Date.now()}`,title:String(values.title),description:String(values.description||""),status:values.status as Status,priority:values.priority as Priority,label:"Feature",project:projectId,assignee:{_id:demoUser.id,name:demoUser.name},dueDate:String(values.dueDate||""),comments:[],checklist:[],createdAt:new Date().toISOString()});
        return;
      }
      onCreated(
        await api<Task>("/tasks", {
          method: "POST",
          body: JSON.stringify({ ...Object.fromEntries(fd), projectId }),
        }),
      );
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <form
        className="modal"
        onMouseDown={(e) => e.stopPropagation()}
        onSubmit={submit}
      >
        <h2>Create a new task</h2>
        <p>Add work to the current project.</p>
        <label>
          Task title
          <input name="title" required minLength={2} autoFocus />
        </label>
        <label>
          Description
          <textarea name="description" />
        </label>
        <div className="form-grid">
          <label>
            Status
            <select name="status">
              {columns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Priority
            <select name="priority" defaultValue="Medium">
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </label>
        </div>
        <label>
          Due date
          <input name="dueDate" type="date" />
        </label>
        {error ? <div className="form-error">{error}</div> : null}
        <div>
          <button type="button" className="outline" onClick={onClose}>
            Cancel
          </button>
          <button className="primary" disabled={busy}>
            {busy ? "Creating…" : "Create task"}
          </button>
        </div>
      </form>
    </div>
  );
}
function ProjectModal({
  demo,
  onClose,
  onCreated,
}: {
  demo: boolean;
  onClose: () => void;
  onCreated: (p: Project) => void;
}) {
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (demo) { const values=Object.fromEntries(fd); const name=String(values.name); onCreated({_id:`demo-project-${Date.now()}`,name,key:name.slice(0,3).toUpperCase(),color:String(values.color)}); return; }
    onCreated(
      await api<Project>("/projects", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(fd)),
      }),
    );
  }
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <form
        className="modal"
        onMouseDown={(e) => e.stopPropagation()}
        onSubmit={submit}
      >
        <h2>New project</h2>
        <p>Create another place for your team's work.</p>
        <label>
          Project name
          <input name="name" required minLength={2} autoFocus />
        </label>
        <label>
          Color
          <input name="color" type="color" defaultValue="#7f56d9" />
        </label>
        <div>
          <button type="button" className="outline" onClick={onClose}>
            Cancel
          </button>
          <button className="primary">Create project</button>
        </div>
      </form>
    </div>
  );
}
