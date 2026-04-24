'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import {
  Key, Database, Info, CheckCircle, XCircle,
  Users, UserPlus, Shield, Trash2, Edit3, UsersRound, Plus, X,
} from 'lucide-react';

/* ─── Types ─── */
interface TeamRef { id: number; name: string }
interface UserRow {
  id: number; email: string; name: string | null; role: string;
  status: string; teamId: number | null; createdAt: string;
  team: TeamRef | null;
}
interface TeamRow {
  id: number; name: string; description: string | null;
  createdAt: string; members: { id: number; email: string; name: string | null; role: string; status: string }[];
  _count: { members: number };
}

/* ─── Tab Button ─── */
function Tab({ label, icon: Icon, active, onClick }: {
  label: string; icon: React.ElementType; active: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold rounded-[var(--radius-sm)] transition-all ${
        active
          ? 'text-[var(--accent)] bg-[var(--accent-soft)]'
          : 'text-[var(--text-3)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)]'
      }`}
    >
      <Icon size={16} />
      {label}
    </button>
  );
}

/* ─── Badge ─── */
function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    admin: 'bg-[rgba(139,92,246,0.1)] text-[#7c3aed]',
    user: 'bg-[var(--accent-soft)] text-[var(--accent)]',
    viewer: 'bg-[var(--surface)] text-[var(--text-3)]',
  };
  return (
    <span className={`inline-block text-[11px] font-bold tracking-wide px-2.5 py-0.5 rounded-[var(--radius-sm)] uppercase ${styles[role] || styles.viewer}`}>
      {role}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-block text-[11px] font-bold tracking-wide px-2.5 py-0.5 rounded-[var(--radius-sm)] uppercase ${
      status === 'active'
        ? 'bg-[var(--success-soft)] text-[var(--success)]'
        : 'bg-[var(--error-soft)] text-[var(--error)]'
    }`}>
      {status}
    </span>
  );
}

/* ─── Modal Wrapper ─── */
function Modal({ open, onClose, title, children }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <h3 className="text-[15px] font-semibold text-[var(--text)]">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-[var(--radius-sm)] hover:bg-[var(--surface-hover)] text-[var(--text-3)]">
            <X size={16} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   System Tab
   ──────────────────────────────────────────────────────────── */
function SystemTab() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* API Status */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-sm)] p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[rgba(139,92,246,0.1)] text-[#7c3aed] flex items-center justify-center">
            <Key size={20} />
          </div>
          <h2 className="text-[15px] font-semibold text-[var(--text)]">API Configuration</h2>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-3)]">Anthropic API Key</span>
            <div className="flex items-center gap-1.5">
              <CheckCircle size={14} className="text-[var(--success)]" />
              <span className="text-[var(--success)] font-medium">Active</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-3)]">Model Tiers</span>
            <span className="text-[var(--text)]">Haiku / Sonnet / Opus</span>
          </div>
        </div>
      </div>

      {/* Database */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-sm)] p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[var(--success-soft)] text-[var(--success)] flex items-center justify-center">
            <Database size={20} />
          </div>
          <h2 className="text-[15px] font-semibold text-[var(--text)]">Database</h2>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--text-3)]">Engine</span>
            <span className="text-[var(--text)]">MySQL 8</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-3)]">ORM</span>
            <span className="text-[var(--text)]">Prisma</span>
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-sm)] p-6 md:col-span-2">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[var(--surface)] text-[var(--text-3)] flex items-center justify-center">
            <Info size={20} />
          </div>
          <h2 className="text-[15px] font-semibold text-[var(--text)]">System</h2>
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--text-3)]">Framework</span>
            <span className="text-[var(--text)]">Next.js 14</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-3)]">Runtime</span>
            <span className="text-[var(--text)]">Node.js</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-3)]">Version</span>
            <span className="inline-block text-[11px] font-bold tracking-wide px-2.5 py-0.5 rounded bg-[var(--surface)] text-[var(--text-3)] uppercase">v3.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Users Tab
   ──────────────────────────────────────────────────────────── */
