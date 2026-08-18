/**
 * Harbor Ledger design reminder: use a navigation rail, ledger lines, warm paper surfaces,
 * and vermilion only for decisive actions and urgency. Typography is editorial, never generic.
 */
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  CircleDotDashed,
  ClipboardList,
  Command,
  LayoutDashboard,
  Loader2,
  Menu,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  SlidersHorizontal,
  Trash2,
  UsersRound,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

type Employee = {
  id: number;
  name: string;
  email: string;
  department: string;
  jobTitle: string;
};

type TaskStatus = "TODO" | "IN_PROGRESS" | "COMPLETED";
type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

type Task = {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  employeeId: number;
};

const MARK_URL = "/assets/digitalbyte-compass-mark.png";
const ROUTE_BOARD_URL = "/assets/harbor-ledger-route-board.png";
const FOCUS_CARD_URL = "/assets/harbor-ledger-focus-card.png";

const seedEmployees: Employee[] = [
  { id: 1, name: "Rahul Sharma", email: "rahul@example.com", department: "Engineering", jobTitle: "Java Developer" },
  { id: 2, name: "Priya Singh", email: "priya@example.com", department: "People Operations", jobTitle: "HR Manager" },
  { id: 3, name: "Amit Mehta", email: "amit@example.com", department: "Engineering", jobTitle: "QA Engineer" },
  { id: 4, name: "Neha Verma", email: "neha@example.com", department: "Design", jobTitle: "Product Designer" },
];

const seedTasks: Task[] = [
  { id: 101, title: "Complete Spring Boot training", description: "Finish the assigned Spring Boot development training.", status: "IN_PROGRESS", priority: "HIGH", dueDate: "2026-08-30", employeeId: 1 },
  { id: 102, title: "Review onboarding checklist", description: "Audit the new employee setup flow before Friday.", status: "TODO", priority: "MEDIUM", dueDate: "2026-08-24", employeeId: 2 },
  { id: 103, title: "Regression test employee APIs", description: "Verify employee search and validation scenarios.", status: "COMPLETED", priority: "HIGH", dueDate: "2026-08-19", employeeId: 3 },
  { id: 104, title: "Refine task status patterns", description: "Create status interaction states for the workboard.", status: "TODO", priority: "LOW", dueDate: "2026-09-04", employeeId: 4 },
  { id: 105, title: "Map task assignment flow", description: "Document manager task assignment experience.", status: "IN_PROGRESS", priority: "MEDIUM", dueDate: "2026-08-28", employeeId: 4 },
];

const statusCopy: Record<TaskStatus, string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
};

function initials(name: string) {
  return name.split(" ").map((part) => part[0]).slice(0, 2).join("");
}

