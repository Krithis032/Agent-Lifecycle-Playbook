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
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`flex items-center gap-2 px-4 py-2.5 font-semibold rounded-lg transition-all ${
        active ? '' : ''
      }`}
      style={{
        fontSize: '13px',
        color: active
          ? 'var(--brand-primary)'
          : isHovered
          ? 'var(--text-primary)'
          : 'var(--text-tertiary)',
        backgroundColor: active
          ? 'var(--brand-soft)'
          : isHovered
          ? 'var(--surface-1)'
          : 'transparent',
      }}
    >
      <Icon size={16} />
      {label}
    </button>
  );
}

/* ─── Badge ─── */
function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, { backgroundColor: string; color: string }> = {
    admin: { backgroundColor: 'rgba(139,92,246,0.1)', color: '#7c3aed' },
    user: { backgroundColor: 'var(--brand-soft)', color: 'var(--brand-primary)' },
    viewer: { backgroundColor: 'var(--surface-elevated)', color: 'var(--text-tertiary)' },
  };
  const style = styles[role] || styles.viewer;

  return (
    <span
      className="inline-block font-bold tracking-wide px-2.5 py-0.5 rounded-lg uppercase"
      style={{ fontSize: '11px', ...style }}
    >
      {role}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className="inline-block font-bold tracking-wide px-2.5 py-0.5 rounded-lg uppercase"
      style={{
        fontSize: '11px',
        backgroundColor: status === 'active' ? 'var(--status-success-soft)' : 'var(--status-error-soft)',
        color: status === 'active' ? 'var(--status-success)' : 'var(--status-error)',
      }}
    >
      {status}
    </span>
  );
}

