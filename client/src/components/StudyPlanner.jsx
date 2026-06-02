import { useState, useEffect } from "react";
import { api } from "../utils/api";

const COLORS = ["#ffffff", "#e5e5e5", "#d4d4d4", "#a3a3a3", "#fafafa", "#c4c4c4", "#bdbdbd", "#9ca3af"];
const PRIORITIES = { low: "#a3a3a3", medium: "#d4d4d4", high: "#ffffff" };

function PlanCard({ plan, onToggleTask, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const done = plan.tasks.filter(t => t.done).length;
  const pct = plan.tasks.length ? Math.round((done / plan.tasks.length) * 100) : 0;
  const daysLeft = plan.targetDate ? Math.ceil((new Date(plan.targetDate) - Date.now()) / 86400000) : null;

  return (
    <div style={{ background: "var(--card-bg)", border: `1px solid ${plan.color}28`, borderRadius: 14, overflow: "hidden" }}>
      <div style={{ height: 3, background: `linear-gradient(90deg,${plan.color},${plan.color}66)` }} />
      <div style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{plan.subject}</div>
            {plan.description && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2, lineHeight: 1.5 }}>{plan.description}</div>}
          </div>
          <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
            <button onClick={() => setExpanded(e => !e)} style={{ width: 26, height: 26, borderRadius: 6, background: "var(--card-bg)", border: "1px solid var(--panel-border)", cursor: "pointer", color: "var(--text-muted)", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>{expanded ? "▲" : "▼"}</button>
            <button onClick={() => onDelete(plan._id)} style={{ width: 26, height: 26, borderRadius: 6, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.18)", cursor: "pointer", color: "#e5e5e5", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          </div>
        </div>
        {plan.tasks.length > 0 && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{done}/{plan.tasks.length} tasks</span>
              <span style={{ fontSize: 10, color: plan.color, fontWeight: 700 }}>{pct}%</span>
            </div>
            <div style={{ height: 4, borderRadius: 2, background: "var(--panel-border)" }}>
              <div style={{ height: "100%", width: `${pct}%`, borderRadius: 2, background: plan.color, transition: "width 0.5s ease" }} />
            </div>
          </div>
        )}
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {daysLeft !== null && (
            <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 5, background: daysLeft < 3 ? "rgba(255,255,255,0.12)" : "var(--card-bg)", color: daysLeft < 3 ? "#e5e5e5" : "var(--text-muted)", fontWeight: 600 }}>
              {daysLeft < 0 ? "Overdue" : daysLeft === 0 ? "Due today" : `${daysLeft}d left`}
            </span>
          )}
          {plan.reminder?.email && (
            <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 5, background: "rgba(255,255,255,0.12)", color: "#e5e5e5", fontWeight: 600 }}>
              🔔 {plan.reminder.email}
            </span>
          )}
          {plan.tasks.length === 0 && <span style={{ fontSize: 10, color: "var(--text-muted)" }}>No tasks yet</span>}
        </div>
        {expanded && plan.tasks.length > 0 && (
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 5 }}>
            {plan.tasks.map(task => (
              <div key={task._id} onClick={() => onToggleTask(plan._id, task._id)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 8, background: task.done ? "rgba(255,255,255,0.06)" : "var(--card-bg)", border: `1px solid ${task.done ? "rgba(255,255,255,0.15)" : "var(--panel-border)"}`, cursor: "pointer" }}>
                <div style={{ width: 16, height: 16, borderRadius: 4, border: `1.5px solid ${task.done ? "#d4d4d4" : "var(--text-muted)"}`, background: task.done ? "#d4d4d4" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 9, color: "#000" }}>{task.done && "✓"}</div>
                <span style={{ flex: 1, fontSize: 12, color: task.done ? "var(--text-muted)" : "var(--text-secondary)", textDecoration: task.done ? "line-through" : "none" }}>{task.title}</span>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: PRIORITIES[task.priority], flexShrink: 0 }} title={task.priority} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function NewPlanForm({ onCreate, onCancel }) {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [targetDate, setTargetDate] = useState("");
  const [taskInput, setTaskInput] = useState("");
  const [tasks, setTasks] = useState([]);
  const [priority, setPriority] = useState("medium");
  const [saving, setSaving] = useState(false);
  const [enableReminder, setEnableReminder] = useState(false);
  const [reminderEmail, setReminderEmail] = useState("");
  const [reminderDaysBefore, setReminderDaysBefore] = useState(1);

  const addTask = () => {
    if (!taskInput.trim()) return;
    setTasks(t => [...t, { title: taskInput.trim(), priority, done: false }]);
    setTaskInput("");
  };

  const handleCreate = async () => {
    if (!subject.trim()) return;
    setSaving(true);
    await onCreate({
      subject: subject.trim(),
      description,
      color,
      targetDate: targetDate || null,
      tasks,
      reminder: enableReminder && reminderEmail.trim()
        ? { email: reminderEmail.trim(), daysBefore: reminderDaysBefore }
        : null,
    }).catch(() => { });
    setSaving(false);
  };

  const inputStyle = { width: "100%", padding: "9px 12px", borderRadius: 8, background: "var(--input-bg)", border: "1px solid var(--panel-border)", color: "var(--text-primary)", fontSize: 13, outline: "none", marginBottom: 8, boxSizing: "border-box" };

  return (
    <div style={{ background: "var(--card-bg)", border: "1px solid rgba(255,255,255,0.22)", borderRadius: 14, padding: "16px" }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#e5e5e5", marginBottom: 12 }}>New Study Plan</div>
      <input placeholder="Subject (e.g. Data Structures)" value={subject} onChange={e => setSubject(e.target.value)} style={inputStyle} />
      <input placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} style={inputStyle} />
      <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} style={{ ...inputStyle, color: "var(--text-muted)", colorScheme: "var(--color-scheme)" }} />
      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        {COLORS.map(c => <div key={c} onClick={() => setColor(c)} style={{ width: 20, height: 20, borderRadius: "50%", background: c, cursor: "pointer", outline: color === c ? `2px solid ${c}` : "none", outlineOffset: 2 }} />)}
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
        <input placeholder="Add a task…" value={taskInput} onChange={e => setTaskInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addTask()} style={{ flex: 1, padding: "8px 10px", borderRadius: 8, background: "var(--input-bg)", border: "1px solid var(--panel-border)", color: "var(--text-primary)", fontSize: 12, outline: "none" }} />
        <select value={priority} onChange={e => setPriority(e.target.value)} style={{ padding: "8px", borderRadius: 8, background: "var(--input-bg)", border: "1px solid var(--panel-border)", color: "var(--text-muted)", fontSize: 11, outline: "none", cursor: "pointer", colorScheme: "var(--color-scheme)" }}>
          <option value="low">Low</option>
          <option value="medium">Med</option>
          <option value="high">High</option>
        </select>
        <button onClick={addTask} style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", color: "#e5e5e5", fontSize: 12, cursor: "pointer", fontWeight: 700 }}>+</button>
      </div>
      {tasks.length > 0 && (
        <div style={{ marginBottom: 10, display: "flex", flexDirection: "column", gap: 3 }}>
          {tasks.map((t, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-muted)" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: PRIORITIES[t.priority] }} />
              <span style={{ flex: 1 }}>{t.title}</span>
              <button onClick={() => setTasks(ts => ts.filter((_, j) => j !== i))} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 12 }}>✕</button>
            </div>
          ))}
        </div>
      )}
      <div style={{ borderTop: "1px solid var(--panel-border)", paddingTop: 10, marginTop: 4, marginBottom: 10 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginBottom: 8 }}>
          <input type="checkbox" checked={enableReminder} onChange={e => setEnableReminder(e.target.checked)} style={{ accentColor: "#ffffff", width: 14, height: 14 }} />
          <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>🔔 Email reminder</span>
        </label>
        {enableReminder && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <input type="email" placeholder="your@email.com" value={reminderEmail} onChange={e => setReminderEmail(e.target.value)} style={{ ...inputStyle, marginBottom: 0 }} />
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, color: "var(--text-muted)", whiteSpace: "nowrap" }}>Remind me</span>
              <select value={reminderDaysBefore} onChange={e => setReminderDaysBefore(Number(e.target.value))} style={{ flex: 1, padding: "6px 8px", borderRadius: 8, background: "var(--input-bg)", border: "1px solid var(--panel-border)", color: "var(--text-secondary)", fontSize: 11, outline: "none", colorScheme: "var(--color-scheme)" }}>
                <option value={1}>1 day before</option>
                <option value={2}>2 days before</option>
                <option value={3}>3 days before</option>
                <option value={7}>1 week before</option>
              </select>
              <span style={{ fontSize: 11, color: "var(--text-muted)", whiteSpace: "nowrap" }}>due date</span>
            </div>
          </div>
        )}
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <button onClick={onCancel} style={{ flex: 1, padding: "9px", borderRadius: 8, background: "transparent", border: "1px solid var(--panel-border)", color: "var(--text-muted)", fontSize: 12, cursor: "pointer" }}>Cancel</button>
        <button onClick={handleCreate} disabled={!subject.trim() || saving} style={{ flex: 2, padding: "9px", borderRadius: 8, background: "linear-gradient(135deg,#ffffff,#e5e5e5)", border: "none", color: "#fff", fontSize: 12, cursor: "pointer", fontWeight: 700, opacity: !subject.trim() || saving ? 0.5 : 1 }}>{saving ? "Creating…" : "Create Plan"}</button>
      </div>
    </div>
  );
}