function dueLabel(date: string) {
  const dateValue = new Date(`${date}T00:00:00`);
  return dateValue.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function Home() {
  const [activeView, setActiveView] = useState<"dashboard" | "employees" | "tasks" | "settings">("dashboard");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>(seedEmployees);
  const [tasks, setTasks] = useState<Task[]>(seedTasks);
  const [apiBaseUrl, setApiBaseUrl] = useState(() => localStorage.getItem("digitalbyte-api-url") ?? "");
  const [connectionState, setConnectionState] = useState<"loading" | "connected" | "preview">("loading");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | TaskStatus>("ALL");
  const [employeeDialogOpen, setEmployeeDialogOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [notice, setNotice] = useState("");
  const [loadingAction, setLoadingAction] = useState(false);

  const loadData = async () => {
    setConnectionState("loading");
    try {
      const [employeeResponse, taskResponse] = await Promise.all([
        fetch(`${apiBaseUrl.replace(/\/$/, "")}/api/employees`),
        fetch(`${apiBaseUrl.replace(/\/$/, "")}/api/tasks`),
      ]);
      if (!employeeResponse.ok || !taskResponse.ok) throw new Error("Backend not reachable");
      const [employeeData, taskData] = await Promise.all([employeeResponse.json(), taskResponse.json()]);
      setEmployees(employeeData);
      setTasks(taskData);
      setConnectionState("connected");
      setNotice("Connected to the Spring Boot API.");
    } catch {
      setConnectionState("preview");
      setNotice("Preview data is active. Start the backend at the configured API URL to use live data.");
    }
  };

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const completedCount = tasks.filter((task) => task.status === "COMPLETED").length;
  const inProgressCount = tasks.filter((task) => task.status === "IN_PROGRESS").length;
  const todoCount = tasks.filter((task) => task.status === "TODO").length;
  const completionRate = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;

  const filteredTasks = useMemo(() => tasks.filter((task) => {
    const owner = employees.find((employee) => employee.id === task.employeeId)?.name ?? "Unassigned";
    const matchesSearch = `${task.title} ${task.description} ${owner}`.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  }), [tasks, employees, search, statusFilter]);

  const filteredEmployees = useMemo(() => employees.filter((employee) =>
    `${employee.name} ${employee.department} ${employee.jobTitle}`.toLowerCase().includes(search.toLowerCase())), [employees, search]);

  const createEmployee = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      department: String(form.get("department") ?? ""),
      jobTitle: String(form.get("jobTitle") ?? ""),
    };
    const employeeId = editingEmployee?.id;
    setLoadingAction(true);
    try {
      if (connectionState === "connected") {
        const response = await fetch(`${apiBaseUrl.replace(/\/$/, "")}/api/employees${employeeId ? `/${employeeId}` : ""}`, {
          method: employeeId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error("Could not save employee");
        const saved = await response.json();
        setEmployees((current) => employeeId ? current.map((employee) => employee.id === employeeId ? saved : employee) : [...current, saved]);
      } else {
        setEmployees((current) => employeeId ? current.map((employee) => employee.id === employeeId ? { id: employeeId, ...payload } : employee) : [...current, { id: Date.now(), ...payload }]);
      }
      setEmployeeDialogOpen(false);
      setEditingEmployee(null);
      setNotice(connectionState === "connected" ? employeeId ? "Employee record updated." : "Employee added to the workboard." : employeeId ? "Employee updated in preview mode." : "Employee added in preview mode.");
    } catch {
      setNotice("Employee could not be saved. Check the API connection and try again.");
    } finally {
      setLoadingAction(false);
    }
  };

  const createTask = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      title: String(form.get("title") ?? ""),
      description: String(form.get("description") ?? ""),
      priority: String(form.get("priority") ?? "MEDIUM") as TaskPriority,
      dueDate: String(form.get("dueDate") ?? ""),
      employeeId: Number(form.get("employeeId")),
    };
    const taskId = editingTask?.id;
    const requestPayload = taskId ? { ...payload, status: editingTask?.status ?? "TODO" } : payload;
    setLoadingAction(true);
    try {
      if (connectionState === "connected") {
        const response = await fetch(`${apiBaseUrl.replace(/\/$/, "")}/api/tasks${taskId ? `/${taskId}` : ""}`, {
          method: taskId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(requestPayload),
        });
        if (!response.ok) throw new Error("Could not save task");
        const saved = await response.json();
        setTasks((current) => taskId ? current.map((task) => task.id === taskId ? saved : task) : [...current, saved]);
      } else {
        setTasks((current) => taskId ? current.map((task) => task.id === taskId ? { id: taskId, status: task.status, ...payload } : task) : [...current, { id: Date.now(), status: "TODO", ...payload }]);
      }
      setTaskDialogOpen(false);
      setEditingTask(null);
      setNotice(connectionState === "connected" ? taskId ? "Task details updated." : "Task assigned successfully." : taskId ? "Task updated in preview mode." : "Task assigned in preview mode.");
    } catch {
      setNotice("Task could not be saved. Check the API connection and try again.");
    } finally {
      setLoadingAction(false);
    }
  };

  const updateStatus = async (task: Task, status: TaskStatus) => {
    const previousTasks = tasks;
    setTasks((current) => current.map((item) => item.id === task.id ? { ...item, status } : item));
    try {
      if (connectionState === "connected") {
        const response = await fetch(`${apiBaseUrl.replace(/\/$/, "")}/api/tasks/${task.id}/status`, {
          method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }),
        });
        if (!response.ok) throw new Error("Could not update status");
      }
      setNotice(connectionState === "connected" ? "Task status updated." : "Task status updated in preview mode.");
    } catch {
      setTasks(previousTasks);
      setNotice("Task status could not be updated.");
    }
  };

  const deleteEmployee = async (employee: Employee) => {
    if (!window.confirm(`Remove ${employee.name} and the tasks assigned to this employee?`)) return;
    try {
      if (connectionState === "connected") {
        const response = await fetch(`${apiBaseUrl.replace(/\/$/, "")}/api/employees/${employee.id}`, { method: "DELETE" });
        if (!response.ok) throw new Error("Could not delete employee");
      }
      setEmployees((current) => current.filter((item) => item.id !== employee.id));
      setTasks((current) => current.filter((task) => task.employeeId !== employee.id));
      setNotice(connectionState === "connected" ? "Employee and assigned tasks removed." : "Employee removed in preview mode.");
    } catch {
      setNotice("Employee could not be removed.");
    }
  };

  const deleteTask = async (task: Task) => {
    if (!window.confirm(`Remove the task “${task.title}”?`)) return;
    try {
      if (connectionState === "connected") {
        const response = await fetch(`${apiBaseUrl.replace(/\/$/, "")}/api/tasks/${task.id}`, { method: "DELETE" });
        if (!response.ok) throw new Error("Could not delete task");
      }
      setTasks((current) => current.filter((item) => item.id !== task.id));
      setNotice(connectionState === "connected" ? "Task removed from the ledger." : "Task removed in preview mode.");
    } catch {
      setNotice("Task could not be removed.");
    }
  };

  const handleEmployeeDialog = (open: boolean) => {
    setEmployeeDialogOpen(open);
    if (!open) setEditingEmployee(null);
  };

  const handleTaskDialog = (open: boolean) => {
    setTaskDialogOpen(open);
    if (!open) setEditingTask(null);
  };

  const saveApiUrl = () => {
    localStorage.setItem("digitalbyte-api-url", apiBaseUrl);
    void loadData();
  };

  const navItems = [
    { id: "dashboard", label: "Overview", icon: LayoutDashboard },
    { id: "employees", label: "Employees", icon: UsersRound },
    { id: "tasks", label: "Task ledger", icon: ClipboardList },
    { id: "settings", label: "Connection", icon: Settings2 },
  ] as const;

  const pageMeta = {
    dashboard: { kicker: "Workboard / 01", title: "Keep the work moving, not just listed.", copy: "A clear read on team capacity, task motion, and the work that needs a decision." },
    employees: { kicker: "People / 02", title: "The people behind the progress.", copy: "Manage employee records and inspect the work each team member owns." },
    tasks: { kicker: "Task ledger / 03", title: "Every assignment has a visible route.", copy: "Filter active work, adjust status, and keep delivery ownership clear." },
    settings: { kicker: "Connection / 04", title: "Point the workboard at your API.", copy: "Use preview data now, then connect the dashboard to your Spring Boot backend when it is running." },
  }[activeView];

  return (
    <div className="workboard-shell">
      <aside className={`navigation-rail ${mobileNavOpen ? "is-open" : ""}`} aria-label="Primary navigation">
        <div className="brand-lockup">
          <img src={MARK_URL} alt="DigitalByte workboard mark" className="brand-mark" />
          <div>
            <p className="brand-name">DigitalByte</p>
            <p className="brand-subtitle">Workboard</p>
          </div>
          <button className="mobile-close" onClick={() => setMobileNavOpen(false)} aria-label="Close navigation"><X size={18} /></button>
        </div>
        <div className="rail-rule" />
        <nav className="rail-nav">
          <p className="rail-label">Navigate</p>
          {navItems.map((item, index) => {
            const Icon = item.icon;
            return <button key={item.id} className={`nav-item ${activeView === item.id ? "is-active" : ""}`} onClick={() => { setActiveView(item.id); setMobileNavOpen(false); }}>
              <span className="nav-index">0{index + 1}</span><Icon size={18} strokeWidth={1.7} /><span>{item.label}</span>
            </button>;
          })}
        </nav>
        <div className="rail-spacer" />
        <div className="api-status-card">
          <span className={`connection-dot ${connectionState === "connected" ? "live" : ""}`} />
          <p>{connectionState === "connected" ? "Live API connected" : connectionState === "loading" ? "Checking API" : "Preview workspace"}</p>
          <small>{connectionState === "connected" ? "Spring Boot · port 8080" : "Local interaction state"}</small>
        </div>
        <div className="rail-user"><div className="avatar avatar-rail">MK</div><div><p>Manager desk</p><small>Operations</small></div><MoreHorizontal size={18} /></div>
      </aside>

      <main className="workboard-main">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMobileNavOpen(true)} aria-label="Open navigation"><Menu size={22} /></button>
          <div className="breadcrumb"><Command size={14} /><span>DigitalByte</span><span className="crumb-separator">/</span><strong>{pageMeta.kicker}</strong></div>
          <div className="topbar-actions">
            <button className="icon-button" aria-label="Refresh dashboard" onClick={() => void loadData()}><RefreshCw size={17} className={connectionState === "loading" ? "spin" : ""} /></button>
            <div className="date-chip"><CalendarClock size={15} /><span>18 Aug 2026</span></div>
          </div>
        </header>

        <section className="page-heading">
          <div>
            <p className="section-kicker">{pageMeta.kicker}</p>
            <h1>{pageMeta.title}</h1>
            <p className="heading-copy">{pageMeta.copy}</p>
          </div>
          <div className="heading-actions">
            {activeView !== "settings" && <div className="search-field"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={activeView === "employees" ? "Search people or teams" : "Search tasks or owners"} /></div>}
            {activeView === "employees" && <EmployeeDialog open={employeeDialogOpen} setOpen={handleEmployeeDialog} onSubmit={createEmployee} loading={loadingAction} employee={editingEmployee} />}
            {activeView !== "employees" && activeView !== "settings" && <TaskDialog employees={employees} open={taskDialogOpen} setOpen={handleTaskDialog} onSubmit={createTask} loading={loadingAction} task={editingTask} />}
          </div>
        </section>

        {notice && <div className={`notice-strip ${connectionState === "connected" ? "is-live" : ""}`}><span>{connectionState === "connected" ? <Wifi size={15} /> : <WifiOff size={15} />}</span><p>{notice}</p><button onClick={() => setNotice("")} aria-label="Dismiss notice"><X size={15} /></button></div>}

        {activeView === "dashboard" && <DashboardView employees={employees} tasks={tasks} completionRate={completionRate} todoCount={todoCount} inProgressCount={inProgressCount} completedCount={completedCount} onViewTasks={() => setActiveView("tasks")} onStatusUpdate={updateStatus} />}
        {activeView === "employees" && <EmployeesView employees={filteredEmployees} tasks={tasks} onAddEmployee={() => { setEditingEmployee(null); setEmployeeDialogOpen(true); }} onEditEmployee={(employee) => { setEditingEmployee(employee); setEmployeeDialogOpen(true); }} onDeleteEmployee={deleteEmployee} />}
        {activeView === "tasks" && <TasksView tasks={filteredTasks} employees={employees} statusFilter={statusFilter} setStatusFilter={setStatusFilter} onAddTask={() => { setEditingTask(null); setTaskDialogOpen(true); }} onEditTask={(task) => { setEditingTask(task); setTaskDialogOpen(true); }} onDeleteTask={deleteTask} onStatusUpdate={updateStatus} />}
        {activeView === "settings" && <SettingsView apiBaseUrl={apiBaseUrl} setApiBaseUrl={setApiBaseUrl} connectionState={connectionState} onSave={saveApiUrl} />}
      </main>
    </div>
  );
}