/* ─── Modal Wrapper ─── */
function Modal({ open, onClose, title, children }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode;
}) {
  const [isHovered, setIsHovered] = useState(false);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="border rounded-2xl w-full max-w-md mx-4"
        style={{ backgroundColor: 'var(--surface-elevated)', borderColor: 'var(--border-default)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: 'var(--border-default)' }}
        >
          <h3 className="font-semibold" style={{ fontSize: '15px', color: 'var(--text-primary)' }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="p-1 rounded-lg"
            style={{
              backgroundColor: isHovered ? 'var(--surface-1)' : 'transparent',
              color: 'var(--text-tertiary)',
            }}
          >
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
      <div
        className="border rounded-lg p-6"
        style={{ backgroundColor: 'var(--surface-elevated)', borderColor: 'var(--border-default)' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(139,92,246,0.1)', color: '#7c3aed' }}
          >
            <Key size={20} />
          </div>
          <h2 className="font-semibold" style={{ fontSize: '15px', color: 'var(--text-primary)' }}>
            API Configuration
          </h2>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span style={{ color: 'var(--text-tertiary)' }}>Anthropic API Key</span>
            <div className="flex items-center gap-1.5">
              <CheckCircle size={14} style={{ color: 'var(--status-success)' }} />
              <span className="font-medium" style={{ color: 'var(--status-success)' }}>Active</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span style={{ color: 'var(--text-tertiary)' }}>Model Tiers</span>
            <span style={{ color: 'var(--text-primary)' }}>Haiku / Sonnet / Opus</span>
          </div>
        </div>
      </div>

      {/* Database */}
      <div
        className="border rounded-lg p-6"
        style={{ backgroundColor: 'var(--surface-elevated)', borderColor: 'var(--border-default)' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'var(--status-success-soft)', color: 'var(--status-success)' }}
          >
            <Database size={20} />
          </div>
          <h2 className="font-semibold" style={{ fontSize: '15px', color: 'var(--text-primary)' }}>
            Database
          </h2>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span style={{ color: 'var(--text-tertiary)' }}>Engine</span>
            <span style={{ color: 'var(--text-primary)' }}>MySQL 8</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: 'var(--text-tertiary)' }}>ORM</span>
            <span style={{ color: 'var(--text-primary)' }}>Prisma</span>
          </div>
        </div>
      </div>

      {/* System Info */}
      <div
        className="border rounded-lg p-6 md:col-span-2"
        style={{ backgroundColor: 'var(--surface-elevated)', borderColor: 'var(--border-default)' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'var(--surface-elevated)', color: 'var(--text-tertiary)' }}
          >
            <Info size={20} />
          </div>
          <h2 className="font-semibold" style={{ fontSize: '15px', color: 'var(--text-primary)' }}>
            System
          </h2>
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="flex justify-between">
            <span style={{ color: 'var(--text-tertiary)' }}>Framework</span>
            <span style={{ color: 'var(--text-primary)' }}>Next.js 14</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: 'var(--text-tertiary)' }}>Runtime</span>
            <span style={{ color: 'var(--text-primary)' }}>Node.js</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: 'var(--text-tertiary)' }}>Version</span>
            <span
              className="inline-block font-bold tracking-wide px-2.5 py-0.5 rounded uppercase"
              style={{
                fontSize: '11px',
                backgroundColor: 'var(--surface-elevated)',
                color: 'var(--text-tertiary)',
              }}
            >
              v3.0
            </span>
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
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

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

  if (loading) return <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Loading users...</p>;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
          {users.length} user{users.length !== 1 ? 's' : ''}
        </p>
        <button
          onClick={() => setShowCreate(true)}
          onMouseEnter={() => setHoveredButton('create-user')}
          onMouseLeave={() => setHoveredButton(null)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white transition-colors"
          style={{
            fontSize: '13px',
            backgroundColor: hoveredButton === 'create-user' ? 'var(--brand-primary)' : 'var(--brand-primary)',
            opacity: hoveredButton === 'create-user' ? 0.9 : 1,
          }}
        >
          <UserPlus size={15} />
          Create User
        </button>
      </div>

      <div
        className="border rounded-lg overflow-hidden"
        style={{ backgroundColor: 'var(--surface-elevated)', borderColor: 'var(--border-default)' }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr
              className="border-b"
              style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--surface-1)' }}
            >
              <th
                className="text-left px-4 py-3 font-semibold uppercase tracking-wider"
                style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}
              >
                User
              </th>
              <th
                className="text-left px-4 py-3 font-semibold uppercase tracking-wider"
                style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}
              >
                Role
              </th>
              <th
                className="text-left px-4 py-3 font-semibold uppercase tracking-wider"
                style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}
              >
                Team
              </th>
              <th
                className="text-left px-4 py-3 font-semibold uppercase tracking-wider"
                style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}
              >
                Status
              </th>
              <th
                className="text-right px-4 py-3 font-semibold uppercase tracking-wider"
                style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const rowKey = `row-${u.id}`;
              return (
                <tr
                  key={u.id}
                  className="border-b last:border-0"
                  style={{ borderColor: 'var(--border-default)' }}
                  onMouseEnter={() => setHoveredButton(rowKey)}
                  onMouseLeave={() => setHoveredButton(null)}
                >
                  <td
                    className="px-4 py-3"
                    style={{ backgroundColor: hoveredButton === rowKey ? 'var(--surface-1)' : 'transparent' }}
                  >
                    <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {u.name || '—'}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-quaternary)' }}>
                      {u.email}
                    </div>
                  </td>
                  <td
                    className="px-4 py-3"
                    style={{ backgroundColor: hoveredButton === rowKey ? 'var(--surface-1)' : 'transparent' }}
                  >
                    <RoleBadge role={u.role} />
                  </td>
                  <td
                    className="px-4 py-3"
                    style={{
                      color: 'var(--text-tertiary)',
                      backgroundColor: hoveredButton === rowKey ? 'var(--surface-1)' : 'transparent',
                    }}
                  >
                    {u.team?.name || '—'}
                  </td>
                  <td
                    className="px-4 py-3"
                    style={{ backgroundColor: hoveredButton === rowKey ? 'var(--surface-1)' : 'transparent' }}
                  >
                    <StatusBadge status={u.status} />
                  </td>
                  <td
                    className="px-4 py-3"
                    style={{ backgroundColor: hoveredButton === rowKey ? 'var(--surface-1)' : 'transparent' }}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setEditUser(u)}
                        onMouseEnter={() => setHoveredButton(`edit-${u.id}`)}
                        onMouseLeave={() => setHoveredButton(null)}
                        className="p-1.5 rounded-lg"
                        title="Edit"
                        style={{
                          backgroundColor: hoveredButton === `edit-${u.id}` ? 'var(--brand-soft)' : 'transparent',
                          color: hoveredButton === `edit-${u.id}` ? 'var(--brand-primary)' : 'var(--text-tertiary)',
                        }}
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(u)}
                        onMouseEnter={() => setHoveredButton(`toggle-${u.id}`)}
                        onMouseLeave={() => setHoveredButton(null)}
                        className="p-1.5 rounded-lg"
                        title={u.status === 'active' ? 'Suspend' : 'Activate'}
                        style={{
                          backgroundColor: hoveredButton === `toggle-${u.id}` ? 'var(--status-warning-soft)' : 'transparent',
                          color: hoveredButton === `toggle-${u.id}` ? 'var(--status-warning)' : 'var(--text-tertiary)',
                        }}
                      >
                        {u.status === 'active' ? <XCircle size={14} /> : <CheckCircle size={14} />}
                      </button>
                      <button
                        onClick={() => handleDelete(u.id)}
                        onMouseEnter={() => setHoveredButton(`delete-${u.id}`)}
                        onMouseLeave={() => setHoveredButton(null)}
                        className="p-1.5 rounded-lg"
                        title="Delete"
                        style={{
                          backgroundColor: hoveredButton === `delete-${u.id}` ? 'var(--status-error-soft)' : 'transparent',
                          color: hoveredButton === `delete-${u.id}` ? 'var(--status-error)' : 'var(--text-tertiary)',
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
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
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [hoveredButton, setHoveredButton] = useState(false);

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
        {error && (
          <div
            className="px-3 py-2 rounded-lg border"
            style={{
              backgroundColor: 'var(--status-error-soft)',
              borderColor: 'rgba(224,85,85,0.15)',
              color: 'var(--status-error)',
              fontSize: '13px',
            }}
          >
            {error}
          </div>
        )}
        <div>
          <label
            className="block font-semibold mb-1"
            style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}
          >
            Email *
          </label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            onFocus={() => setFocusedField('email')}
            onBlur={() => setFocusedField(null)}
            className="w-full px-3 py-2 border rounded-lg text-sm"
            style={{
              borderColor: focusedField === 'email' ? 'var(--border-focus)' : 'var(--border-default)',
              backgroundColor: 'var(--surface-0)',
              color: 'var(--text-primary)',
              outline: 'none',
              boxShadow: focusedField === 'email' ? '0 0 0 2px var(--brand-soft)' : 'none',
            }}
          />
        </div>
        <div>
          <label
            className="block font-semibold mb-1"
            style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}
          >
            Name
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            onFocus={() => setFocusedField('name')}
            onBlur={() => setFocusedField(null)}
            className="w-full px-3 py-2 border rounded-lg text-sm"
            style={{
              borderColor: focusedField === 'name' ? 'var(--border-focus)' : 'var(--border-default)',
              backgroundColor: 'var(--surface-0)',
              color: 'var(--text-primary)',
              outline: 'none',
              boxShadow: focusedField === 'name' ? '0 0 0 2px var(--brand-soft)' : 'none',
            }}
          />
        </div>
        <div>
          <label
            className="block font-semibold mb-1"
            style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}
          >
            Password * (min 8 chars)
          </label>
          <input
            type="password"
            required
            minLength={8}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            onFocus={() => setFocusedField('password')}
            onBlur={() => setFocusedField(null)}
            className="w-full px-3 py-2 border rounded-lg text-sm"
            style={{
              borderColor: focusedField === 'password' ? 'var(--border-focus)' : 'var(--border-default)',
              backgroundColor: 'var(--surface-0)',
              color: 'var(--text-primary)',
              outline: 'none',
              boxShadow: focusedField === 'password' ? '0 0 0 2px var(--brand-soft)' : 'none',
            }}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              className="block font-semibold mb-1"
              style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}
            >
              Role
            </label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              onFocus={() => setFocusedField('role')}
              onBlur={() => setFocusedField(null)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              style={{
                borderColor: focusedField === 'role' ? 'var(--border-focus)' : 'var(--border-default)',
                backgroundColor: 'var(--surface-0)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            >
              <option value="viewer">Viewer</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label
              className="block font-semibold mb-1"
              style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}
            >
              Team
            </label>
            <select
              value={form.teamId}
              onChange={(e) => setForm({ ...form, teamId: e.target.value })}
              onFocus={() => setFocusedField('teamId')}
              onBlur={() => setFocusedField(null)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              style={{
                borderColor: focusedField === 'teamId' ? 'var(--border-focus)' : 'var(--border-default)',
                backgroundColor: 'var(--surface-0)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            >
              <option value="">No team</option>
              {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          onMouseEnter={() => setHoveredButton(true)}
          onMouseLeave={() => setHoveredButton(false)}
          className="w-full px-4 py-2.5 rounded-lg font-semibold text-white disabled:opacity-50 transition-colors"
          style={{
            fontSize: '13px',
            backgroundColor: 'var(--brand-primary)',
            opacity: hoveredButton && !loading ? 0.9 : loading ? 0.5 : 1,
          }}
        >
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
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [hoveredButton, setHoveredButton] = useState(false);

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
        {error && (
          <div
            className="px-3 py-2 rounded-lg border"
            style={{
              backgroundColor: 'var(--status-error-soft)',
              borderColor: 'rgba(224,85,85,0.15)',
              color: 'var(--status-error)',
              fontSize: '13px',
            }}
          >
            {error}
          </div>
        )}
        <div>
          <label
            className="block font-semibold mb-1"
            style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}
          >
            Name
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            onFocus={() => setFocusedField('name')}
            onBlur={() => setFocusedField(null)}
            className="w-full px-3 py-2 border rounded-lg text-sm"
            style={{
              borderColor: focusedField === 'name' ? 'var(--border-focus)' : 'var(--border-default)',
              backgroundColor: 'var(--surface-0)',
              color: 'var(--text-primary)',
              outline: 'none',
              boxShadow: focusedField === 'name' ? '0 0 0 2px var(--brand-soft)' : 'none',
            }}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              className="block font-semibold mb-1"
              style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}
            >
              Role
            </label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              onFocus={() => setFocusedField('role')}
              onBlur={() => setFocusedField(null)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              style={{
                borderColor: focusedField === 'role' ? 'var(--border-focus)' : 'var(--border-default)',
                backgroundColor: 'var(--surface-0)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            >
              <option value="viewer">Viewer</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label
              className="block font-semibold mb-1"
              style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}
            >
              Team
            </label>
            <select
              value={form.teamId}
              onChange={(e) => setForm({ ...form, teamId: e.target.value })}
              onFocus={() => setFocusedField('teamId')}
              onBlur={() => setFocusedField(null)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              style={{
                borderColor: focusedField === 'teamId' ? 'var(--border-focus)' : 'var(--border-default)',
                backgroundColor: 'var(--surface-0)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            >
              <option value="">No team</option>
              {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label
            className="block font-semibold mb-1"
            style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}
          >
            New Password (leave blank to keep current)
          </label>
          <input
            type="password"
            minLength={8}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            onFocus={() => setFocusedField('password')}
            onBlur={() => setFocusedField(null)}
            placeholder="Min 8 characters"
            className="w-full px-3 py-2 border rounded-lg text-sm"
            style={{
              borderColor: focusedField === 'password' ? 'var(--border-focus)' : 'var(--border-default)',
              backgroundColor: 'var(--surface-0)',
              color: 'var(--text-primary)',
              outline: 'none',
              boxShadow: focusedField === 'password' ? '0 0 0 2px var(--brand-soft)' : 'none',
            }}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          onMouseEnter={() => setHoveredButton(true)}
          onMouseLeave={() => setHoveredButton(false)}
          className="w-full px-4 py-2.5 rounded-lg font-semibold text-white disabled:opacity-50 transition-colors"
          style={{
            fontSize: '13px',
            backgroundColor: 'var(--brand-primary)',
            opacity: hoveredButton && !loading ? 0.9 : loading ? 0.5 : 1,
          }}
        >
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
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this team? Members will be unassigned.')) return;
    const res = await fetch(`/api/teams/${id}`, { method: 'DELETE' });
    if (res.ok) onRefresh();
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
          {teams.length} team{teams.length !== 1 ? 's' : ''}
        </p>
        <button
          onClick={() => setShowCreate(true)}
          onMouseEnter={() => setHoveredButton('create-team')}
          onMouseLeave={() => setHoveredButton(null)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white transition-colors"
          style={{
            fontSize: '13px',
            backgroundColor: 'var(--brand-primary)',
            opacity: hoveredButton === 'create-team' ? 0.9 : 1,
          }}
        >
          <Plus size={15} />
          Create Team
        </button>
      </div>

      {teams.length === 0 ? (
        <div
          className="border rounded-lg p-12 text-center"
          style={{ backgroundColor: 'var(--surface-elevated)', borderColor: 'var(--border-default)' }}
        >
          <UsersRound size={40} className="mx-auto mb-3" style={{ color: 'var(--text-quaternary)' }} />
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            No teams yet. Create one to start organizing your users.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teams.map((team) => (
            <div
              key={team.id}
              className="border rounded-lg p-5"
              style={{ backgroundColor: 'var(--surface-elevated)', borderColor: 'var(--border-default)' }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold" style={{ fontSize: '15px', color: 'var(--text-primary)' }}>
                    {team.name}
                  </h3>
                  {team.description && (
                    <p className="mt-0.5" style={{ fontSize: '12px', color: 'var(--text-quaternary)' }}>
                      {team.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setEditTeam(team)}
                    onMouseEnter={() => setHoveredButton(`edit-team-${team.id}`)}
                    onMouseLeave={() => setHoveredButton(null)}
                    className="p-1.5 rounded-lg"
                    style={{
                      backgroundColor: hoveredButton === `edit-team-${team.id}` ? 'var(--brand-soft)' : 'transparent',
                      color: hoveredButton === `edit-team-${team.id}` ? 'var(--brand-primary)' : 'var(--text-tertiary)',
                    }}
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(team.id)}
                    onMouseEnter={() => setHoveredButton(`delete-team-${team.id}`)}
                    onMouseLeave={() => setHoveredButton(null)}
                    className="p-1.5 rounded-lg"
                    style={{
                      backgroundColor: hoveredButton === `delete-team-${team.id}` ? 'var(--status-error-soft)' : 'transparent',
                      color: hoveredButton === `delete-team-${team.id}` ? 'var(--status-error)' : 'var(--text-tertiary)',
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <Users size={14} style={{ color: 'var(--text-quaternary)' }} />
                <span className="font-medium" style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                  {team._count.members} member{team._count.members !== 1 ? 's' : ''}
                </span>
              </div>
              {team.members.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {team.members.map((m) => (
                    <span
                      key={m.id}
                      className="inline-flex items-center gap-1 font-medium px-2 py-1 rounded"
                      style={{
                        fontSize: '11px',
                        backgroundColor: 'var(--surface-elevated)',
                        color: 'var(--text-secondary)',
                      }}
                    >
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
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [hoveredButton, setHoveredButton] = useState(false);

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
        {error && (
          <div
            className="px-3 py-2 rounded-lg border"
            style={{
              backgroundColor: 'var(--status-error-soft)',
              borderColor: 'rgba(224,85,85,0.15)',
              color: 'var(--status-error)',
              fontSize: '13px',
            }}
          >
            {error}
          </div>
        )}
        <div>
          <label
            className="block font-semibold mb-1"
            style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}
          >
            Team Name *
          </label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            onFocus={() => setFocusedField('name')}
            onBlur={() => setFocusedField(null)}
            placeholder="e.g. Engineering"
            className="w-full px-3 py-2 border rounded-lg text-sm"
            style={{
              borderColor: focusedField === 'name' ? 'var(--border-focus)' : 'var(--border-default)',
              backgroundColor: 'var(--surface-0)',
              color: 'var(--text-primary)',
              outline: 'none',
              boxShadow: focusedField === 'name' ? '0 0 0 2px var(--brand-soft)' : 'none',
            }}
          />
        </div>
        <div>
          <label
            className="block font-semibold mb-1"
            style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}
          >
            Description
          </label>
          <input
            type="text"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            onFocus={() => setFocusedField('description')}
            onBlur={() => setFocusedField(null)}
            placeholder="Optional"
            className="w-full px-3 py-2 border rounded-lg text-sm"
            style={{
              borderColor: focusedField === 'description' ? 'var(--border-focus)' : 'var(--border-default)',
              backgroundColor: 'var(--surface-0)',
              color: 'var(--text-primary)',
              outline: 'none',
              boxShadow: focusedField === 'description' ? '0 0 0 2px var(--brand-soft)' : 'none',
            }}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          onMouseEnter={() => setHoveredButton(true)}
          onMouseLeave={() => setHoveredButton(false)}
          className="w-full px-4 py-2.5 rounded-lg font-semibold text-white disabled:opacity-50 transition-colors"
          style={{
            fontSize: '13px',
            backgroundColor: 'var(--brand-primary)',
            opacity: hoveredButton && !loading ? 0.9 : loading ? 0.5 : 1,
          }}
        >
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
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [hoveredButton, setHoveredButton] = useState(false);

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
        {error && (
          <div
            className="px-3 py-2 rounded-lg border"
            style={{
              backgroundColor: 'var(--status-error-soft)',
              borderColor: 'rgba(224,85,85,0.15)',
              color: 'var(--status-error)',
              fontSize: '13px',
            }}
          >
            {error}
          </div>
        )}
        <div>
          <label
            className="block font-semibold mb-1"
            style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}
          >
            Team Name
          </label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            onFocus={() => setFocusedField('name')}
            onBlur={() => setFocusedField(null)}
            className="w-full px-3 py-2 border rounded-lg text-sm"
            style={{
              borderColor: focusedField === 'name' ? 'var(--border-focus)' : 'var(--border-default)',
              backgroundColor: 'var(--surface-0)',
              color: 'var(--text-primary)',
              outline: 'none',
              boxShadow: focusedField === 'name' ? '0 0 0 2px var(--brand-soft)' : 'none',
            }}
          />
        </div>
        <div>
          <label
            className="block font-semibold mb-1"
            style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}
          >
            Description
          </label>
          <input
            type="text"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            onFocus={() => setFocusedField('description')}
            onBlur={() => setFocusedField(null)}
            className="w-full px-3 py-2 border rounded-lg text-sm"
            style={{
              borderColor: focusedField === 'description' ? 'var(--border-focus)' : 'var(--border-default)',
              backgroundColor: 'var(--surface-0)',
              color: 'var(--text-primary)',
              outline: 'none',
              boxShadow: focusedField === 'description' ? '0 0 0 2px var(--brand-soft)' : 'none',
            }}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          onMouseEnter={() => setHoveredButton(true)}
          onMouseLeave={() => setHoveredButton(false)}
          className="w-full px-4 py-2.5 rounded-lg font-semibold text-white disabled:opacity-50 transition-colors"
          style={{
            fontSize: '13px',
            backgroundColor: 'var(--brand-primary)',
            opacity: hoveredButton && !loading ? 0.9 : loading ? 0.5 : 1,
          }}
        >
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
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Settings
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
          Configuration, user management, and team control.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b pb-px" style={{ borderColor: 'var(--border-default)' }}>
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