export default function StudyPlanner({ onClose }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    api.getStudyPlans().then(d => setPlans(d.plans || [])).catch(() => { }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (data) => {
    const d = await api.createStudyPlan(data);
    setPlans(p => [d.plan, ...p]);
    setShowForm(false);
  };

  const handleToggleTask = async (planId, taskId) => {
    const d = await api.toggleTask(planId, taskId).catch(() => null);
    if (d?.plan) setPlans(ps => ps.map(p => p._id === planId ? d.plan : p));
  };

  const handleDelete = async (planId) => {
    await api.deleteStudyPlan(planId).catch(() => { });
    setPlans(ps => ps.filter(p => p._id !== planId));
  };

  const totalTasks = plans.reduce((a, p) => a + p.tasks.length, 0);
  const doneTasks = plans.reduce((a, p) => a + p.tasks.filter(t => t.done).length, 0);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 300, display: "flex", alignItems: "flex-start", justifyContent: "flex-end", backdropFilter: "blur(12px)" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: 400, height: "100vh", background: "var(--panel-bg)", borderLeft: "1px solid var(--panel-border)", display: "flex", flexDirection: "column", animation: "slideInRight 0.25s ease" }}>
        <div style={{ padding: "20px 20px 14px", borderBottom: "1px solid var(--panel-border)", position: "sticky", top: 0, background: "var(--panel-bg)", zIndex: 2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: totalTasks > 0 ? 10 : 0 }}>
            <span style={{ fontSize: 16 }}>📚</span>
            <div style={{ flex: 1, fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>Study Planner</div>
            <button onClick={() => setShowForm(s => !s)} style={{ padding: "6px 12px", borderRadius: 8, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", color: "#e5e5e5", fontSize: 12, cursor: "pointer", fontWeight: 700 }}>{showForm ? "Cancel" : "+ Plan"}</button>
            <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 7, background: "var(--card-bg)", border: "1px solid var(--panel-border)", cursor: "pointer", color: "var(--text-muted)", fontSize: 15 }}>✕</button>
          </div>
          {totalTasks > 0 && <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{doneTasks}/{totalTasks} tasks done across {plans.length} plan{plans.length !== 1 ? "s" : ""}</div>}
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
          {showForm && <NewPlanForm onCreate={handleCreate} onCancel={() => setShowForm(false)} />}
          {loading && <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 13, marginTop: 40 }}>Loading…</div>}
          {!loading && plans.length === 0 && !showForm && (
            <div style={{ textAlign: "center", marginTop: 60, color: "var(--text-muted)" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
              <div style={{ fontSize: 13 }}>No study plans yet</div>
              <div style={{ fontSize: 11, marginTop: 6 }}>Create a plan to track your study goals</div>
            </div>
          )}
          {plans.map(plan => <PlanCard key={plan._id} plan={plan} onToggleTask={handleToggleTask} onDelete={handleDelete} />)}
        </div>
      </div>
    </div>
  );
}