function EmployeeDialog({ open, setOpen, onSubmit, loading, employee }: { open: boolean; setOpen: (open: boolean) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void; loading: boolean; employee: Employee | null }) {
  return <Dialog open={open} onOpenChange={setOpen}>{!employee && <DialogTrigger asChild><Button className="primary-action"><Plus size={17} /> Add employee</Button></DialogTrigger>}<DialogContent className="ledger-dialog"><DialogHeader><p className="dialog-kicker">People registry</p><DialogTitle>{employee ? "Update colleague record" : "Add a colleague"}</DialogTitle><DialogDescription>{employee ? "Keep the employee profile current and easy to find." : "Create an employee record and assign work immediately after."}</DialogDescription></DialogHeader><form onSubmit={onSubmit} className="dialog-form"><label>Full name<input name="name" required defaultValue={employee?.name ?? ""} placeholder="Rahul Sharma" /></label><label>Email address<input name="email" type="email" required defaultValue={employee?.email ?? ""} placeholder="rahul@example.com" /></label><div className="form-split"><label>Department<input name="department" required defaultValue={employee?.department ?? ""} placeholder="Engineering" /></label><label>Job title<input name="jobTitle" required defaultValue={employee?.jobTitle ?? ""} placeholder="Java Developer" /></label></div><DialogFooter><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit" className="primary-action" disabled={loading}>{loading && <Loader2 size={15} className="spin" />}{employee ? "Update record" : "Save employee"}</Button></DialogFooter></form></DialogContent></Dialog>;
}

