'use client';

import { useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  displayName?: string;
  role: 'admin' | 'editor' | 'copywriter';
  createdAt: string | null;
  lastLoginAt: string | null;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    role: 'editor' as 'admin' | 'editor' | 'copywriter',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const resetForm = () => {
    setFormData({ email: '', password: '', displayName: '', role: 'editor' });
    setShowForm(false);
    setEditingUser(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (editingUser) {
        // Update existing user
        const payload: Record<string, unknown> = {
          displayName: formData.displayName,
          role: formData.role,
        };
        if (formData.password) {
          payload.password = formData.password;
        }

        const res = await fetch(`/api/admin/users/${editingUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to update user');
        }
      } else {
        // Create new user
        const res = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to create user');
        }
      }

      resetForm();
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: '',
      displayName: user.displayName || '',
      role: user.role,
    });
    setShowForm(true);
  };

  const handleDelete = async (user: User) => {
    if (!confirm(`Delete user "${user.email}"? This cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete user');
      }

      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  const roleColors = {
    admin: 'bg-purple-500/20 text-purple-400',
    editor: 'bg-blue-500/20 text-blue-400',
    copywriter: 'bg-green-500/20 text-green-400',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-white/60 mt-1">Manage user accounts and permissions</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
        >
          {showForm ? 'Cancel' : '+ Add User'}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-surface rounded-lg p-6 mb-8 border border-white/10">
          <h2 className="text-lg font-semibold text-white mb-4">
            {editingUser ? 'Edit User' : 'New User'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-white/60 text-sm mb-1">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                className="w-full bg-surface-muted border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none disabled:opacity-50"
                required
                disabled={!!editingUser}
              />
            </div>
            <div>
              <label className="block text-white/60 text-sm mb-1">
                {editingUser ? 'New Password (leave blank to keep current)' : 'Password *'}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                className="w-full bg-surface-muted border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none"
                required={!editingUser}
                minLength={6}
              />
            </div>
            <div>
              <label className="block text-white/60 text-sm mb-1">Display Name</label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData((p) => ({ ...p, displayName: e.target.value }))}
                className="w-full bg-surface-muted border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-white/60 text-sm mb-1">Role *</label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    role: e.target.value as 'admin' | 'editor' | 'copywriter',
                  }))
                }
                className="w-full bg-surface-muted border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none"
              >
                <option value="copywriter">Copywriter</option>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="text-sm text-white/40 mb-4">
            <strong>Role permissions:</strong>
            <ul className="mt-2 space-y-1">
              <li><span className="text-purple-400">Admin</span> — Full access to all features including user management</li>
              <li><span className="text-blue-400">Editor</span> — Can manage case studies, testimonials, promotions, and releases</li>
              <li><span className="text-green-400">Copywriter</span> — Can only edit website content (text, images)</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50"
          >
            {saving ? 'Saving...' : editingUser ? 'Update User' : 'Create User'}
          </button>
        </form>
      )}

      {/* Users List */}
      {loading ? (
        <div className="text-white/60">Loading...</div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-lg border border-white/10">
          <p className="text-white/60">No users found</p>
        </div>
      ) : (
        <div className="bg-surface rounded-lg overflow-hidden border border-white/10">
          <table className="w-full">
            <thead className="bg-surface-muted">
              <tr>
                <th className="text-left px-4 py-3 text-white/60 text-sm font-medium">User</th>
                <th className="text-left px-4 py-3 text-white/60 text-sm font-medium">Role</th>
                <th className="text-left px-4 py-3 text-white/60 text-sm font-medium">Last Login</th>
                <th className="text-right px-4 py-3 text-white/60 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-surface-hover transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-white font-medium">
                        {user.displayName || user.email}
                      </p>
                      {user.displayName && (
                        <p className="text-white/40 text-sm">{user.email}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs capitalize ${roleColors[user.role]}`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white/50 text-sm">
                    {user.lastLoginAt
                      ? new Date(user.lastLoginAt).toLocaleDateString()
                      : 'Never'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => handleEdit(user)}
                        className="px-3 py-1 text-sm bg-white/10 text-white rounded hover:bg-white/20 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user)}
                        className="px-3 py-1 text-sm bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