function UsersTab({ teams }: { teams: TeamRow[] }) {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState<UserRow | null>(null);

  const fetchUsers = useCallback(async () => {
    const res = await fetch('/api/users');
    if (res.ok) setUsers(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this user? This cannot be undone.')) return;
    const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
    if (res.ok) fetchUsers();
  };

  const handleToggleStatus = async (user: UserRow) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    const res = await fetch(`/api/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) fetchUsers();
  };

  if (loading) return <p className="text-sm text-[var(--text-3)]">Loading users...</p>;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-[var(--text-3)]">{users.length} user{users.length !== 1 ? 's' : ''}</p>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-[var(--radius-sm)] text-[13px] font-semibold text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] transition-colors"
        >
          <UserPlus size={15} />
          Create User
        </button>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-sm)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--surface-hover)]">
              <th className="text-left px-4 py-3 font-semibold text-[var(--text-3)] text-[12px] uppercase tracking-wider">User</th>
              <th className="text-left px-4 py-3 font-semibold text-[var(--text-3)] text-[12px] uppercase tracking-wider">Role</th>
              <th className="text-left px-4 py-3 font-semibold text-[var(--text-3)] text-[12px] uppercase tracking-wider">Team</th>
              <th className="text-left px-4 py-3 font-semibold text-[var(--text-3)] text-[12px] uppercase tracking-wider">Status</th>
              <th className="text-right px-4 py-3 font-semibold text-[var(--text-3)] text-[12px] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-hover)]">
                <td className="px-4 py-3">
                  <div className="font-medium text-[var(--text)]">{u.name || '—'}</div>
                  <div className="text-[12px] text-[var(--text-4)]">{u.email}</div>
                </td>
                <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                <td className="px-4 py-3 text-[var(--text-3)]">{u.team?.name || '—'}</td>
                <td className="px-4 py-3"><StatusBadge status={u.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => setEditUser(u)} className="p-1.5 rounded-[var(--radius-sm)] hover:bg-[var(--accent-soft)] text-[var(--text-3)] hover:text-[var(--accent)]" title="Edit">
                      <Edit3 size={14} />
                    </button>
                    <button onClick={() => handleToggleStatus(u)} className="p-1.5 rounded-[var(--radius-sm)] hover:bg-[var(--warning-soft)] text-[var(--text-3)] hover:text-[var(--warning)]" title={u.status === 'active' ? 'Suspend' : 'Activate'}>
                      {u.status === 'active' ? <XCircle size={14} /> : <CheckCircle size={14} />}
                    </button>
                    <button onClick={() => handleDelete(u.id)} className="p-1.5 rounded-[var(--radius-sm)] hover:bg-[var(--error-soft)] text-[var(--text-3)] hover:text-[var(--error)]" title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create User Modal */}
      <CreateUserModal open={showCreate} onClose={() => setShowCreate(false)} teams={teams} onCreated={fetchUsers} />

      {/* Edit User Modal */}
      {editUser && (
        <EditUserModal user={editUser} teams={teams} onClose={() => setEditUser(null)} onUpdated={fetchUsers} />
      )}
    </>
  );
}

/* ─── Create User Modal ─── */
function CreateUserModal({ open, onClose, teams, onCreated }: {
  open: boolean; onClose: () => void; teams: TeamRow[]; onCreated: () => void;
}) {
  const [form, setForm] = useState({ email: '', name: '', password: '', role: 'viewer', teamId: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        teamId: form.teamId ? Number(form.teamId) : null,
      }),
    });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Failed to create user');
      return;
    }

    setForm({ email: '', name: '', password: '', role: 'viewer', teamId: '' });
    onCreated();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Create User">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="px-3 py-2 rounded-[var(--radius-sm)] bg-[var(--error-soft)] border border-[rgba(224,85,85,0.15)] text-[var(--error)] text-[13px]">{error}</div>}
        <div>
          <label className="block text-[12px] font-semibold text-[var(--text-3)] mb-1">Email *</label>
          <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-3 py-2 border border-[var(--border)] rounded-[var(--radius-sm)] text-sm bg-[var(--bg)] text-[var(--text)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)]" />
        </div>
        <div>
          <label className="block text-[12px] font-semibold text-[var(--text-3)] mb-1">Name</label>
          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2 border border-[var(--border)] rounded-[var(--radius-sm)] text-sm bg-[var(--bg)] text-[var(--text)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)]" />
        </div>
        <div>
          <label className="block text-[12px] font-semibold text-[var(--text-3)] mb-1">Password * (min 8 chars)</label>
          <input type="password" required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full px-3 py-2 border border-[var(--border)] rounded-[var(--radius-sm)] text-sm bg-[var(--bg)] text-[var(--text)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)]" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[12px] font-semibold text-[var(--text-3)] mb-1">Role</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-[var(--radius-sm)] text-sm bg-[var(--bg)] text-[var(--text)] focus:border-[var(--accent)] focus:outline-none">
              <option value="viewer">Viewer</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-[var(--text-3)] mb-1">Team</label>
            <select value={form.teamId} onChange={(e) => setForm({ ...form, teamId: e.target.value })}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-[var(--radius-sm)] text-sm bg-[var(--bg)] text-[var(--text)] focus:border-[var(--accent)] focus:outline-none">
              <option value="">No team</option>
              {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        </div>
        <button type="submit" disabled={loading}
          className="w-full px-4 py-2.5 rounded-[var(--radius-sm)] text-[13px] font-semibold text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-colors">
          {loading ? 'Creating...' : 'Create User'}
        </button>
      </form>
    </Modal>
  );
}

/* ─── Edit User Modal ─── */
function EditUserModal({ user, teams, onClose, onUpdated }: {
  user: UserRow; teams: TeamRow[]; onClose: () => void; onUpdated: () => void;
}) {
  const [form, setForm] = useState({
    name: user.name || '',
    role: user.role,
    teamId: user.teamId?.toString() || '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload: Record<string, unknown> = {
      name: form.name,
      role: form.role,
      teamId: form.teamId ? Number(form.teamId) : null,
    };
    if (form.password) payload.password = form.password;

    const res = await fetch(`/api/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Failed to update user');
      return;
    }

    onUpdated();
    onClose();
  };

  return (
    <Modal open={true} onClose={onClose} title={`Edit — ${user.email}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="px-3 py-2 rounded-[var(--radius-sm)] bg-[var(--error-soft)] border border-[rgba(224,85,85,0.15)] text-[var(--error)] text-[13px]">{error}</div>}
        <div>
          <label className="block text-[12px] font-semibold text-[var(--text-3)] mb-1">Name</label>
          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2 border border-[var(--border)] rounded-[var(--radius-sm)] text-sm bg-[var(--bg)] text-[var(--text)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)]" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[12px] font-semibold text-[var(--text-3)] mb-1">Role</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-[var(--radius-sm)] text-sm bg-[var(--bg)] text-[var(--text)] focus:border-[var(--accent)] focus:outline-none">
              <option value="viewer">Viewer</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-[var(--text-3)] mb-1">Team</label>
            <select value={form.teamId} onChange={(e) => setForm({ ...form, teamId: e.target.value })}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-[var(--radius-sm)] text-sm bg-[var(--bg)] text-[var(--text)] focus:border-[var(--accent)] focus:outline-none">
              <option value="">No team</option>
              {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-[12px] font-semibold text-[var(--text-3)] mb-1">New Password (leave blank to keep current)</label>
          <input type="password" minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Min 8 characters"
            className="w-full px-3 py-2 border border-[var(--border)] rounded-[var(--radius-sm)] text-sm bg-[var(--bg)] text-[var(--text)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)]" />
        </div>
        <button type="submit" disabled={loading}
          className="w-full px-4 py-2.5 rounded-[var(--radius-sm)] text-[13px] font-semibold text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-colors">
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </Modal>
  );
}

/* ────────────────────────────────────────────────────────────
   Teams Tab
   ──────────────────────────────────────────────────────────── */
function TeamsTab({ teams, onRefresh }: { teams: TeamRow[]; onRefresh: () => void }) {
  const [showCreate, setShowCreate] = useState(false);
  const [editTeam, setEditTeam] = useState<TeamRow | null>(null);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this team? Members will be unassigned.')) return;
    const res = await fetch(`/api/teams/${id}`, { method: 'DELETE' });
    if (res.ok) onRefresh();
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-[var(--text-3)]">{teams.length} team{teams.length !== 1 ? 's' : ''}</p>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-[var(--radius-sm)] text-[13px] font-semibold text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] transition-colors"
        >
          <Plus size={15} />
          Create Team
        </button>
      </div>

      {teams.length === 0 ? (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-sm)] p-12 text-center">
          <UsersRound size={40} className="mx-auto text-[var(--text-4)] mb-3" />
          <p className="text-sm text-[var(--text-3)]">No teams yet. Create one to start organizing your users.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teams.map((team) => (
            <div key={team.id} className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-sm)] p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-[15px] font-semibold text-[var(--text)]">{team.name}</h3>
                  {team.description && (
                    <p className="text-[12px] text-[var(--text-4)] mt-0.5">{team.description}</p>
                  )}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setEditTeam(team)} className="p-1.5 rounded-[var(--radius-sm)] hover:bg-[var(--accent-soft)] text-[var(--text-3)] hover:text-[var(--accent)]">
                    <Edit3 size={14} />
                  </button>
                  <button onClick={() => handleDelete(team.id)} className="p-1.5 rounded-[var(--radius-sm)] hover:bg-[var(--error-soft)] text-[var(--text-3)] hover:text-[var(--error)]">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <Users size={14} className="text-[var(--text-4)]" />
                <span className="text-[12px] font-medium text-[var(--text-3)]">
                  {team._count.members} member{team._count.members !== 1 ? 's' : ''}
                </span>
              </div>
              {team.members.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {team.members.map((m) => (
                    <span key={m.id} className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded bg-[var(--surface)] text-[var(--text-2)]">
                      {m.name || m.email.split('@')[0]}
                      <RoleBadge role={m.role} />
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Team Modal */}
      <CreateTeamModal open={showCreate} onClose={() => setShowCreate(false)} onCreated={onRefresh} />

      {/* Edit Team Modal */}
      {editTeam && (
        <EditTeamModal team={editTeam} onClose={() => setEditTeam(null)} onUpdated={onRefresh} />
      )}
    </>
  );
}

/* ─── Create Team Modal ─── */
function CreateTeamModal({ open, onClose, onCreated }: {
  open: boolean; onClose: () => void; onCreated: () => void;
}) {
  const [form, setForm] = useState({ name: '', description: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/teams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Failed to create team');
      return;
    }

    setForm({ name: '', description: '' });
    onCreated();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Create Team">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="px-3 py-2 rounded-[var(--radius-sm)] bg-[var(--error-soft)] border border-[rgba(224,85,85,0.15)] text-[var(--error)] text-[13px]">{error}</div>}
        <div>
          <label className="block text-[12px] font-semibold text-[var(--text-3)] mb-1">Team Name *</label>
          <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Engineering"
            className="w-full px-3 py-2 border border-[var(--border)] rounded-[var(--radius-sm)] text-sm bg-[var(--bg)] text-[var(--text)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)]" />
        </div>
        <div>
          <label className="block text-[12px] font-semibold text-[var(--text-3)] mb-1">Description</label>
          <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Optional"
            className="w-full px-3 py-2 border border-[var(--border)] rounded-[var(--radius-sm)] text-sm bg-[var(--bg)] text-[var(--text)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)]" />
        </div>
        <button type="submit" disabled={loading}
          className="w-full px-4 py-2.5 rounded-[var(--radius-sm)] text-[13px] font-semibold text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-colors">
          {loading ? 'Creating...' : 'Create Team'}
        </button>
      </form>
    </Modal>
  );
}

/* ─── Edit Team Modal ─── */
function EditTeamModal({ team, onClose, onUpdated }: {
  team: TeamRow; onClose: () => void; onUpdated: () => void;
}) {
  const [form, setForm] = useState({ name: team.name, description: team.description || '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch(`/api/teams/${team.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Failed to update team');
      return;
    }

    onUpdated();
    onClose();
  };

  return (
    <Modal open={true} onClose={onClose} title={`Edit — ${team.name}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="px-3 py-2 rounded-[var(--radius-sm)] bg-[var(--error-soft)] border border-[rgba(224,85,85,0.15)] text-[var(--error)] text-[13px]">{error}</div>}
        <div>
          <label className="block text-[12px] font-semibold text-[var(--text-3)] mb-1">Team Name</label>
          <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2 border border-[var(--border)] rounded-[var(--radius-sm)] text-sm bg-[var(--bg)] text-[var(--text)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)]" />
        </div>
        <div>
          <label className="block text-[12px] font-semibold text-[var(--text-3)] mb-1">Description</label>
          <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2 border border-[var(--border)] rounded-[var(--radius-sm)] text-sm bg-[var(--bg)] text-[var(--text)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)]" />
        </div>
        <button type="submit" disabled={loading}
          className="w-full px-4 py-2.5 rounded-[var(--radius-sm)] text-[13px] font-semibold text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-colors">
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </Modal>
  );
}

/* ════════════════════════════════════════════════════════════
   Main Settings Page
   ════════════════════════════════════════════════════════════ */
export default function SettingsPage() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as { role?: string })?.role === 'admin';
  const [activeTab, setActiveTab] = useState<'system' | 'users' | 'teams'>('system');
  const [teams, setTeams] = useState<TeamRow[]>([]);

  const fetchTeams = useCallback(async () => {
    const res = await fetch('/api/teams');
    if (res.ok) setTeams(await res.json());
  }, []);

  useEffect(() => {
    if (isAdmin) fetchTeams();
  }, [isAdmin, fetchTeams]);

  return (
    <div className="animate-fade-in flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--text)]">Settings</h1>
        <p className="text-sm text-[var(--text-3)] mt-1">Configuration, user management, and team control.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[var(--border)] pb-px">
        <Tab label="System" icon={Info} active={activeTab === 'system'} onClick={() => setActiveTab('system')} />
        {isAdmin && (
          <>
            <Tab label="Users" icon={Users} active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
            <Tab label="Teams" icon={Shield} active={activeTab === 'teams'} onClick={() => setActiveTab('teams')} />
          </>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === 'system' && <SystemTab />}
      {activeTab === 'users' && isAdmin && <UsersTab teams={teams} />}
      {activeTab === 'teams' && isAdmin && <TeamsTab teams={teams} onRefresh={fetchTeams} />}
    </div>
  );
}