function TaskDialog({ employees, open, setOpen, onSubmit, loading, task }: { employees: Employee[]; open: boolean; setOpen: (open: boolean) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void; loading: boolean; task: Task | null }) {
  return <Dialog open={open} onOpenChange={setOpen}>{!task && <DialogTrigger asChild><Button className="primary-action"><Plus size={17} /> Assign task</Button></DialogTrigger>}<DialogContent className="ledger-dialog"><DialogHeader><p className="dialog-kicker">{task ? "Task detail" : "New assignment"}</p><DialogTitle>{task ? "Update the task route" : "Assign a focused task"}</DialogTitle><DialogDescription>{task ? "Clarify the work, owner, priority, and deadline before the next review." : "Make the owner, priority, and deadline explicit from the start."}</DialogDescription></DialogHeader><form onSubmit={onSubmit} className="dialog-form"><label>Task title<input name="title" required defaultValue={task?.title ?? ""} placeholder="Complete Spring Boot training" /></label><label>Context<textarea name="description" required defaultValue={task?.description ?? ""} placeholder="Describe the expected outcome and any useful context." /></label><div className="form-split"><label>Priority<select name="priority" defaultValue={task?.priority ?? "MEDIUM"}><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option></select></label><label>Due date<input name="dueDate" type="date" required defaultValue={task?.dueDate ?? "2026-08-30"} /></label></div><label>Task owner<select name="employeeId" required defaultValue={task?.employeeId ?? employees[0]?.id}>{employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name} · {employee.department}</option>)}</select></label><DialogFooter><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit" className="primary-action" disabled={loading}>{loading && <Loader2 size={15} className="spin" />}{task ? "Save task" : "Assign task"}</Button></DialogFooter></form></DialogContent></Dialog>;
}

