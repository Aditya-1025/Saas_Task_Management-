import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { tasksApi } from '../services/api';
import toast from 'react-hot-toast';
import {
  CheckSquare, Plus, Trash2, Edit2, LogOut, Loader2, Search,
  ChevronDown, AlertCircle, Calendar, Flag, CheckCircle2, Clock, Circle
} from 'lucide-react';

// ── helpers ────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending:     { label: 'Pending',     icon: Circle,       color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20' },
  in_progress: { label: 'In Progress', icon: Clock,        color: 'text-blue-400',   bg: 'bg-blue-400/10 border-blue-400/20'   },
  completed:   { label: 'Completed',   icon: CheckCircle2, color: 'text-green-400',  bg: 'bg-green-400/10 border-green-400/20' },
};
const PRIORITY_CONFIG = {
  low:    { label: 'Low',    color: 'text-gray-400',  dot: 'bg-gray-400'  },
  medium: { label: 'Medium', color: 'text-amber-400', dot: 'bg-amber-400' },
  high:   { label: 'High',   color: 'text-red-400',   dot: 'bg-red-400'   },
};

const EMPTY_FORM = { title: '', description: '', priority: 'medium', due_date: '', status: 'pending' };

// ── sub-components ─────────────────────────────────────────────────────────
function TaskCard({ task, onEdit, onDelete, onStatusCycle }) {
  const status = STATUS_CONFIG[task.status] || STATUS_CONFIG.pending;
  const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
  const StatusIcon = status.icon;

  return (
    <div className="card p-4 hover:border-gray-700 transition-all duration-200 group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${status.bg} ${status.color}`}>
              <StatusIcon className="w-3 h-3" />
              {status.label}
            </span>
            <span className={`inline-flex items-center gap-1 text-xs font-medium ${priority.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`}></span>
              {priority.label}
            </span>
          </div>
          <h3 className={`mt-2 font-semibold text-white text-sm leading-snug ${task.status === 'completed' ? 'line-through opacity-60' : ''}`}>
            {task.title}
          </h3>
          {task.description && (
            <p className="text-gray-400 text-xs mt-1 line-clamp-2">{task.description}</p>
          )}
          {task.due_date && (
            <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
              <Calendar className="w-3 h-3" />
              <span>{new Date(task.due_date).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            id={`cycle-status-${task.id}`}
            onClick={() => onStatusCycle(task)}
            title="Cycle status"
            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-indigo-400 transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
          </button>
          <button
            id={`edit-task-${task.id}`}
            onClick={() => onEdit(task)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            id={`delete-task-${task.id}`}
            onClick={() => onDelete(task.id)}
            className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function TaskModal({ task, onClose, onSaved }) {
  const [form, setForm] = useState(task ? { ...task } : EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const isEdit = !!task;

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    setLoading(true);
    try {
      if (isEdit) {
        const { data } = await tasksApi.update(task.id, form);
        onSaved(data.task, 'edit');
        toast.success('Task updated');
      } else {
        const { data } = await tasksApi.create(form);
        onSaved(data.task, 'create');
        toast.success('Task created');
      }
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="card w-full max-w-lg p-6 animate-in fade-in duration-200">
        <h2 className="text-lg font-semibold text-white mb-5">{isEdit ? 'Edit Task' : 'Create New Task'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Title *</label>
            <input id="task-title" name="title" className="input" value={form.title} onChange={handleChange} placeholder="Task title" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <textarea id="task-description" name="description" className="input resize-none" rows={3} value={form.description} onChange={handleChange} placeholder="Optional description..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Priority</label>
              <select id="task-priority" name="priority" className="input" value={form.priority} onChange={handleChange}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
              <select id="task-status" name="status" className="input" value={form.status} onChange={handleChange}>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Due Date</label>
            <input id="task-due-date" name="due_date" type="date" className="input" value={form.due_date || ''} onChange={handleChange} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
            <button id="save-task-btn" type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── main Dashboard ─────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const statusOrder = ['pending', 'in_progress', 'completed'];

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (filterPriority) params.priority = filterPriority;
      if (search) params.search = search;
      const { data } = await tasksApi.getAll(params);
      setTasks(data.tasks);
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterPriority, search]);

  useEffect(() => {
    const t = setTimeout(fetchTasks, 300);
    return () => clearTimeout(t);
  }, [fetchTasks]);

  const handleSaved = (task, mode) => {
    if (mode === 'create') setTasks((p) => [task, ...p]);
    else setTasks((p) => p.map((t) => (t.id === task.id ? task : t)));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await tasksApi.delete(id);
      setTasks((p) => p.filter((t) => t.id !== id));
      toast.success('Task deleted');
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const handleStatusCycle = async (task) => {
    const next = statusOrder[(statusOrder.indexOf(task.status) + 1) % statusOrder.length];
    try {
      const { data } = await tasksApi.update(task.id, { ...task, status: next });
      setTasks((p) => p.map((t) => (t.id === task.id ? data.task : t)));
      toast.success(`Status → ${STATUS_CONFIG[next].label}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  // Summary counts
  const counts = tasks.reduce((acc, t) => ({ ...acc, [t.status]: (acc[t.status] || 0) + 1 }), {});

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Navbar */}
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-600 rounded-lg">
              <CheckSquare className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-white text-lg">TaskFlow</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400 hidden sm:block">👋 {user?.name}</span>
            <button id="logout-btn" onClick={logout} className="btn-ghost text-sm flex items-center gap-1.5 py-1.5 px-3">
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
            const Icon = cfg.icon;
            return (
              <div key={key} className="card p-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg ${cfg.bg}`}>
                  <Icon className={`w-4 h-4 ${cfg.color}`} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{counts[key] || 0}</div>
                  <div className="text-xs text-gray-400">{cfg.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              id="task-search"
              type="text"
              placeholder="Search tasks…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9"
            />
          </div>
          <select id="filter-status" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input w-full sm:w-36">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <select id="filter-priority" value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="input w-full sm:w-36">
            <option value="">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <button id="open-create-task" onClick={() => { setEditingTask(null); setShowModal(true); }} className="btn-primary flex items-center gap-2 whitespace-nowrap">
            <Plus className="w-4 h-4" />
            New Task
          </button>
        </div>

        {/* Task list */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-20">
            <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No tasks found</p>
            <p className="text-gray-600 text-sm mt-1">Create your first task to get started</p>
            <button onClick={() => { setEditingTask(null); setShowModal(true); }} className="btn-primary mt-4 inline-flex items-center gap-2">
              <Plus className="w-4 h-4" /> Create Task
            </button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={(t) => { setEditingTask(t); setShowModal(true); }}
                onDelete={handleDelete}
                onStatusCycle={handleStatusCycle}
              />
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <TaskModal
          task={editingTask}
          onClose={() => setShowModal(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
