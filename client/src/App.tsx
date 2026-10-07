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
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
        onSuccess={(u, t) => {
          session.set(t);
          setUser(u);
        }}
      />
    );
  return (
    <Workspace
      user={user}
      onLogout={() => {
        session.clear();
        setUser(null);
      }}
      error={error}
      setError={setError}
    />
  );
}

function Auth({ onSuccess }: { onSuccess: (u: User, t: string) => void }) {
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
  onLogout,
  error,
  setError,
}: {
  user: User;
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
    api<Project[]>("/projects")
      .then((items) => {
        setProjects(items);
        if (items[0]) setActive(items[0]._id);
      })
      .catch((e) => setError(e.message));
  }, [setError]);
  useEffect(() => {
    if (!active) return;
    api<Task[]>(`/tasks?projectId=${active}`)
      .then((items) => {
        setTasks(items);
        setSelected(null);
      })
      .catch((e) => setError(e.message));
  }, [active, setError]);
  const updateTask = async (task: Task, patch: Partial<Task>) => {
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
        {view === "settings" ? (
          <Settings
            project={activeProject}
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
            const saved = await api<Task>(`/tasks/${selected._id}/comments`, {
              method: "POST",
              body: JSON.stringify({ text }),
            });
            setTasks((a) => a.map((x) => (x._id === saved._id ? saved : x)));
            setSelected(saved);
          }}
          onDelete={async () => {
            if (confirm("Delete this task?")) {
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
  onSaved,
}: {
  project?: Project;
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
        onSaved(
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
  onClose,
  onCreated,
}: {
  projectId: string;
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
            <select name="priority">
              <option>Low</option>
              <option selected>Medium</option>
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
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (p: Project) => void;
}) {
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
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