function DashboardView({ employees, tasks, completionRate, todoCount, inProgressCount, completedCount, onViewTasks, onStatusUpdate }: { employees: Employee[]; tasks: Task[]; completionRate: number; todoCount: number; inProgressCount: number; completedCount: number; onViewTasks: () => void; onStatusUpdate: (task: Task, status: TaskStatus) => void }) {
  const recentTasks = tasks.slice(0, 4);
  const priorityCount = tasks.filter((task) => task.priority === "HIGH" && task.status !== "COMPLETED").length;
  return <>
    <section className="dashboard-hero">
      <div className="hero-copy"><p className="eyebrow"><span /> Operations pulse</p><h2>Today’s work has <em>{inProgressCount} active routes.</em></h2><p>Spot priorities, unblock owners, and keep every task moving through a shared, visible workboard.</p><div className="hero-actions"><Button className="primary-action" onClick={onViewTasks}>Open task ledger <ArrowUpRight size={16} /></Button><button className="quiet-action">View team capacity <ArrowDownRight size={16} /></button></div><div className="hero-route"><span>Starting point</span><i /><span>Delivery</span></div></div>
      <div className="hero-art"><img src={ROUTE_BOARD_URL} alt="Abstract task route board illustration" /><div className="hero-art-note"><CircleDotDashed size={17} /><span><strong>{completionRate}%</strong> work completed</span></div></div>
    </section>
    <section className="metric-row" aria-label="Task summary"><MetricCard index="01" label="Total colleagues" value={employees.length.toString().padStart(2, "0")} delta="Active team" icon={UsersRound} tone="navy" /><MetricCard index="02" label="In motion" value={inProgressCount.toString().padStart(2, "0")} delta="Across 3 teams" icon={Activity} tone="blue" /><MetricCard index="03" label="Completed" value={`${completionRate}%`} delta={`${completedCount} items closed`} icon={CheckCircle2} tone="sea" /><MetricCard index="04" label="Needs attention" value={priorityCount.toString().padStart(2, "0")} delta="High priority" icon={CalendarClock} tone="vermillion" /></section>
    <section className="dashboard-grid"><div className="ledger-panel"><div className="panel-heading"><div><p className="section-kicker">Task movement</p><h3>Active work ledger</h3></div><button className="panel-link" onClick={onViewTasks}>See all tasks <ArrowUpRight size={15} /></button></div><div className="status-ribbon"><StatusMini label="To do" value={todoCount} status="TODO" /><StatusMini label="In progress" value={inProgressCount} status="IN_PROGRESS" /><StatusMini label="Completed" value={completedCount} status="COMPLETED" /></div><div className="task-list">{recentTasks.map((task) => <TaskRow key={task.id} task={task} employee={employees.find((employee) => employee.id === task.employeeId)} onStatusUpdate={onStatusUpdate} compact />)}</div></div>
      <aside className="focus-panel"><div className="focus-art"><img src={FOCUS_CARD_URL} alt="Abstract task focus illustration" /></div><div className="focus-content"><p className="section-kicker">Manager focus</p><h3>Give the next decision a name.</h3><p>High-priority tasks become clearer when ownership and due date stay visible in the same frame.</p><button className="focus-link" onClick={onViewTasks}>Review urgent work <ArrowUpRight size={16} /></button></div></aside>
    </section>
  </>;
}

function MetricCard({ index, label, value, delta, icon: Icon, tone }: { index: string; label: string; value: string; delta: string; icon: typeof UsersRound; tone: string }) { return <article className={`metric-card tone-${tone}`}><div className="metric-top"><span>{index}</span><div className="metric-icon"><Icon size={18} /></div></div><p>{label}</p><strong>{value}</strong><small>{delta}</small></article>; }
function StatusMini({ label, value, status }: { label: string; value: number; status: TaskStatus }) { return <div className="status-mini"><span className={`status-dot status-${status.toLowerCase()}`} /><span>{label}</span><strong>{value}</strong></div>; }

function EmployeesView({ employees, tasks, onAddEmployee, onEditEmployee, onDeleteEmployee }: { employees: Employee[]; tasks: Task[]; onAddEmployee: () => void; onEditEmployee: (employee: Employee) => void; onDeleteEmployee: (employee: Employee) => void }) { return <section className="ledger-panel full-panel"><div className="panel-heading"><div><p className="section-kicker">People registry</p><h3>Employee directory</h3></div><Button className="primary-action" onClick={onAddEmployee}><Plus size={17} /> Add employee</Button></div><div className="data-table"><div className="table-head employee-grid"><span>Colleague</span><span>Department</span><span>Current work</span><span>Profile</span></div>{employees.map((employee) => { const taskCount = tasks.filter((task) => task.employeeId === employee.id && task.status !== "COMPLETED").length; return <div className="table-row employee-grid" key={employee.id}><div className="owner-cell"><div className="avatar">{initials(employee.name)}</div><div><strong>{employee.name}</strong><small>{employee.email}</small></div></div><span className="department-cell">{employee.department}</span><span><b className="task-count">{taskCount}</b> active tasks</span><div><p>{employee.jobTitle}</p><div className="row-actions"><button className="row-action" onClick={() => onEditEmployee(employee)}><Pencil size={13} /> Edit</button><button className="row-action destructive-action" onClick={() => onDeleteEmployee(employee)}><Trash2 size={13} /> Remove</button></div></div></div>; })}{employees.length === 0 && <EmptyState icon={UsersRound} text="No employees matched this view." />}</div></section>; }

function TasksView({ tasks, employees, statusFilter, setStatusFilter, onAddTask, onEditTask, onDeleteTask, onStatusUpdate }: { tasks: Task[]; employees: Employee[]; statusFilter: "ALL" | TaskStatus; setStatusFilter: (value: "ALL" | TaskStatus) => void; onAddTask: () => void; onEditTask: (task: Task) => void; onDeleteTask: (task: Task) => void; onStatusUpdate: (task: Task, status: TaskStatus) => void }) { return <section className="ledger-panel full-panel"><div className="panel-heading"><div><p className="section-kicker">Assigned work</p><h3>Task ledger</h3></div><div className="inline-actions"><div className="filter-wrap"><SlidersHorizontal size={15} /><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "ALL" | TaskStatus)}><option value="ALL">All statuses</option><option value="TODO">To do</option><option value="IN_PROGRESS">In progress</option><option value="COMPLETED">Completed</option></select><ChevronDown size={14} /></div><Button className="primary-action" onClick={onAddTask}><Plus size={17} /> Assign task</Button></div></div><div className="task-list task-list-full">{tasks.map((task) => <TaskRow key={task.id} task={task} employee={employees.find((employee) => employee.id === task.employeeId)} onStatusUpdate={onStatusUpdate} onEdit={onEditTask} onDelete={onDeleteTask} />)}{tasks.length === 0 && <EmptyState icon={ClipboardList} text="No tasks matched this view." />}</div></section>; }

function TaskRow({ task, employee, onStatusUpdate, onEdit, onDelete, compact = false }: { task: Task; employee?: Employee; onStatusUpdate: (task: Task, status: TaskStatus) => void; onEdit?: (task: Task) => void; onDelete?: (task: Task) => void; compact?: boolean }) { const nextStatus: Record<TaskStatus, TaskStatus> = { TODO: "IN_PROGRESS", IN_PROGRESS: "COMPLETED", COMPLETED: "TODO" }; return <article className={`task-row ${compact ? "compact" : ""}`}><div className="task-route"><span className={`status-dot status-${task.status.toLowerCase()}`} /><i /></div><div className="task-title"><div className="task-title-line"><h4>{task.title}</h4><span className={`priority priority-${task.priority.toLowerCase()}`}>{task.priority}</span></div><p>{task.description}</p></div><div className="task-owner"><div className="avatar">{employee ? initials(employee.name) : "—"}</div><div><strong>{employee?.name ?? "Unassigned"}</strong><small>{employee?.department ?? "No owner"}</small></div></div><div className="task-due"><CalendarClock size={15} /><span>{dueLabel(task.dueDate)}</span></div><button className={`status-button status-${task.status.toLowerCase()}`} onClick={() => onStatusUpdate(task, nextStatus[task.status])}>{statusCopy[task.status]} <ChevronDown size={14} /></button>{!compact && <div className="task-actions"><button className="row-action" onClick={() => onEdit?.(task)} aria-label={`Edit ${task.title}`}><Pencil size={13} /></button><button className="row-action destructive-action" onClick={() => onDelete?.(task)} aria-label={`Remove ${task.title}`}><Trash2 size={13} /></button></div>}</article>; }
function EmptyState({ icon: Icon, text }: { icon: typeof UsersRound; text: string }) { return <div className="empty-state"><Icon size={22} /><p>{text}</p></div>; }

function SettingsView({ apiBaseUrl, setApiBaseUrl, connectionState, onSave }: { apiBaseUrl: string; setApiBaseUrl: (value: string) => void; connectionState: "loading" | "connected" | "preview"; onSave: () => void }) { return <section className="settings-layout"><div className="connection-card"><div className="connection-illustration"><img src={MARK_URL} alt="DigitalByte compass mark" /></div><p className="section-kicker">API connection</p><h3>{connectionState === "connected" ? "Your workboard is live." : "Preview the dashboard, then connect your API."}</h3><p>The frontend reads the Employee and Task endpoints from your existing Spring Boot project. Enter the address where it is running and refresh the connection.</p><div className="connection-state"><span className={`connection-dot ${connectionState === "connected" ? "live" : ""}`} />{connectionState === "connected" ? "Connected to live data" : connectionState === "loading" ? "Checking the API" : "Showing preview data"}</div></div><div className="ledger-panel connection-form"><p className="section-kicker">Backend address</p><h3>Where is your Spring Boot API?</h3><p className="field-help">For local development, keep the default URL. The API should be running on port 8080.</p><label className="url-input"><span>Base URL</span><input value={apiBaseUrl} onChange={(event) => setApiBaseUrl(event.target.value)} placeholder="http://localhost:8080" /></label><div className="connection-buttons"><Button className="primary-action" onClick={onSave}><RefreshCw size={16} /> Save and reconnect</Button><a href={`${apiBaseUrl.replace(/\/$/, "")}/api/employees`} target="_blank" rel="noreferrer" className="secondary-link">Test employees endpoint <ArrowUpRight size={15} /></a></div><div className="api-endpoints"><p>Expected routes</p><code>GET /api/employees</code><code>GET /api/tasks</code><code>PATCH /api/tasks/&#123;id&#125;/status</code></div></div></section>; }
